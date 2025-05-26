import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CandidateWithAnalysis } from "@/types/candidate";
import { JobRequirement } from "@/types/job-requirements";
import { CheckCircle, XCircle, Trophy } from "lucide-react";

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
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Requirements Match Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="border border-muted">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Overall Match Score</span>
                <span className="text-primary">{overallMatch}%</span>
              </div>
              <Progress value={overallMatch} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                Based on primary (70%) and secondary (30%) skills match
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Primary Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {primaryMatch.skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      {skill.matched ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">{skill.skill}</span>
                    </div>
                    <Badge variant={skill.matched ? "default" : "secondary"}>
                      {skill.matched ? "Matched" : "Missing"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Secondary Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {secondaryMatch.skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      {skill.matched ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">{skill.skill}</span>
                    </div>
                    <Badge variant={skill.matched ? "default" : "secondary"}>
                      {skill.matched ? "Matched" : "Missing"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}