#!/usr/bin/env python
"""
Stop Hook for Claude Code - with Windows TTS support  
Provides AI-generated completion messages with text-to-speech
"""
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "python-dotenv",
# ]
# ///

import argparse
import json
import os
import sys
import random
import subprocess
from pathlib import Path
from datetime import datetime

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv is optional


def get_completion_messages():
    """Return list of creative and engaging completion messages."""
    return [
        "Task accomplished! I've successfully completed your request and everything is ready to go.",
        "Mission complete! All objectives have been achieved and the results are looking great.",
        "Work finished! I've taken care of everything you asked for and it's all set up perfectly.",
        "Job well done! Your request has been processed successfully and all systems are go.",
        "Task complete! Everything is working smoothly and ready for your next challenge.",
        "All wrapped up! Your project is finished and performing exactly as intended.",
        "Success! I've completed all the work and verified everything is functioning correctly.",
        "Task accomplished! All requirements have been met and the solution is ready to use.",
        "Work complete! Your request has been handled with precision and attention to detail.",
        "All done! Everything is configured properly and working as expected.",
        "Task finished! I've successfully implemented all changes and tested the functionality.",
        "Mission accomplished! Your project is complete and ready for action.",
        "Job complete! All components are in place and functioning harmoniously.",
        "Task completed successfully! Everything has been optimized for peak performance.",
        "All set! Your requirements have been fulfilled and the system is running smoothly."
    ]


def get_tts_script_path():
    """
    Determine which TTS script to use based on available API keys.
    Priority order: ElevenLabs > OpenAI > pyttsx3
    """
    # Get current script directory and construct utils/tts path
    script_dir = Path(__file__).parent
    tts_dir = script_dir / "utils" / "tts"
    
    # Temporarily prioritize Windows TTS to avoid ffmpeg requirement
    if sys.platform == "win32":
        windows_script = tts_dir / "windows_tts.py"
        if windows_script.exists():
            return str(windows_script)
    
    # Check for ElevenLabs API key (second priority - requires ffmpeg)
    if os.getenv('ELEVENLABS_API_KEY'):
        elevenlabs_script = tts_dir / "elevenlabs_tts.py"
        if elevenlabs_script.exists():
            return str(elevenlabs_script)
    
    # Check for OpenAI API key (third priority)
    if os.getenv('OPENAI_API_KEY'):
        openai_script = tts_dir / "openai_tts.py"
        if openai_script.exists():
            return str(openai_script)
    
    # Final fallback to pyttsx3 (no API key required)
    pyttsx3_script = tts_dir / "pyttsx3_tts.py"
    if pyttsx3_script.exists():
        return str(pyttsx3_script)
    
    return None


def get_claude_dynamic_message(transcript_data=None):
    """
    Use LLM services to generate a dynamic completion message based on 
    the actual work that was just completed.
    
    Args:
        transcript_data: Recent conversation context from the session
        
    Returns:
        str: LLM-generated completion message
    """
    try:
        # Get current script directory and construct utils/llm path
        script_dir = Path(__file__).parent
        llm_dir = script_dir / "utils" / "llm"
        
        # Try LLM services in priority order: OpenAI > Anthropic > Ollama
        llm_scripts = [
            ("oai.py", "OPENAI_API_KEY"),
            ("anth.py", "ANTHROPIC_API_KEY"), 
            ("ollama.py", "OLLAMA_HOST")
        ]
        
        for script_name, env_var in llm_scripts:
            # Check if the service is available
            if env_var == "OLLAMA_HOST":
                # For Ollama, just check if script exists (doesn't need API key)
                if not (llm_dir / script_name).exists():
                    continue
            else:
                # For API services, check both script and env var
                if not os.getenv(env_var) or not (llm_dir / script_name).exists():
                    continue
            
            try:
                # Call the LLM script to generate completion message
                script_path = llm_dir / script_name
                result = subprocess.run([
                    "uv", "run", str(script_path), "--completion"
                ], 
                capture_output=True,
                timeout=8,  # 8-second timeout for LLM call
                text=True
                )
                
                if result.returncode == 0 and result.stdout.strip():
                    message = result.stdout.strip()
                    # Validate the message is reasonable
                    if message and len(message) < 200 and "Error" not in message:
                        return message
                        
            except (subprocess.TimeoutExpired, subprocess.SubprocessError):
                # Try next service
                continue
        
        # If all LLM services fail, fall back to enhanced static messages
        messages = get_completion_messages()
        return random.choice(messages)
        
    except Exception:
        # Always have a fallback
        return "Task completed successfully!"

def announce_completion():
    """Announce completion using the best available TTS service."""
    try:
        # Debug: Always log what's happening
        with open("logs/tts_debug.txt", "a") as f:
            f.write(f"announce_completion() called\n")
        
        tts_script = get_tts_script_path()
        
        with open("logs/tts_debug.txt", "a") as f:
            f.write(f"TTS Script found: {tts_script}\n")
        
        if not tts_script:
            with open("logs/tts_debug.txt", "a") as f:
                f.write("No TTS scripts available\n")
            return  # No TTS scripts available
        
        # Get completion message (Claude-generated or fallback)
        completion_message = get_claude_dynamic_message()
        
        # Call the TTS script with the completion message
        result = subprocess.run([
            "uv", "run", tts_script, completion_message
        ], 
        capture_output=True,  # Suppress output
        timeout=10,  # 10-second timeout
        text=True
        )
        
        # Debug: log TTS result (temporary)
        with open("logs/tts_debug.txt", "a") as f:
            f.write(f"TTS Script: {tts_script}\n")
            f.write(f"Message: {completion_message}\n")
            f.write(f"Return code: {result.returncode}\n")
            f.write(f"Stdout: {result.stdout}\n")
            f.write(f"Stderr: {result.stderr}\n")
            f.write("---\n")
        
    except (subprocess.TimeoutExpired, subprocess.SubprocessError, FileNotFoundError):
        # Fail silently if TTS encounters issues
        pass
    except Exception:
        # Fail silently for any other errors
        pass


def main():
    try:
        # Parse command line arguments
        parser = argparse.ArgumentParser()
        parser.add_argument('--chat', action='store_true', help='Copy transcript to chat.json')
        parser.add_argument('--notify', action='store_true', help='Enable TTS completion announcement')
        
        # Debug: Log sys.argv
        with open("logs/tts_debug.txt", "a") as f:
            f.write(f"sys.argv: {sys.argv}\n")
        
        args = parser.parse_args()
        
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)

        # Extract required fields
        session_id = input_data.get("session_id", "")
        stop_hook_active = input_data.get("stop_hook_active", False)

        # Ensure log directory exists
        log_dir = os.path.join(os.getcwd(), "logs")
        os.makedirs(log_dir, exist_ok=True)
        log_path = os.path.join(log_dir, "stop.json")

        # Read existing log data or initialize empty list
        if os.path.exists(log_path):
            with open(log_path, 'r') as f:
                try:
                    log_data = json.load(f)
                except (json.JSONDecodeError, ValueError):
                    log_data = []
        else:
            log_data = []
        
        # Append new data
        log_data.append(input_data)
        
        # Write back to file with formatting
        with open(log_path, 'w') as f:
            json.dump(log_data, f, indent=2)
        
        # Handle --chat switch
        if args.chat and 'transcript_path' in input_data:
            transcript_path = input_data['transcript_path']
            if os.path.exists(transcript_path):
                # Read .jsonl file and convert to JSON array
                chat_data = []
                try:
                    with open(transcript_path, 'r') as f:
                        for line in f:
                            line = line.strip()
                            if line:
                                try:
                                    chat_data.append(json.loads(line))
                                except json.JSONDecodeError:
                                    pass  # Skip invalid lines
                    
                    # Write to logs/chat.json
                    chat_file = os.path.join(log_dir, 'chat.json')
                    with open(chat_file, 'w') as f:
                        json.dump(chat_data, f, indent=2)
                except Exception:
                    pass  # Fail silently

        # Debug: Log flag status
        with open("logs/tts_debug.txt", "a") as f:
            f.write(f"--notify flag: {args.notify}\n")
            f.write(f"About to call announce_completion: {args.notify}\n")
        
        # Always announce completion via TTS (temporarily force enabled for debugging)
        announce_completion()

        sys.exit(0)

    except json.JSONDecodeError:
        # Handle JSON decode errors gracefully
        sys.exit(0)
    except Exception:
        # Handle any other errors gracefully
        sys.exit(0)


if __name__ == "__main__":
    main()
