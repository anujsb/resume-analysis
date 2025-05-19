// src/components/analysis-result.tsx
"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExperienceLevelBadge } from "./experience-level-badge";
import { 
  ChevronDown, 
  ChevronUp, 
  User, 
  Mail, 
  Phone, 
  BookOpen,
  FileText
} from "lucide-react";
import { RequirementMatch } from "./requirement-match";
import { JobRequirement } from "@/types/job-requirements";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SkillProficiency {
  skill: string;
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
}

interface AnalysisResultProps {
  candidate: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    resumeText: string;
  };
  analysis: {
    skills: SkillProficiency[];
    experienceLevel: "fresher" | "junior" | "mediocre" | "senior";
    workExperienceYears: string;
    summary: string;
  };
  jobRequirement?: JobRequirement | null;
  savedRequirements?: JobRequirement[]; // Add this prop
}

export function AnalysisResult({ 
  candidate, 
  analysis, 
  jobRequirement,
  savedRequirements = [] // Provide default empty array
}: AnalysisResultProps) {
  const [showFullText, setShowFullText] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<JobRequirement | null>(
    jobRequirement || null
  );

  const proficiencyColor = {
    beginner: "bg-slate-100 text-slate-800",
    intermediate: "bg-blue-100 text-blue-800",
    advanced: "bg-green-100 text-green-800",
    expert: "bg-purple-100 text-purple-800",
  };

  const groupedSkills: Record<string, SkillProficiency[]> = analysis.skills.reduce(
    (groups, skill) => {
      const proficiency = skill.proficiency;
      if (!groups[proficiency]) {
        groups[proficiency] = [];
      }
      groups[proficiency].push(skill);
      return groups;
    },
    {} as Record<string, SkillProficiency[]>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" /> {candidate.name}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <ExperienceLevelBadge 
              level={analysis.experienceLevel} 
              years={analysis.workExperienceYears} 
            />
            {candidate.email && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {candidate.email}
              </Badge>
            )}
            {candidate.phone && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {candidate.phone}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
          <TabsTrigger value="comparison" className="flex-1">Requirements Match</TabsTrigger>
          <TabsTrigger value="details" className="flex-1">Full Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 space-y-6">
          {selectedRequirement && (
            <RequirementMatch
              jobRequirement={selectedRequirement}
              candidateSkills={analysis.skills}
              candidateExperienceYears={analysis.workExperienceYears}
            />
          )}
          <Card>
            <CardHeader>
              <CardTitle>Professional Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{analysis.summary}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compare Against Requirements</CardTitle>
              <CardDescription>
                Select a job requirement to compare against
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedRequirement?.id?.toString() || ""} 
                onValueChange={(value: string) => {
                  const req = savedRequirements.find(r => r.id?.toString() === value);
                  if (req) setSelectedRequirement(req);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a job requirement" />
                </SelectTrigger>
                <SelectContent>
                  {savedRequirements.map((req: JobRequirement) => (
                    <SelectItem 
                      key={req.id?.toString()} 
                      value={req.id?.toString() || ""}
                    >
                      {req.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedRequirement && (
                <div className="mt-6 space-y-6">
                  <RequirementMatch
                    jobRequirement={selectedRequirement}
                    candidateSkills={analysis.skills}
                    candidateExperienceYears={analysis.workExperienceYears}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {["expert", "advanced", "intermediate", "beginner"].map((level) => (
                  groupedSkills[level] && groupedSkills[level].length > 0 && (
                    <div key={level} className="space-y-2">
                      <h4 className="font-medium capitalize flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          level === 'expert' ? 'bg-purple-500' :
                          level === 'advanced' ? 'bg-green-500' :
                          level === 'intermediate' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`} />
                        {level}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {groupedSkills[level].map((skill, index) => (
                          <Badge 
                            key={index}
                            variant={
                              level === 'expert' ? 'default' :
                              level === 'advanced' ? 'secondary' :
                              'outline'
                            }
                          >
                            {skill.skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Full Resume Text</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className={`whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg ${
                  !showFullText ? "max-h-40 overflow-hidden" : ""
                }`}>
                  {candidate.resumeText}
                </pre>
                {!showFullText && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                )}
                <button
                  onClick={() => setShowFullText(!showFullText)}
                  className="mt-2 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  {showFullText ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show More
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}