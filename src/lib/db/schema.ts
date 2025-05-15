// src/lib/db/schema.ts
import { serial, text, timestamp, pgTable, jsonb } from "drizzle-orm/pg-core";

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  resumeText: text("resume_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  candidateId: serial("candidate_id").references(() => candidates.id).notNull(),
  skills: jsonb("skills").notNull(), // Array of {skill: string, proficiency: string}
  experienceLevel: text("experience_level").notNull(), // "fresher", "junior", "mediocre", "senior"
  workExperienceYears: text("work_experience_years").notNull(), // String representation for flexibility
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types for TypeScript
export type Candidate = typeof candidates.$inferSelect;
export type NewCandidate = typeof candidates.$inferInsert;

export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;