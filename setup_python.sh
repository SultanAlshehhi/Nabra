#!/bin/bash

# Setup script for Python speech analysis dependencies

echo "Setting up Python speech analysis environment..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "Error: pip3 is not installed. Please install pip3."
    exit 1
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt

# Check if the model file exists
if [ ! -f "speech_issue_model.joblib" ]; then
    echo "Warning: speech_issue_model.joblib not found in current directory."
    echo "Please ensure the model file is in the project root."
fi

# Make the Python script executable
chmod +x speech_analysis_service.py

echo "Setup complete!"
echo ""
echo "To test the speech analysis service, run:"
echo "python3 speech_analysis_service.py <path_to_audio_file>"
