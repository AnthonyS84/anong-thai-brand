#!/usr/bin/env python
"""
Debug TTS Audio Playback
Test different audio playback methods
"""

import subprocess
import sys
import os
import tempfile
import time

def test_windows_tts():
    """Test Windows built-in TTS - should work immediately"""
    print("Testing Windows built-in TTS...")
    
    message = "Hello Anthony! This is Windows TTS working for your Thai food website."
    
    try:
        ps_command = f'''
        Add-Type -AssemblyName System.Speech;
        $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;
        $speak.Speak("{message}");
        '''
        
        result = subprocess.run([
            "powershell", "-Command", ps_command
        ], timeout=15)
        
        print("Windows TTS completed successfully")
        return True
        
    except Exception as e:
        print(f"Windows TTS failed: {e}")
        return False

def test_elevenlabs_api():
    """Test ElevenLabs API without audio playback"""
    print("Testing ElevenLabs API connection...")
    
    try:
        import requests
        from dotenv import load_dotenv
        load_dotenv()
        
        api_key = os.getenv('ELEVENLABS_API_KEY')
        if not api_key:
            print("ERROR: No ElevenLabs API key found")
            return False
        
        # Test API connection
        headers = {
            'Accept': 'application/json',
            'xi-api-key': api_key
        }
        
        response = requests.get('https://api.elevenlabs.io/v1/voices', headers=headers, timeout=10)
        
        if response.status_code == 200:
            voices = response.json()
            print(f"SUCCESS: Connected to ElevenLabs API. Found {len(voices['voices'])} voices.")
            return True
        else:
            print(f"ERROR: ElevenLabs API returned status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"ElevenLabs API test failed: {e}")
        return False

def test_elevenlabs_tts_generation():
    """Test ElevenLabs TTS generation and save to file"""
    print("Testing ElevenLabs TTS generation...")
    
    try:
        import requests
        from dotenv import load_dotenv
        load_dotenv()
        
        api_key = os.getenv('ELEVENLABS_API_KEY')
        if not api_key:
            print("ERROR: No ElevenLabs API key found")
            return False
        
        # Rachel's voice ID
        voice_id = "21m00Tcm4TlvDq8ikWAM"
        
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key
        }
        
        data = {
            "text": "Hello Anthony! This is Rachel from ElevenLabs. Your Thai food website development is enhanced with premium voice assistance!",
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.8
            }
        }
        
        print("Generating audio with ElevenLabs...")
        response = requests.post(url, json=data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            # Save to desktop for easy access
            audio_file = os.path.expanduser("~/Desktop/elevenlabs_test.mp3")
            with open(audio_file, "wb") as f:
                f.write(response.content)
            
            print(f"SUCCESS: Audio saved to {audio_file}")
            print("You can double-click this file to test audio playback")
            
            # Try to play it automatically
            try:
                subprocess.run(["start", audio_file], shell=True)
                print("Attempted to play audio file automatically")
            except Exception as e:
                print(f"Automatic playback failed: {e}")
            
            return True
        else:
            print(f"ERROR: ElevenLabs TTS generation failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"ElevenLabs TTS generation failed: {e}")
        return False

def main():
    print("=== TTS Audio Playback Debug ===")
    print()
    
    # Test 1: Windows built-in TTS
    windows_works = test_windows_tts()
    print()
    
    # Test 2: ElevenLabs API connection
    api_works = test_elevenlabs_api()
    print()
    
    # Test 3: ElevenLabs TTS generation
    if api_works:
        tts_works = test_elevenlabs_tts_generation()
    else:
        tts_works = False
    
    print()
    print("=== SUMMARY ===")
    print(f"Windows TTS: {'✓ Working' if windows_works else '✗ Failed'}")
    print(f"ElevenLabs API: {'✓ Working' if api_works else '✗ Failed'}")
    print(f"ElevenLabs TTS: {'✓ Working' if tts_works else '✗ Failed'}")
    
    if tts_works:
        print()
        print("Check your desktop for 'elevenlabs_test.mp3' - try playing it manually!")

if __name__ == "__main__":
    main()
