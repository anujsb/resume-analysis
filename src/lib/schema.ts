import { pgTable, serial, text, timestamp, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { relations } from "drizzle-orm";

// Candidates table
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  resumeUrl: text("resume_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Export candidate models for type safety
export type Candidate = InferSelectModel<typeof candidates>;
export type InsertCandidate = InferInsertModel<typeof candidates>;

// Define candidate relations
export const candidatesRelations = relations(candidates, ({ many }) => ({
  analysisResults: many(analysisResults)
}));

// Define experience levels enum
export const experienceLevels = {
  FRESHER: "fresher", // 0-1 years
  JUNIOR: "junior",   // 1-3 years
  MEDIOCRE: "mediocre", // 3-8 years
  SENIOR: "senior",    // 8+ years
} as const;

export type ExperienceLevel = typeof experienceLevels[keyof typeof experienceLevels];

// Analysis results table
export const analysisResults = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").references(() => candidates.id),
  skills: json("skills").$type<{ skill: string; proficiency: number }[]>(),
  experienceLevel: text("experience_level").$type<ExperienceLevel>(),
  yearsOfExperience: integer("years_of_experience"),
  rawAnalysis: json("raw_analysis").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Export analysis result models for type safety
export type AnalysisResult = InferSelectModel<typeof analysisResults>;
export type InsertAnalysisResult = InferInsertModel<typeof analysisResults>;

// Define analysis results relations
export const analysisResultsRelations = relations(analysisResults, ({ one }) => ({
  candidate: one(candidates, {
    fields: [analysisResults.candidateId],
    references: [candidates.id]
  })
}));