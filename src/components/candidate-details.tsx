import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidateWithAnalysis } from "@/types/candidate";
import { Mail, Phone, GraduationCap } from "lucide-react";
import { ExperienceLevelBadge } from "./experience-level-badge";

interface CandidateDetailsProps {
  candidate: CandidateWithAnalysis;
}

export function CandidateDetails({ candidate }: CandidateDetailsProps) {
  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{candidate.candidate.name}</h2>
        <ExperienceLevelBadge 
          level={candidate.analysis.experienceLevel} 
          years={candidate.analysis.workExperienceYears}
        />
      </div>

      <div className="space-y-2">
        {candidate.candidate.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4" />
            {candidate.candidate.email}
          </div>
        )}
        {candidate.candidate.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4" />
            {candidate.candidate.phone}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Professional Summary</h3>
        <p className="text-sm text-muted-foreground">{candidate.analysis.summary}</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Resume Content</h3>
        <div className="max-h-[400px] overflow-y-auto">
          <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
            {candidate.candidate.resumeText}
          </pre>
        </div>
      </div>
    </div>
  );
}