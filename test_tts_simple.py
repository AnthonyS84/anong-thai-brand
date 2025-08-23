import subprocess
import sys

def test_windows_tts():
    """Test Windows built-in TTS"""
    message = "Hello Anthony! Your Thai green curry recipe is ready. Claude Code hooks are working with text-to-speech!"
    
    try:
        # Use Windows built-in TTS
        ps_command = f"""
        Add-Type -AssemblyName System.Speech;
        $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer;
        $speak.Speak("{message}");
        """
        
        result = subprocess.run([
            "powershell", "-Command", ps_command
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Windows TTS test successful!")
        else:
            print(f"❌ TTS test failed: {result.stderr}")
        
    except Exception as e:
        print(f"❌ TTS test failed: {e}")

if __name__ == "__main__":
    test_windows_tts()
