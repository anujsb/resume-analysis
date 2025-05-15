import { ExperienceLevel } from "@/lib/schema";

export interface Candidate {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  resumeUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  skill: string;
  proficiency: number; // 1-5 scale
}

export interface AnalysisResult {
  id: number;
  candidateId: number;
  skills: Skill[];
  experienceLevel: ExperienceLevel;
  yearsOfExperience: number;
  rawAnalysis: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeAnalysisResponse {
  skills: { skill: string; proficiency: number }[];
  experienceLevel: ExperienceLevel; // Updated to match the expected type
  yearsOfExperience: number;
  candidateName?: string; // Add this property
  candidateEmail?: string; // Add this property
  candidatePhone?: string; // Add this property
  rawAnalysis: Record<string, any>;
}