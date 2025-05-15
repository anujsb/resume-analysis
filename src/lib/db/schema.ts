// src/lib/db/schema.ts
import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  json,
  integer,
} from "drizzle-orm/pg-core";

// Candidates table
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  resumeText: text("resume_text"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Skills table
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id"),
  name: varchar("name", { length: 255 }),
  proficiency: varchar("proficiency", { length: 50 }), // "beginner", "intermediate", "expert"
});

// Experiences table
export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id"),
  company: varchar("company", { length: 255 }),
  position: varchar("position", { length: 255 }),
  startDate: varchar("start_date", { length: 50 }),
  endDate: varchar("end_date", { length: 50 }),
  duration: integer("duration"), // Duration in months
});

// Analyses table for storing AI analysis results
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id"),
  skillsAnalysis: json("skills_analysis"),
  experienceLevel: varchar("experience_level", { length: 50 }), // "fresher", "junior", "mediocre", "senior"
  totalExperience: integer("total_experience"), // Total experience in months
  analysisDate: timestamp("analysis_date").defaultNow(),
});

// Relations
export const candidateRelations = relations(candidates, ({ many }) => ({
  skills: many(skills),
  experiences: many(experiences),
  analyses: many(analyses),
}));

export const skillRelations = relations(skills, ({ one }) => ({
  candidate: one(candidates, {
    fields: [skills.candidateId],
    references: [candidates.id],
  }),
}));

export const experienceRelations = relations(experiences, ({ one }) => ({
  candidate: one(candidates, {
    fields: [experiences.candidateId],
    references: [candidates.id],
  }),
}));

export const analysisRelations = relations(analyses, ({ one }) => ({
  candidate: one(candidates, {
    fields: [analyses.candidateId],
    references: [candidates.id],
  }),
}));