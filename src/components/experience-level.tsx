"use client";

import { ExperienceLevel as ExperienceLevelType } from "@/lib/schema";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface ExperienceLevelProps {
  level: ExperienceLevelType;
  years: number;
}

export function ExperienceLevel({ level, years }: ExperienceLevelProps) {
  // Get badge styling based on experience level
  const getBadgeVariant = () => {
    switch(level) {
      case "fresher": return "outline";
      case "junior": return "secondary";
      case "mediocre": return "default";
      case "senior": return "destructive";
      default: return "outline";
    }
  };

  // Get display label for experience level
  const getLevelLabel = () => {
    switch(level) {
      case "fresher": return "Fresher (0-1 years)";
      case "junior": return "Junior (1-3 years)";
      case "mediocre": return "Mid-level (3-8 years)";
      case "senior": return "Senior (8+ years)";
      default: return "Unknown";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium">Experience Category</span>
          <Badge variant={getBadgeVariant() as any} className="text-sm capitalize">
            {level}
          </Badge>
        </div>
        <p className="text-gray-500 text-sm">{getLevelLabel()}</p>
      </div>
      
      <div className="flex items-center mt-4 p-3 bg-gray-50 rounded-md">
        <Clock className="h-5 w-5 mr-2 text-gray-600" />
        <span className="font-medium">
          {years} {years === 1 ? 'year' : 'years'} of total work experience
        </span>
      </div>
    </div>
  );
}