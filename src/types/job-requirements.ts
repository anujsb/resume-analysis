export interface JobRequirement {
  id?: number; // Make id optional since it won't exist for new requirements
  title: string;
  requiredSkills: string[];
  minimumExperience: number;
  preferredExperience: number;
  experienceLevel: "fresher" | "junior" | "mediocre" | "senior";
}

export interface SkillMatch {
  skill: string;
  matched: boolean;
  proficiencyInResume?: string;
}

export interface RequirementMatchResult {
  overallMatch: number; // percentage
  matchedSkills: SkillMatch[];
  experienceMatch: {
    matches: boolean;
    description: string;
  };
}