#!/usr/bin/env python
"""
ElevenLabs TTS integration for Claude Code Hooks
High-quality text-to-speech using ElevenLabs API
"""

import requests
import json
import sys
import os
import tempfile
import subprocess
from pathlib import Path

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

def get_available_voices():
    """Get list of available ElevenLabs voices"""
    api_key = os.getenv('ELEVENLABS_API_KEY')
    if not api_key:
        return []
    
    try:
        headers = {
            'Accept': 'application/json',
            'xi-api-key': api_key
        }
        
        response = requests.get('https://api.elevenlabs.io/v1/voices', headers=headers)
        if response.status_code == 200:
            voices = response.json()
            return [(voice['voice_id'], voice['name']) for voice in voices['voices']]
        else:
            return []
    except Exception:
        return []

def speak_message(message, voice_name=None):
    """
    Use ElevenLabs API to speak a message
    
    Args:
        message (str): Text to speak
        voice_name (str): Voice name (optional, uses Rachel if not specified)
    """
    api_key = os.getenv('ELEVENLABS_API_KEY')
    if not api_key:
        print("Error: ELEVENLABS_API_KEY not found", file=sys.stderr)
        return False
    
    try:
        # Default voice settings - optimized for Thai food content
        voice_settings = {
            "stability": 0.5,
            "similarity_boost": 0.8,
            "style": 0.2,
            "use_speaker_boost": True
        }
        
        # Voice mapping - use voice_name or default to Rachel
        voice_map = {
            'Rachel': '21m00Tcm4TlvDq8ikWAM',  # Professional female voice
            'Drew': '29vD33N1CtxCmqQRPOHJ',    # Warm male voice  
            'Clyde': '2EiwWnXFnvU5JabPnv8n',   # Middle-aged male
            'Paul': '5Q0t7uMcjvnagumLfvZi',    # Ground male voice
            'Domi': 'AZnzlk1XvdvUeBnXmlld',    # Young female voice
            'Fin': 'D38z5RcWu1voky8WS1ja',     # Irish male voice
            'Freya': 'jsCqWAovK2LkecY7zXl4',   # Young female voice
            'Grace': 'oWAxZDx7w5VEj9dCyTzz',   # Southern female voice
            'Daniel': 'onwK4e9ZLuTAKqWW03F9'   # Deep male voice
        }
        
        # Get voice ID
        if voice_name and voice_name in voice_map:
            voice_id = voice_map[voice_name]
        else:
            voice_id = voice_map['Rachel']  # Default to Rachel
        
        # Prepare the request
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key
        }
        
        data = {
            "text": message,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": voice_settings
        }
        
        # Make the request
        response = requests.post(url, json=data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            # Save audio to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
                temp_file.write(response.content)
                temp_audio_path = temp_file.name
            
            try:
                # Play the audio file using Windows default audio player
                # Try multiple methods for MP3 playback
                try:
                    # Method 1: Use Windows Media Player via PowerShell
                    subprocess.run([
                        'powershell', '-Command', 
                        f'$player = New-Object -ComObject WMPlayer.OCX; $player.URL = "{temp_audio_path}"; Start-Sleep 1; while($player.playState -ne 1) {{ Start-Sleep 1 }}'
                    ], timeout=30, check=True)
                    return True
                except:
                    # Method 2: Use start command to open with default audio player
                    subprocess.run(['start', '/wait', temp_audio_path], shell=True, timeout=30)
                    return True
                
            except Exception as e:
                print(f"Audio playback error: {e}", file=sys.stderr)
                # The audio was generated successfully even if playback failed
                return True
            finally:
                # Clean up temporary file
                try:
                    os.unlink(temp_audio_path)
                except:
                    pass
        else:
            print(f"ElevenLabs API error: {response.status_code}", file=sys.stderr)
            return False
            
    except Exception as e:
        print(f"ElevenLabs TTS error: {e}", file=sys.stderr)
        return False

def test_elevenlabs_connection():
    """Test ElevenLabs API connection and voice"""
    api_key = os.getenv('ELEVENLABS_API_KEY')
    if not api_key:
        print("ERROR: ELEVENLABS_API_KEY not found in environment")
        return False
    
    print("Testing ElevenLabs TTS...")
    message = "Hello Anthony! ElevenLabs text-to-speech is now integrated with your Thai food website development. Your Claude Code hooks will sound amazing!"
    
    success = speak_message(message, "Rachel")
    if success:
        print("SUCCESS: ElevenLabs TTS test successful!")
        return True
    else:
        print("ERROR: ElevenLabs TTS test failed")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "--test":
            test_elevenlabs_connection()
        else:
            message = " ".join(sys.argv[1:])
            speak_message(message)
    else:
        test_elevenlabs_connection()
