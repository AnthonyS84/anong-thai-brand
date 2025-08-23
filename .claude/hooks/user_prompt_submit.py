#!/usr/bin/env python
"""
User Prompt Submit Hook - with Windows TTS support
"""

import argparse
import json
import os
import sys
from pathlib import Path
from datetime import datetime

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv is optional


def announce_task_start(prompt):
    """Announce what Claude is about to work on via TTS."""
    try:
        import subprocess
        
        # Generate intelligent announcement based on prompt content
        announcement = generate_task_announcement(prompt)
        
        # Get TTS script path (same logic as stop hook)
        script_dir = Path(__file__).parent
        tts_dir = script_dir / "utils" / "tts"
        
        # Prioritize Windows TTS for reliability
        if os.name == 'nt':  # Windows
            windows_script = tts_dir / "windows_tts.py"
            if windows_script.exists():
                subprocess.run([
                    "uv", "run", str(windows_script), announcement
                ], 
                capture_output=True,
                timeout=15
                )
    except Exception:
        # Fail silently to not disrupt the main flow
        pass


def generate_task_announcement(prompt):
    """Generate an intelligent announcement based on the user's prompt."""
    prompt_lower = prompt.lower()
    
    # Detect common task types and create contextual announcements
    if any(word in prompt_lower for word in ['create', 'build', 'make', 'generate']):
        return f"I'm about to create something new based on your request. Let me analyze the requirements and get started on building this for you."
    
    elif any(word in prompt_lower for word in ['fix', 'debug', 'error', 'issue', 'problem']):
        return f"I'm about to investigate and resolve the issue you've described. Let me analyze the problem and work on a solution."
    
    elif any(word in prompt_lower for word in ['analyze', 'review', 'check', 'examine']):
        return f"I'm about to perform a detailed analysis of your request. Let me examine everything carefully and provide you with insights."
    
    elif any(word in prompt_lower for word in ['update', 'modify', 'change', 'edit']):
        return f"I'm about to make the modifications you've requested. Let me carefully update everything according to your specifications."
    
    elif any(word in prompt_lower for word in ['delete', 'remove', 'clean']):
        return f"I'm about to safely remove or clean up the items you've specified. Let me handle this carefully for you."
    
    elif any(word in prompt_lower for word in ['explain', 'help', 'how', 'what', 'why']):
        return f"I'm about to provide you with a detailed explanation. Let me gather the information and break this down clearly for you."
    
    elif any(word in prompt_lower for word in ['test', 'run', 'execute']):
        return f"I'm about to run tests and execute the operations you've requested. Let me proceed with the testing process."
    
    else:
        return f"I'm about to work on your request. Let me analyze what needs to be done and get this handled for you."


def log_user_prompt(session_id, input_data):
    """Log user prompt to logs directory."""
    # Ensure logs directory exists
    log_dir = Path("logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / 'user_prompt_submit.json'
    
    # Read existing log data or initialize empty list
    if log_file.exists():
        with open(log_file, 'r') as f:
            try:
                log_data = json.load(f)
            except (json.JSONDecodeError, ValueError):
                log_data = []
    else:
        log_data = []
    
    # Append the entire input data
    log_data.append(input_data)
    
    # Write back to file with formatting
    with open(log_file, 'w') as f:
        json.dump(log_data, f, indent=2)


# Legacy function removed - now handled by manage_session_data


def manage_session_data(session_id, prompt, name_agent=False):
    """Manage session data in the new JSON structure."""
    import subprocess
    
    # Ensure sessions directory exists
    sessions_dir = Path(".claude/data/sessions")
    sessions_dir.mkdir(parents=True, exist_ok=True)
    
    # Load or create session file
    session_file = sessions_dir / f"{session_id}.json"
    
    if session_file.exists():
        try:
            with open(session_file, 'r') as f:
                session_data = json.load(f)
        except (json.JSONDecodeError, ValueError):
            session_data = {"session_id": session_id, "prompts": []}
    else:
        session_data = {"session_id": session_id, "prompts": []}
    
    # Add the new prompt
    session_data["prompts"].append(prompt)
    
    # Generate agent name if requested and not already present
    if name_agent and "agent_name" not in session_data:
        # Try Ollama first (preferred)
        try:
            result = subprocess.run(
                ["uv", "run", ".claude/hooks/utils/llm/ollama.py", "--agent-name"],
                capture_output=True,
                text=True,
                timeout=5  # Shorter timeout for local Ollama
            )
            
            if result.returncode == 0 and result.stdout.strip():
                agent_name = result.stdout.strip()
                # Check if it's a valid name (not an error message)
                if len(agent_name.split()) == 1 and agent_name.isalnum():
                    session_data["agent_name"] = agent_name
                else:
                    raise Exception("Invalid name from Ollama")
        except Exception:
            # Fall back to Anthropic if Ollama fails
            try:
                result = subprocess.run(
                    ["uv", "run", ".claude/hooks/utils/llm/anth.py", "--agent-name"],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                if result.returncode == 0 and result.stdout.strip():
                    agent_name = result.stdout.strip()
                    # Validate the name
                    if len(agent_name.split()) == 1 and agent_name.isalnum():
                        session_data["agent_name"] = agent_name
            except Exception:
                # If both fail, don't block the prompt
                pass
    
    # Save the updated session data
    try:
        with open(session_file, 'w') as f:
            json.dump(session_data, f, indent=2)
    except Exception:
        # Silently fail if we can't write the file
        pass


def validate_prompt(prompt):
    """
    Validate the user prompt for security or policy violations.
    Returns tuple (is_valid, reason).
    """
    # Example validation rules (customize as needed)
    blocked_patterns = [
        # Add any patterns you want to block
        # Example: ('rm -rf /', 'Dangerous command detected'),
    ]
    
    prompt_lower = prompt.lower()
    
    for pattern, reason in blocked_patterns:
        if pattern.lower() in prompt_lower:
            return False, reason
    
    return True, None


def main():
    try:
        # Parse command line arguments
        parser = argparse.ArgumentParser()
        parser.add_argument('--validate', action='store_true', 
                          help='Enable prompt validation')
        parser.add_argument('--log-only', action='store_true',
                          help='Only log prompts, no validation or blocking')
        parser.add_argument('--store-last-prompt', action='store_true',
                          help='Store the last prompt for status line display')
        parser.add_argument('--name-agent', action='store_true',
                          help='Generate an agent name for the session')
        parser.add_argument('--announce', action='store_true',
                          help='Announce what Claude is about to work on via TTS')
        parser.add_argument('--website-context', action='store_true',
                          help='Add website-specific context to prompts')
        parser.add_argument('--thai-food-brand', action='store_true',
                          help='Add Thai food brand context to prompts')
        args = parser.parse_args()
        
        # Read JSON input from stdin
        input_data = json.loads(sys.stdin.read())
        
        # Extract session_id and prompt
        session_id = input_data.get('session_id', 'unknown')
        prompt = input_data.get('prompt', '')
        
        # Log the user prompt
        log_user_prompt(session_id, input_data)
        
        # Manage session data with JSON structure
        if args.store_last_prompt or args.name_agent:
            manage_session_data(session_id, prompt, name_agent=args.name_agent)
        
        # Validate prompt if requested and not in log-only mode
        if args.validate and not args.log_only:
            is_valid, reason = validate_prompt(prompt)
            if not is_valid:
                # Exit code 2 blocks the prompt with error message
                print(f"Prompt blocked: {reason}", file=sys.stderr)
                sys.exit(2)
        
        # Announce what Claude is about to work on (if enabled)
        if args.announce:
            announce_task_start(prompt)
        
        # Add context information (optional)
        # You can print additional context that will be added to the prompt
        # Example: print(f"Current time: {datetime.now()}")
        
        # Success - prompt will be processed
        sys.exit(0)
        
    except json.JSONDecodeError:
        # Handle JSON decode errors gracefully
        sys.exit(0)
    except Exception:
        # Handle any other errors gracefully
        sys.exit(0)


if __name__ == '__main__':
    main()