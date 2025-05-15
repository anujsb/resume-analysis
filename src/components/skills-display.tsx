// src/app/components/skills-display.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SkillProficiency } from "@/lib/utils/ai-helpers";

interface SkillsDisplayProps {
  skills: SkillProficiency[];
}

export function SkillsDisplay({ skills }: SkillsDisplayProps) {
  // Sort skills by proficiency level
  const sortedSkills = [...skills].sort((a, b) => {
    const proficiencyValue = {
      expert: 3,
      intermediate: 2,
      beginner: 1,
    };
    return proficiencyValue[b.proficiency] - proficiencyValue[a.proficiency];
  });

  // Group skills by proficiency
  const expertSkills = sortedSkills.filter((skill) => skill.proficiency === "expert");
  const intermediateSkills = sortedSkills.filter((skill) => skill.proficiency === "intermediate");
  const beginnerSkills = sortedSkills.filter((skill) => skill.proficiency === "beginner");

  // Helper function to get progress value based on proficiency
  const getProgressValue = (proficiency: string): number => {
    switch (proficiency) {
      case "expert":
        return 100;
      case "intermediate":
        return 65;
      case "beginner":
        return 30;
      default:
        return 0;
    }
  };

  // Helper function to get color based on proficiency
  const getProgressColor = (proficiency: string): string => {
    switch (proficiency) {
      case "expert":
        return "bg-green-600";
      case "intermediate":
        return "bg-blue-500";
      case "beginner":
        return "bg-amber-500";
      default:
        return "";
    }
  };

  const renderSkillItem = (skill: SkillProficiency) => (
    <div key={skill.skill} className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="font-medium">{skill.skill}</span>
        <span className="text-sm text-gray-500 capitalize">{skill.proficiency}</span>
      </div>
      <Progress 
        value={getProgressValue(skill.proficiency)} 
        className={`h-2 ${getProgressColor(skill.proficiency)}`} 
      />
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Skills Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedSkills.length === 0 ? (
          <p className="text-gray-500">No skills identified</p>
        ) : (
          <div className="space-y-6">
            {expertSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Expert Skills</h3>
                {expertSkills.map(renderSkillItem)}
              </div>
            )}
            
            {intermediateSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Intermediate Skills</h3>
                {intermediateSkills.map(renderSkillItem)}
              </div>
            )}
            
            {beginnerSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Beginner Skills</h3>
                {beginnerSkills.map(renderSkillItem)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}