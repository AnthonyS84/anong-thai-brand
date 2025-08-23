#!/usr/bin/env python
"""
Improved TTS system with Windows as primary, ElevenLabs as premium option
"""

import subprocess
import sys
import os
import tempfile
import requests
from pathlib import Path

def speak_with_windows_tts(message):
    """Use Windows built-in TTS - always available"""
    try:
        # Clean message for speech
        clean_message = message.replace('"', "'").replace('\n', ' ')
        
        ps_command = f'''
        Add-Type -AssemblyName System.Speech;
        $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;
        $speak.Rate = 0;
        $speak.Speak("{clean_message}");
        '''
        
        subprocess.run([
            "powershell", "-Command", ps_command
        ], timeout=30)
        
        return True
        
    except Exception as e:
        print(f"Windows TTS failed: {e}", file=sys.stderr)
        return False

def speak_with_elevenlabs(message):
    """Use ElevenLabs TTS - requires API key and permissions"""
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        api_key = os.getenv('ELEVENLABS_API_KEY')
        if not api_key or api_key == 'your_elevenlabs_api_key_here':
            return False
        
        # Rachel's voice ID (hardcoded to avoid needing voices_read permission)
        voice_id = "21m00Tcm4TlvDq8ikWAM"
        
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key
        }
        
        data = {
            "text": message,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.8,
                "style": 0.2,
                "use_speaker_boost": True
            }
        }
        
        response = requests.post(url, json=data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            # Save audio to temp file and play
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
                temp_file.write(response.content)
                temp_audio_path = temp_file.name
            
            try:
                # Play using multiple methods
                # Method 1: Windows Media Player
                try:
                    subprocess.run([
                        'powershell', '-Command', 
                        f'Add-Type -AssemblyName presentationCore; (new-object Media.MediaPlayer).open("{temp_audio_path}"); Start-Sleep 1; (new-object Media.MediaPlayer).play(); Start-Sleep 5'
                    ], timeout=30)
                    return True
                except:
                    pass
                
                # Method 2: Default audio player
                try:
                    subprocess.run(['powershell', '-Command', f'Invoke-Item "{temp_audio_path}"'], timeout=5)
                    # Give it time to play
                    import time
                    time.sleep(5)
                    return True
                except:
                    pass
                    
                # Method 3: Just save to a known location for manual playback
                desktop_file = os.path.expanduser("~/Desktop/claude_tts.mp3")
                import shutil
                shutil.copy2(temp_audio_path, desktop_file)
                print(f"Audio saved to {desktop_file} - play it manually!", file=sys.stderr)
                return True
                    
            finally:
                # Clean up
                try:
                    os.unlink(temp_audio_path)
                except:
                    pass
        else:
            print(f"ElevenLabs API error: {response.status_code} - {response.text}", file=sys.stderr)
            return False
            
    except Exception as e:
        print(f"ElevenLabs TTS failed: {e}", file=sys.stderr)
        return False

def speak_message(message, voice_name=None):
    """
    Speak a message using the best available TTS
    Priority: ElevenLabs (if working) -> Windows TTS
    """
    
    # Try ElevenLabs first (premium quality)
    if speak_with_elevenlabs(message):
        return True
    
    # Fallback to Windows TTS (always works)
    return speak_with_windows_tts(message)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        message = " ".join(sys.argv[1:])
    else:
        message = "Hello Anthony! Your TTS system is working perfectly for Thai food development!"
    
    success = speak_message(message)
    if success:
        print("TTS completed successfully")
    else:
        print("TTS failed")
