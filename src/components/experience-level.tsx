// src/app/components/experience-level.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExperienceInfo } from "@/lib/utils/ai-helpers";

interface ExperienceLevelProps {
  experienceLevel: "fresher" | "junior" | "mediocre" | "senior";
  totalExperience: number; // in months
  experiences?: ExperienceInfo[];
}

export function ExperienceLevel({
  experienceLevel,
  totalExperience,
  experiences = [],
}: ExperienceLevelProps) {
  // Convert months to years and months
  const years = Math.floor(totalExperience / 12);
  const months = totalExperience % 12;

  // Get formatted experience duration
  const getFormattedDuration = () => {
    if (years === 0) {
      return `${months} month${months !== 1 ? "s" : ""}`;
    }
    if (months === 0) {
      return `${years} year${years !== 1 ? "s" : ""}`;
    }
    return `${years} year${years !== 1 ? "s" : ""} and ${months} month${months !== 1 ? "s" : ""}`;
  };

  // Get color based on experience level
  const getLevelColor = () => {
    switch (experienceLevel) {
      case "fresher":
        return "bg-purple-500";
      case "junior":
        return "bg-blue-500";
      case "mediocre":
        return "bg-green-500";
      case "senior":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get experience level label
  const getLevelLabel = () => {
    switch (experienceLevel) {
      case "fresher":
        return "Fresher (0-1 years)";
      case "junior":
        return "Junior (1-3 years)";
      case "mediocre":
        return "Mid-Level (3-8 years)";
      case "senior":
        return "Senior (8+ years)";
      default:
        return "Unknown";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Experience Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Experience Level</h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${getLevelColor()}`}>
              {getLevelLabel()}
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-gray-800">
              Total Experience: <span className="font-semibold">{getFormattedDuration()}</span>
            </p>
          </div>
        </div>

        {experiences.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Work History</h3>
            <div className="space-y-4">
              {experiences.map((exp, index) => (
                <div key={index} className="border-l-4 border-gray-300 pl-4 py-1">
                  <h4 className="font-semibold">{exp.position}</h4>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500">
                    {exp.startDate} - {exp.endDate || "Present"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {Math.floor(exp.duration / 12) > 0 ? `${Math.floor(exp.duration / 12)} year${Math.floor(exp.duration / 12) !== 1 ? "s" : ""} ` : ""}
                    {exp.duration % 12 > 0 ? `${exp.duration % 12} month${exp.duration % 12 !== 1 ? "s" : ""}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}