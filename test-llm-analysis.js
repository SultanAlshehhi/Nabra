#!/usr/bin/env node

/**
 * Test script for LLM Analysis functionality
 * 
 * This script demonstrates how to:
 * 1. Check available recordings with sentences
 * 2. Generate LLM analysis for all recordings
 * 3. Generate analysis for a specific recording
 */

const BASE_URL = 'http://127.0.0.1:3000';

async function makeRequest(endpoint, method = 'GET', body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    throw error;
  }
}

async function testLLMAnalysis() {
  console.log('🧪 Testing LLM Analysis Functionality\n');
  
  try {
    // 1. Check available recordings with sentences
    console.log('1️⃣ Checking available recordings with sentences...');
    const recordingsResponse = await makeRequest('/api/recordings/with-sentences');
    console.log(`   Found ${recordingsResponse.count} recordings with phoneme transcriptions\n`);
    
    if (recordingsResponse.count === 0) {
      console.log('❌ No recordings found. Please record some audio first to test the analysis.');
      console.log('   Go to http://127.0.0.1:3000 and record some sentences.\n');
      return;
    }
    
    // Display available recordings
    console.log('📋 Available recordings:');
    recordingsResponse.recordings.forEach((recording, index) => {
      console.log(`   ${index + 1}. "${recording.sentence}"`);
      console.log(`      ID: ${recording.id}`);
      console.log(`      Ideal: ${recording.idealPhoneme}`);
      console.log(`      Recorded: ${recording.phonemeSequence}`);
      console.log('');
    });
    
    // 2. Generate analysis for all recordings
    console.log('2️⃣ Generating LLM analysis for all recordings...');
    console.log('   (This will also print detailed analysis to the server console)');
    
    const allAnalysisResponse = await makeRequest('/api/analysis/generate-all', 'POST');
    console.log(`   ✅ Generated analysis for ${allAnalysisResponse.count} recordings\n`);
    
    // 3. Generate analysis for the first recording (if any exist)
    if (recordingsResponse.recordings.length > 0) {
      const firstRecording = recordingsResponse.recordings[0];
      console.log(`3️⃣ Generating analysis for specific recording: "${firstRecording.sentence}"`);
      
      const specificAnalysisResponse = await makeRequest(`/api/analysis/generate/${firstRecording.id}`, 'POST');
      console.log('   ✅ Generated specific analysis\n');
    }
    
    console.log('🎉 LLM Analysis test completed successfully!');
    console.log('\n📝 Note: Detailed analysis results are printed to the server console.');
    console.log('   Check your server terminal to see the full analysis reports.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Make sure the server is running on http://127.0.0.1:3000');
    console.log('   - Ensure you have recorded some audio with phoneme transcriptions');
    console.log('   - Check that the Gemini API key is valid');
  }
}

// Run the test
testLLMAnalysis();
