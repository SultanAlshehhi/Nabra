#!/usr/bin/env python3
"""
Speech Analysis Service
Processes audio files using the trained speech issue model
"""

import sys
import json
import os
import librosa
import numpy as np
import joblib
import torch
from transformers import Wav2Vec2Processor, Wav2Vec2Model
from pathlib import Path
import subprocess
import tempfile
from allosaurus.app import read_recognizer

class SpeechAnalysisService:
    def __init__(self, model_path="speech_issue_model.joblib"):
        """Initialize the speech analysis service"""
        self.model_path = model_path
        self.processor = None
        self.wav2vec_model = None
        self.classifier = None
        self.allosaurus_model = None
        self._load_models()
    
    def _load_models(self):
        """Load the pre-trained models"""
        try:
            # Load Wav2Vec2 model and processor
            print("Loading Wav2Vec2 model...", file=sys.stderr)
            self.processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
            self.wav2vec_model = Wav2Vec2Model.from_pretrained("facebook/wav2vec2-base-960h")
            
            # Load the trained classifier
            print("Loading speech issue classifier...", file=sys.stderr)
            self.classifier = joblib.load(self.model_path)
            
            # Load Allosaurus model for phoneme transcription
            print("Loading Allosaurus model for phoneme transcription...", file=sys.stderr)
            self.allosaurus_model = read_recognizer()
            
            print("Models loaded successfully!", file=sys.stderr)
        except Exception as e:
            print(f"Error loading models: {e}", file=sys.stderr)
            sys.exit(1)
    
    def convert_webm_to_wav(self, webm_path):
        """Convert WebM file to WAV format using ffmpeg"""
        try:
            # Create temporary WAV file
            temp_wav = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
            temp_wav.close()
            
            # Use ffmpeg to convert WebM to WAV
            cmd = [
                'ffmpeg', '-i', webm_path, 
                '-acodec', 'pcm_s16le', 
                '-ar', '16000', 
                '-ac', '1', 
                '-y',  # Overwrite output file
                temp_wav.name
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception(f"ffmpeg conversion failed: {result.stderr}")
            
            return temp_wav.name
        except Exception as e:
            raise Exception(f"Failed to convert WebM to WAV: {str(e)}")

    def transcribe_phonemes(self, audio_file_path):
        """Transcribe phonemes using Allosaurus"""
        try:
            # Check if file is WebM and convert if necessary
            file_ext = os.path.splitext(audio_file_path)[1].lower()
            temp_wav_path = None
            
            if file_ext == '.webm':
                print("Converting WebM to WAV for phoneme transcription...", file=sys.stderr)
                temp_wav_path = self.convert_webm_to_wav(audio_file_path)
                audio_file_to_load = temp_wav_path
            else:
                audio_file_to_load = audio_file_path
            
            # Transcribe phonemes using Allosaurus
            print("Transcribing phonemes with Allosaurus...", file=sys.stderr)
            phoneme_sequence = self.allosaurus_model.recognize(audio_file_to_load)
            
            # Clean up temporary file if created
            if temp_wav_path and os.path.exists(temp_wav_path):
                try:
                    os.unlink(temp_wav_path)
                except:
                    pass
            
            return {
                "phoneme_sequence": phoneme_sequence,
                "phoneme_count": len(phoneme_sequence.split()) if phoneme_sequence else 0,
                "transcription_method": "allosaurus"
            }
            
        except Exception as e:
            return {
                "error": f"Phoneme transcription failed: {str(e)}",
                "phoneme_sequence": "",
                "phoneme_count": 0,
                "transcription_method": "allosaurus"
            }

    def analyze_audio(self, audio_file_path):
        """
        Analyze audio file for speech issues
        
        Args:
            audio_file_path (str): Path to the audio file
            
        Returns:
            dict: Analysis results including prediction and confidence
        """
        try:
            # Check if file is WebM and convert if necessary
            file_ext = os.path.splitext(audio_file_path)[1].lower()
            temp_wav_path = None
            
            if file_ext == '.webm':
                print("Converting WebM to WAV...", file=sys.stderr)
                temp_wav_path = self.convert_webm_to_wav(audio_file_path)
                audio_file_to_load = temp_wav_path
            else:
                audio_file_to_load = audio_file_path
            
            # Load audio file
            y_audio, sr = librosa.load(audio_file_to_load, sr=16000)
            
            # Extract features using Wav2Vec2
            inputs = self.processor(y_audio, sampling_rate=sr, return_tensors="pt")
            
            with torch.no_grad():
                embeddings = self.wav2vec_model(**inputs).last_hidden_state.mean(dim=1).numpy()
            
            # Make prediction
            prediction = self.classifier.predict(embeddings)[0]
            
            # Get prediction probabilities if available
            if hasattr(self.classifier, 'predict_proba'):
                probabilities = self.classifier.predict_proba(embeddings)[0]
                confidence = float(max(probabilities))
            else:
                confidence = 1.0  # Default confidence if predict_proba not available
            
            # Transcribe phonemes
            print("Starting phoneme transcription...", file=sys.stderr)
            phoneme_result = self.transcribe_phonemes(audio_file_path)
            
            # Determine result
            is_normal = prediction == 0
            result = {
                "prediction": "Normal speech" if is_normal else "Possible speech issue",
                "is_normal": bool(is_normal),
                "confidence": confidence,
                "raw_prediction": int(prediction),
                "audio_duration": len(y_audio) / sr,
                "sample_rate": sr,
                "phoneme_transcription": phoneme_result
            }
            
            return result
            
        except Exception as e:
            return {
                "error": f"Analysis failed: {str(e)}",
                "prediction": "Analysis failed",
                "is_normal": None,
                "confidence": 0.0
            }
        finally:
            # Clean up temporary WAV file if it was created
            if 'temp_wav_path' in locals() and temp_wav_path and os.path.exists(temp_wav_path):
                try:
                    os.unlink(temp_wav_path)
                except:
                    pass

def main():
    """Main function to run the service"""
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python speech_analysis_service.py <audio_file_path>"}))
        sys.exit(1)
    
    audio_file_path = sys.argv[1]
    
    if not os.path.exists(audio_file_path):
        print(json.dumps({"error": f"Audio file not found: {audio_file_path}"}))
        sys.exit(1)
    
    # Initialize service
    service = SpeechAnalysisService()
    
    # Analyze audio
    result = service.analyze_audio(audio_file_path)
    
    # Output result as JSON
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
