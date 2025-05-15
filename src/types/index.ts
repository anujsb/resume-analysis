// src/types/index.ts
export interface SkillProficiency {
  skill: string;
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface CandidateData {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  resumeText: string;
  createdAt: string;
}

export interface AnalysisData {
  id: number;
  candidateId: number;
  skills: SkillProficiency[];
  experienceLevel: "fresher" | "junior" | "mediocre" | "senior";
  workExperienceYears: string;
  summary: string;
  createdAt: string;
}

export interface CandidateWithAnalysis {
  candidate: CandidateData;
  analysis?: AnalysisData;
}

export interface ResumeAnalysisResult {
  name: string;
  email?: string;
  phone?: string;
  skills: SkillProficiency[];
  experienceYears: number;
  experienceLevel: "fresher" | "junior" | "mediocre" | "senior";
  summary: string;
  rawText: string;
}