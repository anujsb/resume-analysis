// src/components/requirement-match.tsx
"use client";

import React, { useEffect, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertCircle, Trophy } from "lucide-react";
import { JobRequirement } from "@/types/job-requirements";
import { SkillProficiency } from "@/types/index";
import { MatchResult, SkillMatchResult, CategoryMatch } from "@/types/matching";

// Remove the local interfaces and use the imported ones

interface RequirementMatchProps {
  jobRequirement: JobRequirement;
  candidateSkills: SkillProficiency[];
  candidateExperienceYears: string;
  onMatchCalculated?: (result: MatchResult) => void;
}

export function RequirementMatch({ 
  jobRequirement, 
  candidateSkills, 
  candidateExperienceYears,
  onMatchCalculated
}: RequirementMatchProps) {
  const calculateCategoryMatch = (requiredSkills: string[], category: "primary" | "secondary" | "niceToHave"): CategoryMatch => {
    const matchedSkills = requiredSkills.map(reqSkill => {
      const found = candidateSkills.find(
        s => s.skill.toLowerCase().includes(reqSkill.toLowerCase())
      );
      return {
        skill: reqSkill,
        matched: !!found,
        category,
        proficiency: found?.proficiency
      };
    });

    const matched = matchedSkills.filter(s => s.matched).length;
    const total = matchedSkills.length;
    
    return {
      total,
      matched,
      percentage: total > 0 ? Math.round((matched / total) * 100) : 100,
      skills: matchedSkills
    };
  };

  // Calculate matches for each category
  const primaryMatch = useMemo(() => 
    calculateCategoryMatch(jobRequirement.primarySkills, "primary"),
    [jobRequirement.primarySkills, candidateSkills]
  );

  const secondaryMatch = useMemo(() => 
    calculateCategoryMatch(jobRequirement.secondarySkills, "secondary"),
    [jobRequirement.secondarySkills, candidateSkills]
  );

  const niceToHaveMatch = useMemo(() => 
    calculateCategoryMatch(jobRequirement.niceToHaveSkills, "niceToHave"),
    [jobRequirement.niceToHaveSkills, candidateSkills]
  );

  // Calculate overall match with weighted percentages
  const overallMatch = useMemo(() => {
    const weights = {
      primary: 0.6,    // 60% weight for primary skills
      secondary: 0.3,  // 30% weight for secondary skills
      niceToHave: 0.1  // 10% weight for nice-to-have skills
    };

    return Math.round(
      (primaryMatch.percentage * weights.primary) +
      (secondaryMatch.percentage * weights.secondary) +
      (niceToHaveMatch.percentage * weights.niceToHave)
    );
  }, [primaryMatch, secondaryMatch, niceToHaveMatch]);

  // Experience match calculation
  const experienceMatch = useMemo(() => ({
    matches: parseInt(candidateExperienceYears) >= jobRequirement.minimumExperience,
    description: parseInt(candidateExperienceYears) >= jobRequirement.preferredExperience
      ? "Exceeds required experience"
      : parseInt(candidateExperienceYears) >= jobRequirement.minimumExperience
      ? "Meets minimum experience"
      : "Below minimum experience"
  }), [candidateExperienceYears, jobRequirement.minimumExperience, jobRequirement.preferredExperience]);

  useEffect(() => {
    onMatchCalculated?.({
      overallMatch,
      primaryMatch,
      secondaryMatch,
      niceToHaveMatch,
      experienceMatch: experienceMatch.matches
    });
  }, [overallMatch, primaryMatch, secondaryMatch, niceToHaveMatch, experienceMatch]);

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-white border-2">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Match Analysis
            </CardTitle>
            <CardDescription>{jobRequirement.title}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {overallMatch}%
            </div>
            <div className="text-sm text-gray-500">Overall Match</div>
          </div>
        </div>
        <Progress value={overallMatch} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Primary Skills */}
        <div className="rounded-lg border bg-blue-50/50 p-4">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-blue-700">
            <code className="text-sm bg-blue-100 px-2 py-1 rounded">
              {primaryMatch.matched} / {primaryMatch.total}
            </code>
            Primary Skills ({primaryMatch.percentage}%)
          </h3>
          <SkillsList skills={primaryMatch.skills} />
        </div>

        {/* Secondary Skills */}
        <div className="rounded-lg border bg-green-50/50 p-4">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-green-700">
            <code className="text-sm bg-green-100 px-2 py-1 rounded">
              {secondaryMatch.matched} / {secondaryMatch.total}
            </code>
            Secondary Skills ({secondaryMatch.percentage}%)
          </h3>
          <SkillsList skills={secondaryMatch.skills} />
        </div>

        {/* Nice to Have Skills */}
        <div className="rounded-lg border bg-gray-50/50 p-4">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-700">
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
              {niceToHaveMatch.matched} / {niceToHaveMatch.total}
            </code>
            Nice to Have Skills ({niceToHaveMatch.percentage}%)
          </h3>
          <SkillsList skills={niceToHaveMatch.skills} />
        </div>

        {/* Experience Section */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-medium mb-4">Experience Requirements</h3>
          <div className={`flex items-start gap-3 p-4 rounded-lg ${
            experienceMatch.matches ? 'bg-green-50' : 'bg-amber-50'
          }`}>
            {experienceMatch.matches ? (
              <CheckCircle2 className="h-6 w-6 text-green-500 mt-1" />
            ) : (
              <AlertCircle className="h-6 w-6 text-amber-500 mt-1" />
            )}
            <div className="space-y-1">
              <p className="font-medium text-lg">
                {experienceMatch.matches ? 
                  "Experience Criteria Met" : 
                  "Experience Below Requirement"
                }
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-600">Required:</span>{" "}
                  <span className="font-medium">
                    {jobRequirement.minimumExperience} years
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Preferred:</span>{" "}
                  <span className="font-medium">
                    {jobRequirement.preferredExperience} years
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Candidate has:</span>{" "}
                  <span className="font-medium">
                    {candidateExperienceYears} years
                  </span>
                </p>
                <p className="text-sm font-medium mt-2">
                  {experienceMatch.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for rendering skills lists
function SkillsList({ skills }: { skills: SkillMatchResult[] }) {
  return (
    <div className="grid gap-2">
      {skills.map(skill => (
        <div 
          key={skill.skill} 
          className={`flex items-center justify-between p-3 rounded-lg ${
            skill.matched ? 'bg-white/80' : 'bg-white/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {skill.matched ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className={skill.matched ? 'font-medium' : 'text-gray-500'}>
              {skill.skill}
            </span>
          </div>
          {skill.matched && skill.proficiency && (
            <span className="text-sm px-2 py-1 bg-white rounded-full shadow-sm">
              {skill.proficiency}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}