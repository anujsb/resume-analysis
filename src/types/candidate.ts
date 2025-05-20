export interface Candidate {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  resumeText: string;
  createdAt: string;
}

export interface CandidateAnalysis {
  skills: Array<{
    skill: string;
    proficiency: "beginner" | "intermediate" | "advanced" | "expert";
  }>;
  experienceLevel: "fresher" | "junior" | "mediocre" | "senior";
  workExperienceYears: string;
  summary: string;
}

export interface CandidateWithAnalysis {
  candidate: Candidate;
  analysis: CandidateAnalysis;
}