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
}

export function AnalysisResult({ candidate, analysis }: AnalysisResultProps) {
  const [showFullText, setShowFullText] = useState(false);

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <User className="h-5 w-5" /> {candidate.name}
        </CardTitle>
        <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
          <ExperienceLevelBadge 
            level={analysis.experienceLevel} 
            years={analysis.workExperienceYears} 
          />

          {candidate.email && (
            <span className="flex items-center gap-1 text-sm">
              <Mail className="h-4 w-4" />
              {candidate.email}
            </span>
          )}
          
          {candidate.phone && (
            <span className="flex items-center gap-1 text-sm">
              <Phone className="h-4 w-4" />
              {candidate.phone}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
            <TabsTrigger value="skills" className="flex-1">Skills</TabsTrigger>
            <TabsTrigger value="resume" className="flex-1">Resume Text</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <BookOpen className="h-5 w-5" />
                Candidate Summary
              </div>
              <p className="text-gray-700">{analysis.summary}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="skills" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                Skills & Proficiency
              </div>
              
              <div className="space-y-4">
                {["expert", "advanced", "intermediate", "beginner"].map((level) => (
                  groupedSkills[level] && groupedSkills[level].length > 0 && (
                    <div key={level} className="space-y-2">
                      <h4 className="font-medium capitalize">{level}</h4>
                      <div className="flex flex-wrap gap-2">
                        {groupedSkills[level].map((skill, index) => (
                          <span 
                            key={index} 
                            className={`px-2 py-1 rounded-md text-xs font-medium ${proficiencyColor[skill.proficiency]}`}
                          >
                            {skill.skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="resume" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-medium">
                  <FileText className="h-5 w-5" />
                  Resume Text
                </div>
                
                <button
                  onClick={() => setShowFullText(!showFullText)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
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
              
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className={`whitespace-pre-wrap text-sm ${!showFullText ? "max-h-40 overflow-hidden" : ""}`}>
                  {candidate.resumeText}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}