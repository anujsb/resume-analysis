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
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
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