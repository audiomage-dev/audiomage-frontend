import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  userId: integer('user_id').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const audioTracks = pgTable('audio_tracks', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'audio', 'midi', 'ai-generated'
  filePath: text('file_path'),
  metadata: jsonb('metadata'),
  position: integer('position').default(0),
  volume: integer('volume').default(75), // 0-100
  pan: integer('pan').default(50), // 0-100, 50 is center
  muted: boolean('muted').default(false),
  soloed: boolean('soloed').default(false),
  effects: jsonb('effects').default([]),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  projectId: integer('project_id').notNull(),
  isActive: boolean('is_active').default(true),
  lastAccessed: timestamp('last_accessed').defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAudioTrackSchema = createInsertSchema(audioTracks).omit({
  id: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  lastAccessed: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type AudioTrack = typeof audioTracks.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertAudioTrack = z.infer<typeof insertAudioTrackSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
