// src/components/experience-level-badge.tsx
import { cn } from "@/lib/utils";

type ExperienceLevel = "fresher" | "junior" | "mediocre" | "senior";

interface ExperienceLevelBadgeProps {
  level: ExperienceLevel;
  years?: string;
  className?: string;
}

export function ExperienceLevelBadge({ level, years, className }: ExperienceLevelBadgeProps) {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
  
  const levelConfig = {
    fresher: {
      classes: "bg-blue-100 text-blue-800",
      label: "Fresher (0-1 years)",
    },
    junior: {
      classes: "bg-green-100 text-green-800",
      label: "Junior (1-3 years)",
    },
    mediocre: {
      classes: "bg-yellow-100 text-yellow-800",
      label: "Mid-level (3-8 years)",
    },
    senior: {
      classes: "bg-purple-100 text-purple-800",
      label: "Senior (8+ years)",
    },
  };

  const config = levelConfig[level];
  const displayYears = years ? ` • ${years} years` : "";

  return (
    <span className={cn(baseClasses, config.classes, className)}>
      {config.label}{displayYears}
    </span>
  );
}