import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sentence: text("sentence").notNull(),
  step: integer("step").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sentences = pgTable("sentences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sentenceText: text("sentence_text").notNull(),
  idealPhoneme: text("ideal_phoneme").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recordings = pgTable("recordings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id),
  sentenceId: varchar("sentence_id").notNull().references(() => sentences.id),
  audioUrl: text("audio_url").notNull(), // URL to stored audio file
  audioBlob: text("audio_blob"), // Base64 encoded audio data (for small files)
  duration: integer("duration"), // Duration in milliseconds
  fileSize: integer("file_size"), // File size in bytes
  mimeType: text("mime_type").notNull().default('audio/webm'),
  processingStatus: text("processing_status").default('pending'), // pending, processing, completed, failed
  analysisResults: json("analysis_results"), // Store speech analysis results
  phonemeTranscription: json("phoneme_transcription"), // Store phoneme transcription results
  phonemeSequence: text("phoneme_sequence"), // Raw phoneme sequence from Allosaurus
  phonemeAlignment: json("phoneme_alignment"), // Time-aligned phoneme data
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  sentence: true,
  step: true,
});

export const insertSentenceSchema = createInsertSchema(sentences).pick({
  sentenceText: true,
  idealPhoneme: true,
});

export const insertRecordingSchema = createInsertSchema(recordings).pick({
  sessionId: true,
  audioUrl: true,
  audioBlob: true,
  duration: true,
  fileSize: true,
  mimeType: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSentence = z.infer<typeof insertSentenceSchema>;
export type Sentence = typeof sentences.$inferSelect;
