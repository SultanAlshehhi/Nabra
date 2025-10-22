import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateRecordingAnalysis(recordingId: string, analysisResults: any): Promise<void>;
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
}

export const storage = new MemStorage();
