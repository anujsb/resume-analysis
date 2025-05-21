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

// Add MatchResult interface
interface MatchResult {
  overallMatch: number;
  skillsMatch: number;
  experienceMatch: boolean;
  matchedSkills: Array<{
    skill: string;
    matched: boolean;
    proficiency?: string;
  }>;
}

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
  // Move calculations into useMemo to prevent recalculations
  const matchedSkills = useMemo(() => {
    return jobRequirement.requiredSkills.map(reqSkill => {
      const found = candidateSkills.find(
        s => s.skill.toLowerCase().includes(reqSkill.toLowerCase())
      );
      return {
        skill: reqSkill,
        matched: !!found,
        proficiency: found?.proficiency
      };
    });
  }, [jobRequirement.requiredSkills, candidateSkills]);

  const matchPercentage = useMemo(() => {
    return Math.round(
      (matchedSkills.filter(s => s.matched).length / matchedSkills.length) * 100
    );
  }, [matchedSkills]);

  const experienceYears = parseInt(candidateExperienceYears);
  const experienceMatch = useMemo(() => ({
    matches: experienceYears >= jobRequirement.minimumExperience,
    description: experienceYears >= jobRequirement.preferredExperience
      ? "Exceeds required experience"
      : experienceYears >= jobRequirement.minimumExperience
      ? "Meets minimum experience"
      : "Below minimum experience"
  }), [experienceYears, jobRequirement.minimumExperience, jobRequirement.preferredExperience]);

  // Call onMatchCalculated only when relevant values change
  useEffect(() => {
    const result: MatchResult = {
      overallMatch: matchPercentage,
      skillsMatch: matchedSkills.filter(s => s.matched).length / matchedSkills.length,
      experienceMatch: experienceMatch.matches,
      matchedSkills
    };
    onMatchCalculated?.(result);
  }, [matchPercentage, matchedSkills, experienceMatch.matches]);

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
              {matchPercentage}%
            </div>
            <div className="text-sm text-gray-500">Overall Match</div>
          </div>
        </div>
        <Progress value={matchPercentage} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Skills Section */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <code className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
              {matchedSkills.filter(s => s.matched).length} / {matchedSkills.length}
            </code>
            Required Skills Matched
          </h3>
          
          <div className="grid gap-2">
            {matchedSkills.map(skill => (
              <div 
                key={skill.skill} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  skill.matched ? 'bg-green-50' : 'bg-red-50'
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
                {skill.matched && (
                  <span className="text-sm px-2 py-1 bg-white rounded-full shadow-sm">
                    {skill.proficiency}
                  </span>
                )}
              </div>
            ))}
          </div>
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