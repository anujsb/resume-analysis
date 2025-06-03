import { Analysis } from "@/lib/db/schema";

export type CandidateStatus = "new" | "rejected" | "hold" | "selected";

export interface Candidate {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  resumeText: string;
  status: CandidateStatus;
  remark?: string;
  createdAt: string;
}

// Add the missing SkillProficiency type
export interface SkillProficiency {
  skill: string;
  proficiency: string;
}

export interface CandidateAnalysis {
  skills: SkillProficiency[];
  experienceLevel: "fresher" | "junior" | "mediocre" | "senior";
  workExperienceYears: string;
  summary: string;
}

export interface CandidateWithAnalysis {
  candidate: Candidate;
  analysis: CandidateAnalysis;
}

export interface EnhancedProfile {
  professionalProfile: string;
  skillsMatrix: SkillProficiency[];
  fullResume: string;
}

export interface ProfileAnalysis extends Analysis {
  enhancedProfile?: EnhancedProfile;
  skills: SkillProficiency[];
  experienceLevel: "fresher" | "junior" | "mediocre" | "senior";
  workExperienceYears: string;
  summary: string;
}

export interface CandidateWithProfile extends CandidateWithAnalysis {
  analysis: ProfileAnalysis;
}