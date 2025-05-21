// src/lib/db/schema.ts
import { serial, text, timestamp, pgTable, jsonb, integer } from "drizzle-orm/pg-core";

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

export const jobRequirements = pgTable("job_requirements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  primarySkills: jsonb("primary_skills").notNull(), // Array of strings
  secondarySkills: jsonb("secondary_skills").notNull(), // Array of strings
  niceToHaveSkills: jsonb("nice_to_have_skills").notNull(), // Array of strings
  minimumExperience: integer("minimum_experience").notNull(),
  preferredExperience: integer("preferred_experience").notNull(),
  experienceLevel: text("experience_level").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types for TypeScript
export type Candidate = typeof candidates.$inferSelect;
export type NewCandidate = typeof candidates.$inferInsert;

export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;

export type JobRequirement = typeof jobRequirements.$inferSelect;
export type NewJobRequirement = typeof jobRequirements.$inferInsert;