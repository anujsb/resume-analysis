// export interface JobRequirement {
//   id?: number;
//   title: string;
//   primarySkills: string[];
//   secondarySkills: string[];
//   niceToHaveSkills: string[];
//   minimumExperience: number;
//   preferredExperience: number;
//   experienceLevel: "fresher" | "junior" | "mediocre" | "senior";
// }


export type ExperienceLevel = "fresher" | "junior" | "mediocre" | "senior";
export interface JobRequirement {
  id?: number;
  title: string;
  primarySkills: string[];
  secondarySkills: string[];
  niceToHaveSkills: string[];
  minimumExperience: number;
  preferredExperience: number;
  experienceLevel: ExperienceLevel;
}

export interface SkillMatch {
  skill: string;
  category: "primary" | "secondary" | "niceToHave";
  matched: boolean;
  proficiencyInResume?: string;
}

export interface RequirementMatchResult {
  overallMatch: number;
  primaryMatch: {
    total: number;
    matched: number;
    percentage: number;
    skills: SkillMatch[];
  };
  secondaryMatch: {
    total: number;
    matched: number;
    percentage: number;
    skills: SkillMatch[];
  };
  niceToHaveMatch: {
    total: number;
    matched: number;
    percentage: number;
    skills: SkillMatch[];
  };
  experienceMatch: {
    matches: boolean;
    description: string;
  };
}
