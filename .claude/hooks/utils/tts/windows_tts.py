#!/usr/bin/env python
"""
Windows TTS for Claude Code Hooks
Text-to-speech functionality using Windows built-in speech synthesis
"""

import subprocess
import sys
import os
from pathlib import Path

def speak_message(message, voice_name=None):
    """
    Use Windows built-in TTS to speak a message
    
    Args:
        message (str): Text to speak
        voice_name (str): Voice name (optional, uses default if not specified)
    """
    try:
        # Clean the message for speech
        clean_message = message.replace('"', "'").replace('\n', ' ')
        
        # Create PowerShell command for TTS
        if voice_name:
            ps_command = f"""
            Add-Type -AssemblyName System.Speech;
            $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;
            $speak.SelectVoice("{voice_name}");
            $speak.Speak("{clean_message}");
            """
        else:
            ps_command = f"""
            Add-Type -AssemblyName System.Speech;
            $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;
            $speak.Speak("{clean_message}");
            """
        
        # Execute TTS
        result = subprocess.run([
            "powershell", "-Command", ps_command
        ], capture_output=True, text=True, timeout=30)
        
        return result.returncode == 0
        
    except Exception as e:
        # Fail silently to not disrupt Claude Code
        return False

def get_available_voices():
    """Get list of available Windows TTS voices"""
    try:
        ps_command = """
        Add-Type -AssemblyName System.Speech;
        $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;
        $speak.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }
        """
        
        result = subprocess.run([
            "powershell", "-Command", ps_command
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            voices = [voice.strip() for voice in result.stdout.strip().split('\n') if voice.strip()]
            return voices
        else:
            return []
            
    except Exception:
        return []

if __name__ == "__main__":
    if len(sys.argv) > 1:
        message = " ".join(sys.argv[1:])
        speak_message(message)
    else:
        # Test message
        test_message = "Hello Anthony! Your Claude Code hooks are now enhanced with text-to-speech for your Thai food website!"
        speak_message(test_message)
        print("TTS test completed")
