import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer, { type FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

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

      const { sessionId, sentence, step, duration, fileSize, mimeType } = req.body;
      
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
        audioUrl: `/uploads/audio/${uniqueFilename}`,
        duration: parseInt(duration),
        fileSize: parseInt(fileSize),
        mimeType,
        processingStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      // TODO: Save to database using storage interface
      // await storage.saveRecording(recordingData);

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
      
      // TODO: Fetch recordings from database
      // const recordings = await storage.getRecordingsBySession(sessionId);
      
      res.json({
        success: true,
        recordings: [] // Placeholder
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
      // TODO: Implement database storage for analysis results
      // await storage.updateRecordingAnalysis(recordingId, analysisResult);
      
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

  const httpServer = createServer(app);

  return httpServer;
}
