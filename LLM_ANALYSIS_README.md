# LLM Analysis Feature

This document explains how to use the new LLM analysis feature that generates detailed speech pathology reports using the Gemini API.

## Overview

The LLM analysis feature takes recorded audio with phoneme transcriptions and generates detailed analysis reports that include:
1. Phoneme-level mismatch identification
2. Speech error descriptions
3. Possible diagnoses with confidence scores

## How It Works

1. **Data Collection**: When users record audio, the system:
   - Saves the audio file
   - Transcribes phonemes using Allosaurus
   - Links the recording to a specific sentence with ideal phonemes

2. **Analysis Generation**: The system:
   - Retrieves all recordings with their sentence data
   - Sends ideal vs. recorded phonemes to Gemini API
   - Generates detailed analysis reports
   - Prints results to console and returns JSON

## API Endpoints

### 1. Get All Recordings with Sentences
```
GET /api/recordings/with-sentences
```
Returns all recordings that have phoneme transcriptions with their corresponding sentence data.

### 2. Generate Analysis for All Recordings
```
POST /api/analysis/generate-all
```
Generates LLM analysis for all available recordings and prints detailed reports to the server console.

### 3. Generate Analysis for Specific Recording
```
POST /api/analysis/generate/:recordingId
```
Generates LLM analysis for a specific recording by ID.

## Usage Examples

### Using the Test Script
```bash
# Make sure the server is running first
npm run dev

# In another terminal, run the test script
node test-llm-analysis.js
```

### Using curl
```bash
# Get all recordings with sentences
curl http://127.0.0.1:3000/api/recordings/with-sentences

# Generate analysis for all recordings
curl -X POST http://127.0.0.1:3000/api/analysis/generate-all

# Generate analysis for specific recording
curl -X POST http://127.0.0.1:3000/api/analysis/generate/RECORDING_ID
```

### Using JavaScript/Fetch
```javascript
// Get recordings with sentences
const recordings = await fetch('/api/recordings/with-sentences').then(r => r.json());

// Generate analysis for all recordings
const analysis = await fetch('/api/analysis/generate-all', { method: 'POST' }).then(r => r.json());
```

## Console Output

When you generate analysis, the server console will display formatted reports like this:

```
====================================================================================================
LLM ANALYSIS RESULTS
====================================================================================================

=== ANALYSIS FOR: "Kenny drank a tiny tin of coke" ===
Timestamp: 2024-01-15T10:30:00.000Z

Ideal Phonemes: k ɛ n i d ɹ æ ŋ k ə t a j n i t ə n ʌ v k o w k
Recorded Phonemes: 'k ʌ n iː n t͡ɕ ɨ b̞ ɤ̆ ɳ ʔ ɒ j n iː t̪ʰ iː o t̪ʰ o'

Analysis:
[Detailed analysis from Gemini API including phoneme mismatches, speech errors, and diagnoses]

================================================================================
```

## Data Flow

1. **Recording Session**: User records audio for a sentence
2. **Phoneme Transcription**: Allosaurus transcribes the audio
3. **Storage**: Recording + phonemes + sentence data stored
4. **Analysis Request**: API call triggers LLM analysis
5. **Gemini Processing**: Ideal vs. recorded phonemes sent to Gemini
6. **Report Generation**: Detailed analysis returned and printed

## Configuration

The Gemini API key is currently hardcoded in `server/llmAnalysisService.ts`:
```typescript
private readonly API_KEY = "AIzaSyC59IoS7X-vL-EIdNPSZ31v4lxe4opVvGQ";
```

For production, move this to an environment variable.

## Error Handling

The system includes comprehensive error handling:
- API rate limiting (1 second delay between requests)
- Individual recording failures don't stop batch processing
- Detailed error messages in console and API responses
- Graceful fallback for missing data

## Testing

1. Start the server: `npm run dev`
2. Record some audio through the web interface
3. Run the test script: `node test-llm-analysis.js`
4. Check the server console for detailed analysis reports

## Future Enhancements

- Save analysis results to database
- Export analysis reports as PDF
- Real-time analysis during recording
- Batch processing with progress indicators
- Custom analysis prompts per sentence type
