import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import { sentenceService } from '../client/src/lib/sentences';

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateRecordingAnalysis(recordingId: string, analysisResults: any): Promise<void>;
  getAllRecordingsWithSentences(): Promise<any[]>;
  getRecordingsBySession(sessionId: string): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private recordings: Map<string, any>;

  constructor() {
    this.users = new Map();
    this.recordings = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateRecordingAnalysis(recordingId: string, analysisResults: any): Promise<void> {
    // Store analysis results including phoneme transcription
    const recording = this.recordings.get(recordingId) || {};
    recording.analysisResults = analysisResults;
    recording.phonemeTranscription = analysisResults.phoneme_transcription;
    recording.phonemeSequence = analysisResults.phoneme_transcription?.phoneme_sequence || '';
    recording.processingStatus = 'completed';
    recording.updatedAt = new Date().toISOString();
    
    this.recordings.set(recordingId, recording);
    
    // Log the phoneme transcription for debugging
    console.log(`Saved phoneme transcription for ${recordingId}:`, recording.phonemeSequence);
  }

  async getAllRecordingsWithSentences(): Promise<any[]> {
    const recordings = Array.from(this.recordings.values());
    const recordingsWithSentences = [];
    
    for (const recording of recordings) {
      if (recording.sentenceId && recording.phonemeSequence) {
        // Get sentence data
        const sentenceData = await sentenceService.getSentenceById(recording.sentenceId);
        if (sentenceData) {
          recordingsWithSentences.push({
            id: recording.id,
            sessionId: recording.sessionId,
            sentenceId: recording.sentenceId,
            sentence: sentenceData.sentenceText,
            phonemeSequence: recording.phonemeSequence,
            idealPhoneme: sentenceData.idealPhoneme,
            createdAt: recording.createdAt || new Date().toISOString()
          });
        }
      }
    }
    
    return recordingsWithSentences;
  }

  async getRecordingsBySession(sessionId: string): Promise<any[]> {
    const allRecordings = await this.getAllRecordingsWithSentences();
    return allRecordings.filter(recording => recording.sessionId === sessionId);
  }
}

export const storage = new MemStorage();
