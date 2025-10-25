import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer, { type FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { sentenceService } from '../client/src/lib/sentences';
import { llmAnalysisService } from './llmAnalysisService';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for audio file uploads
const upload = multer({
  dest: 'uploads/audio/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Function to run speech analysis using Python service
async function runSpeechAnalysis(audioFilePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    console.log(`Starting speech analysis for file: ${audioFilePath}`);
    
    // Check if file exists
    if (!fs.existsSync(audioFilePath)) {
      reject(new Error(`Audio file not found: ${audioFilePath}`));
      return;
    }

    const pythonScriptPath = path.join(__dirname, '..', 'speech_analysis_service.py');
    console.log(`Python script path: ${pythonScriptPath}`);
    
    const pythonProcess = spawn('python3', [pythonScriptPath, audioFilePath]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      const dataStr = data.toString();
      console.log(`Python stdout: ${dataStr}`);
      output += dataStr;
    });

    pythonProcess.stderr.on('data', (data) => {
      const dataStr = data.toString();
      console.log(`Python stderr: ${dataStr}`);
      errorOutput += dataStr;
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code: ${code}`);
      console.log(`Output: ${output}`);
      console.log(`Error output: ${errorOutput}`);
      
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (parseError) {
          console.error(`Failed to parse JSON: ${parseError}`);
          console.error(`Raw output: ${output}`);
          reject(new Error(`Failed to parse analysis result: ${parseError}`));
        }
      } else {
        reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
      }
    });

    pythonProcess.on('error', (error) => {
      console.error(`Python process error: ${error.message}`);
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Audio recording endpoints
  app.post('/api/recordings', upload.single('audio'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
      }

      const { sessionId, sentenceId, sentence, step, duration, fileSize, mimeType } = req.body;
      
      // Validate sentence exists
      const sentenceData = await sentenceService.getSentenceById(sentenceId);
      if (!sentenceData) {
        return res.status(400).json({ error: 'Invalid sentence ID' });
      }

      // Generate unique filename
      const fileExtension = path.extname(req.file.originalname) || '.webm';
      const uniqueFilename = `${randomUUID()}${fileExtension}`;
      const finalPath = path.resolve('uploads/audio', uniqueFilename);

      // Ensure uploads directory exists
      const uploadsDir = path.resolve('uploads/audio');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Move file to final location
      fs.renameSync(req.file.path, finalPath);

      // Store recording metadata in database
      const recordingId = randomUUID();
      const recordingData = {
        id: recordingId,
        sessionId,
        sentenceId, // Add this field
        audioUrl: `/uploads/audio/${uniqueFilename}`,
        duration: parseInt(duration),
        fileSize: parseInt(fileSize),
        mimeType,
        processingStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      // Save to in-memory storage
      (storage as any).recordings.set(recordingId, recordingData);

      res.json({
        success: true,
        recordingId,
        audioUrl: recordingData.audioUrl,
        audioFilePath: finalPath, // Include the file path for processing
        message: 'Recording uploaded successfully'
      });

    } catch (error) {
      console.error('Error uploading recording:', error);
      res.status(500).json({ error: 'Failed to upload recording' });
    }
  });

  // Get recordings for a session
  app.get('/api/recordings/session/:sessionId', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      
      const recordings = await storage.getRecordingsBySession(sessionId);
      
      res.json({
        success: true,
        recordings: recordings
      });
    } catch (error) {
      console.error('Error fetching recordings:', error);
      res.status(500).json({ error: 'Failed to fetch recordings' });
    }
  });

  // Process audio for speech analysis
  app.post('/api/recordings/:recordingId/process', async (req: Request, res: Response) => {
    try {
      const { recordingId } = req.params;
      const { audioFilePath } = req.body;
      
      if (!audioFilePath) {
        return res.status(400).json({ error: 'Audio file path is required' });
      }

      // Check if file exists
      if (!fs.existsSync(audioFilePath)) {
        return res.status(404).json({ error: 'Audio file not found' });
      }

      // Run speech analysis
      const analysisResult = await runSpeechAnalysis(audioFilePath);
      
      if (analysisResult.error) {
        return res.status(500).json({ 
          error: 'Speech analysis failed', 
          details: analysisResult.error 
        });
      }

      // Save analysis results to database
      await storage.updateRecordingAnalysis(recordingId, analysisResult);
      
      // Log phoneme transcription for debugging
      if (analysisResult.phoneme_transcription) {
        console.log(`Phoneme transcription for ${recordingId}:`, analysisResult.phoneme_transcription.phoneme_sequence);
      }

      res.json({
        success: true,
        analysis: analysisResult,
        recordingId
      });
    } catch (error) {
      console.error('Error processing recording:', error);
      res.status(500).json({ 
        error: 'Failed to process recording',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get phoneme transcription for a recording
  app.get('/api/recordings/:recordingId/phonemes', async (req: Request, res: Response) => {
    try {
      const { recordingId } = req.params;
      
      // TODO: Fetch from database - for now using in-memory storage
      const recording = (storage as any).recordings?.get(recordingId);
      
      if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
      }

      res.json({
        success: true,
        recordingId,
        phonemeTranscription: recording.phonemeTranscription,
        phonemeSequence: recording.phonemeSequence,
        processingStatus: recording.processingStatus
      });
    } catch (error) {
      console.error('Error fetching phoneme transcription:', error);
      res.status(500).json({ error: 'Failed to fetch phoneme transcription' });
    }
  });

  // Serve audio files
  app.get('/uploads/audio/:filename', (req: Request, res: Response) => {
    const filename = req.params.filename;
    const filePath = path.join('uploads/audio', filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(path.resolve(filePath));
    } else {
      res.status(404).json({ error: 'Audio file not found' });
    }
  });

  // Add endpoint to get all sentences
  app.get('/api/sentences', async (req: Request, res: Response) => {
    try {
      const sentences = await sentenceService.getAllSentences();
      res.json({
        success: true,
        sentences
      });
    } catch (error) {
      console.error('Error fetching sentences:', error);
      res.status(500).json({ error: 'Failed to fetch sentences' });
    }
  });

  // Get all recordings with their sentence data
  app.get('/api/recordings/with-sentences', async (req: Request, res: Response) => {
    try {
      const recordings = await storage.getAllRecordingsWithSentences();
      res.json({
        success: true,
        recordings,
        count: recordings.length
      });
    } catch (error) {
      console.error('Error fetching recordings with sentences:', error);
      res.status(500).json({ error: 'Failed to fetch recordings with sentences' });
    }
  });

  // Generate LLM analysis for all recordings
  app.post('/api/analysis/generate-all', async (req: Request, res: Response) => {
    try {
      console.log('Starting LLM analysis for all recordings...');
      
      // Get all recordings with sentence data
      const recordings = await storage.getAllRecordingsWithSentences();
      
      if (recordings.length === 0) {
        return res.json({
          success: true,
          message: 'No recordings found with phoneme transcriptions',
          analyses: []
        });
      }

      console.log(`Found ${recordings.length} recordings to analyze`);
      
      // Generate analyses for all recordings
      const analyses = await llmAnalysisService.generateAllAnalyses(recordings);
      
      // Print analyses to console
      console.log('\n' + '='.repeat(100));
      console.log('LLM ANALYSIS RESULTS');
      console.log('='.repeat(100));
      
      analyses.forEach((analysis, index) => {
        console.log(llmAnalysisService.formatAnalysisForConsole(analysis));
      });
      
      console.log(`\nCompleted analysis for ${analyses.length} recordings`);
      console.log('='.repeat(100));

      res.json({
        success: true,
        message: `Generated analysis for ${analyses.length} recordings`,
        analyses: analyses,
        count: analyses.length
      });
    } catch (error) {
      console.error('Error generating LLM analysis:', error);
      res.status(500).json({ 
        error: 'Failed to generate LLM analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Generate ONE combined LLM analysis for a session (across all its recordings)
  app.post('/api/analysis/generate-session/:sessionId', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      // Get all recordings with sentence data, then filter by session
      const recordings = await storage.getRecordingsBySession(sessionId);
      
      if (!recordings.length) {
        return res.json({
          success: true,
          message: 'No recordings found for this session',
          analysis: null
        });
      }

      const combined = await llmAnalysisService.generateCombinedAnalysisForSession(sessionId, recordings);

      // Print compact marker to server console
      console.log(`\n=== Combined LLM Analysis for Session ${sessionId} @ ${combined.timestamp} ===\n`);
      console.log(combined.analysis);
      console.log('\n=== End Combined Analysis ===\n');

      res.json({
        success: true,
        analysis: combined
      });
    } catch (error) {
      console.error('Error generating combined LLM analysis:', error);
      res.status(500).json({ 
        error: 'Failed to generate combined LLM analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Generate LLM analysis for a specific recording
  app.post('/api/analysis/generate/:recordingId', async (req: Request, res: Response) => {
    try {
      const { recordingId } = req.params;
      
      // Get all recordings and find the specific one
      const recordings = await storage.getAllRecordingsWithSentences();
      const recording = recordings.find(r => r.id === recordingId);
      
      if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
      }

      console.log(`Generating LLM analysis for recording ${recordingId}...`);
      
      // Generate analysis
      const analysis = await llmAnalysisService.generateAnalysis(recording);
      
      // Print to console
      console.log('\n' + '='.repeat(100));
      console.log('LLM ANALYSIS RESULT');
      console.log('='.repeat(100));
      console.log(llmAnalysisService.formatAnalysisForConsole(analysis));
      console.log('='.repeat(100));

      res.json({
        success: true,
        analysis: analysis
      });
    } catch (error) {
      console.error('Error generating LLM analysis:', error);
      res.status(500).json({ 
        error: 'Failed to generate LLM analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
