import { insertRecordingSchema, insertSessionSchema } from '@shared/schema';

export interface AudioRecording {
  id: string;
  sessionId: string;
  sentenceId: string; // Add this field
  audioBlob: Blob;
  duration: number;
  fileSize: number;
  mimeType: string;
  sentence: string; // Keep for backward compatibility
  step: number;
}

export interface SessionData {
  id: string;
  userId: string;
  sentence: string;
  step: number;
  recordings: AudioRecording[];
}

class AudioStorageService {
  private dbName = 'NabraAudioDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('userId', 'userId', { unique: false });
          sessionStore.createIndex('step', 'step', { unique: false });
        }

        // Create recordings store
        if (!db.objectStoreNames.contains('recordings')) {
          const recordingStore = db.createObjectStore('recordings', { keyPath: 'id' });
          recordingStore.createIndex('sessionId', 'sessionId', { unique: false });
          recordingStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async saveRecording(recording: AudioRecording): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recordings'], 'readwrite');
      const store = transaction.objectStore('recordings');
      
      const recordingData = {
        ...recording,
        createdAt: new Date().toISOString(),
        processingStatus: 'pending'
      };

      const request = store.add(recordingData);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getRecordingsBySession(sessionId: string): Promise<AudioRecording[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recordings'], 'readonly');
      const store = transaction.objectStore('recordings');
      const index = store.index('sessionId');
      const request = index.getAll(sessionId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveSession(sessionData: SessionData): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      
      const sessionRecord = {
        id: sessionData.id,
        userId: sessionData.userId,
        sentence: sessionData.sentence,
        step: sessionData.step,
        createdAt: new Date().toISOString()
      };

      const request = store.add(sessionRecord);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async uploadToServer(recording: AudioRecording): Promise<{ recordingId: string; audioFilePath: string }> {
    try {
      const formData = new FormData();
      formData.append('audio', recording.audioBlob, `recording-${recording.id}.webm`);
      formData.append('sessionId', recording.sessionId);
      formData.append('sentenceId', recording.sentenceId); // Add this line
      formData.append('sentence', recording.sentence);
      formData.append('step', recording.step.toString());
      formData.append('duration', recording.duration.toString());
      formData.append('fileSize', recording.fileSize.toString());
      formData.append('mimeType', recording.mimeType);

      const response = await fetch('/api/recordings', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        recordingId: result.recordingId,
        audioFilePath: result.audioFilePath
      };
    } catch (error) {
      console.error('Failed to upload recording:', error);
      throw error;
    }
  }

  async processRecording(recordingId: string, audioFilePath: string): Promise<any> {
    try {
      const response = await fetch(`/api/recordings/${recordingId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioFilePath }),
      });

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.analysis;
    } catch (error) {
      console.error('Failed to process recording:', error);
      throw error;
    }
  }

  async convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:audio/webm;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async getAudioUrl(recording: AudioRecording): Promise<string> {
    return URL.createObjectURL(recording.audioBlob);
  }

  // Clean up old recordings (older than 30 days)
  async cleanupOldRecordings(): Promise<void> {
    if (!this.db) await this.init();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['recordings'], 'readwrite');
      const store = transaction.objectStore('recordings');
      const request = store.getAll();

      request.onsuccess = () => {
        const recordings = request.result;
        const oldRecordings = recordings.filter(
          (recording: any) => new Date(recording.createdAt) < thirtyDaysAgo
        );

        const deletePromises = oldRecordings.map((recording: any) => {
          return new Promise<void>((resolveDelete, rejectDelete) => {
            const deleteRequest = store.delete(recording.id);
            deleteRequest.onsuccess = () => resolveDelete();
            deleteRequest.onerror = () => rejectDelete(deleteRequest.error);
          });
        });

        Promise.all(deletePromises)
          .then(() => resolve())
          .catch(reject);
      };

      request.onerror = () => reject(request.error);
    });
  }
}

export const audioStorage = new AudioStorageService();

// Initialize on module load
audioStorage.init().catch(console.error);
