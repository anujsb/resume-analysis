"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface SkillProficiencyProps {
  skill: string;
  proficiency: number;
}

export function SkillProficiency({ skill, proficiency }: SkillProficiencyProps) {
  // Ensure proficiency is between 1-5
  const normalizedProficiency = Math.min(Math.max(proficiency, 1), 5);
  
  // Convert to percentage for progress bar
  const progressValue = (normalizedProficiency / 5) * 100;
  
  // Get proficiency label
  const proficiencyLabel = () => {
    switch(normalizedProficiency) {
      case 1: return "Beginner";
      case 2: return "Basic";
      case 3: return "Intermediate";
      case 4: return "Advanced";
      case 5: return "Expert";
      default: return "Unknown";
    }
  };
  
  // Get badge color based on proficiency
  const getBadgeVariant = () => {
    switch(normalizedProficiency) {
      case 1: return "outline";
      case 2: return "secondary";
      case 3: return "default";
      case 4: return "default";
      case 5: return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">{skill}</span>
        <Badge variant={getBadgeVariant() as any}>{proficiencyLabel()}</Badge>
      </div>
      <Progress value={progressValue} className="h-2" />
    </div>
  );
}