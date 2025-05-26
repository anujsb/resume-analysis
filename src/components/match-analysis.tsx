import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CandidateWithAnalysis } from "@/types/candidate";
import { JobRequirement } from "@/types/job-requirements";
import { CheckCircle, XCircle } from "lucide-react";

interface MatchAnalysisProps {
  candidate: CandidateWithAnalysis;
  requirement: JobRequirement;
}

export function MatchAnalysis({ candidate, requirement }: MatchAnalysisProps) {
  const calculateSkillMatch = (requiredSkills: string[]) => {
    const matches = requiredSkills.map(reqSkill => ({
      skill: reqSkill,
      matched: candidate.analysis.skills.some(
        s => s.skill.toLowerCase().includes(reqSkill.toLowerCase())
      )
    }));

    return {
      matched: matches.filter(m => m.matched).length,
      total: matches.length,
      skills: matches
    };
  };

  const primaryMatch = calculateSkillMatch(requirement.primarySkills);
  const secondaryMatch = calculateSkillMatch(requirement.secondarySkills);
  const overallMatch = Math.round(
    ((primaryMatch.matched * 0.7 + secondaryMatch.matched * 0.3) /
    (primaryMatch.total * 0.7 + secondaryMatch.total * 0.3)) * 100
  );

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h3 className="font-semibold">Overall Match</h3>
        <Progress value={overallMatch} className="h-2" />
        <p className="text-sm text-muted-foreground text-right">{overallMatch}%</p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Primary Skills</h3>
          <div className="space-y-2">
            {primaryMatch.skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-2">
                {skill.matched ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">{skill.skill}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Secondary Skills</h3>
          <div className="space-y-2">
            {secondaryMatch.skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-2">
                {skill.matched ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">{skill.skill}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}