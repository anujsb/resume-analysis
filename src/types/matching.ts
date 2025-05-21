export interface SkillMatchResult {
  skill: string;
  matched: boolean;
  category: "primary" | "secondary" | "niceToHave";
  proficiency?: string;
}

export interface CategoryMatch {
  total: number;
  matched: number;
  percentage: number;
  skills: SkillMatchResult[];
}

export interface MatchResult {
  overallMatch: number;
  primaryMatch: CategoryMatch;
  secondaryMatch: CategoryMatch;
  niceToHaveMatch: CategoryMatch;
  experienceMatch: boolean;
}