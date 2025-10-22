import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer, { type FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

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
      const finalPath = path.join('uploads/audio', uniqueFilename);

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

  // Process audio for phonetic analysis
  app.post('/api/recordings/:recordingId/process', async (req: Request, res: Response) => {
    try {
      const { recordingId } = req.params;
      
      // TODO: Implement audio processing logic
      // This would integrate with speech recognition APIs
      // For now, return mock analysis
      const mockAnalysis = {
        phonemes: [
          { symbol: '/ˈkɛni/', word: 'Kenny', isCorrect: true },
          { symbol: '/dræŋk/', word: 'drank', isCorrect: false },
        ],
        overallScore: 85,
        recommendations: ['Focus on the "dr" sound in "drank"']
      };

      res.json({
        success: true,
        analysis: mockAnalysis
      });
    } catch (error) {
      console.error('Error processing recording:', error);
      res.status(500).json({ error: 'Failed to process recording' });
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
