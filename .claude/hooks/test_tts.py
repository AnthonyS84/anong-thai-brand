#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# ///

import subprocess
import sys

def test_windows_tts():
    """Test Windows built-in TTS"""
    message = "Hello Anthony! Your Thai green curry recipe is ready. Claude Code hooks are working with text-to-speech!"
    
    try:
        # Use Windows built-in TTS
        ps_command = f'''
        Add-Type -AssemblyName System.Speech;
        $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;
        $speak.Speak("{message}");
        '''
        
        subprocess.run([
            "powershell", "-Command", ps_command
        ], check=True)
        
        print("✅ Windows TTS test successful!")
        
    except Exception as e:
        print(f"❌ TTS test failed: {e}")

if __name__ == "__main__":
    test_windows_tts()
