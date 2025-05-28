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
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExperienceLevelBadge } from "./experience-level-badge";
import { 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone,
  BookOpen,
  FileText,
  Briefcase,
  Code,
  GraduationCap,
  XCircle,
  Trophy,
  MessageSquare,
  Globe
} from "lucide-react";
import { RequirementMatch } from "./requirement-match";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { InterviewQuestions } from "./interview-questions";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { JobRequirement } from "@/types/job-requirements";
import { MatchResult } from "@/types/matching";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { translateText } from "@/lib/gemini";

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
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [activeTab, setActiveTab] = useState("match");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);

  const handleMatchCalculated = (result: MatchResult) => {
    setMatchResult(result);
  };

  const handleTranslate = async () => {
    try {
      setIsTranslating(true);
      const translated = await translateText(candidate.resumeText);
      setTranslatedText(translated);
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      setIsTranslating(false);
    }
  };

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Candidate Details */}
      <div className="space-y-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Professional Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <ExperienceLevelBadge 
                level={analysis.experienceLevel} 
                years={analysis.workExperienceYears}
                className="w-fit" 
              />
              {candidate.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {candidate.email}
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {candidate.phone}
                </div>
              )}
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Professional Summary</h4>
              <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            </div>
          </CardContent>
        </Card>

        {/* Skills Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Skills Matrix
            </CardTitle>
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

        {/* Full Resume */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Full Resume
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={isTranslating}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                {isTranslating ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Translating...
                  </>
                ) : (
                  <>
                    Translate
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className={`whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg ${
                !showFullText ? "max-h-40 overflow-hidden" : ""
              }`}>
                {translatedText || candidate.resumeText}
              </pre>
              {!showFullText && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullText(!showFullText)}
                className="mt-2 w-full"
              >
                {showFullText ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show More
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Requirements Match & Interview Questions */}
      <div className="space-y-6">
        {/* Top Actions Bar */}
        <Card className="sticky top-4 z-10 bg-white/95 backdrop-blur border-b">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <Select 
                value={selectedRequirement?.id?.toString() || ""} 
                onValueChange={(value: string) => {
                  const req = savedRequirements.find(r => r.id?.toString() === value);
                  if (req) {
                    setSelectedRequirement(req);
                    // Reset to match tab when changing requirement
                    setActiveTab("match");
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select job requirement to analyze match" />
                </SelectTrigger>
                <SelectContent>
                  {savedRequirements.map((req) => (
                    <SelectItem key={req.id?.toString()} value={req.id?.toString() || ""}>
                      {req.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full relative">
            <TabsTrigger value="match" className="w-1/2">
              <Trophy className="h-4 w-4 mr-2" />
              Requirements Match
            </TabsTrigger>
            <TabsTrigger 
              value="interview" 
              className="w-1/2 relative group/tooltip cursor-help disabled:opacity-60 disabled:hover:cursor-help" // Changed class
              // disabled={!selectedRequirement || !matchResult || matchResult.overallMatch < 60}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Interview Questions
              {(!selectedRequirement || !matchResult || matchResult.overallMatch < 60) && (
                <div className="invisible group-hover/tooltip:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 w-64 bg-black/90 text-white text-xs rounded-md shadow-lg z-50">
                  {!selectedRequirement ? (
                    "Select a job requirement first"
                  ) : !matchResult ? (
                    "Analyzing candidate match..."
                  ) : matchResult.overallMatch < 60 ? (
                    <div className="space-y-1">
                      <p>Candidate must match at least 60% of requirements</p>
                      <div className="flex items-center justify-center gap-2 mt-1 pt-1 border-t border-white/20">
                        <span>Current Match:</span>
                        <span className="font-bold">{matchResult.overallMatch}%</span>
                      </div>
                    </div>
                  ) : null}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black/90"></div>
                </div>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="match" className="mt-4">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              {selectedRequirement ? (
                <RequirementMatch
                  jobRequirement={selectedRequirement}
                  candidateSkills={analysis.skills}
                  candidateExperienceYears={analysis.workExperienceYears}
                  onMatchCalculated={handleMatchCalculated}
                />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Select a Job Requirement</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose a job requirement to analyze the candidate's match and generate relevant interview questions.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="interview" className="mt-4">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              {selectedRequirement && matchResult ? (
                matchResult.overallMatch >= 60 ? (
                  <InterviewQuestions
                    skills={analysis.skills}
                    experienceLevel={analysis.experienceLevel}
                    experienceYears={analysis.workExperienceYears}
                    jobRequirement={selectedRequirement} // Pass the job requirement
                  />
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <XCircle className="h-12 w-12 text-red-500/50 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Interview Questions Not Available</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          The candidate's profile needs to match at least 60% of the job requirements to generate relevant interview questions.
                        </p>
                        <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg">
                          <span className="font-medium">Current Match:</span>
                          <span className="text-lg font-bold">{matchResult.overallMatch}%</span>
                          <span className="text-sm">/ Required: 60%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Select a Job Requirement First</h3>
                      <p className="text-sm text-muted-foreground">
                        To generate interview questions, first select a job requirement and ensure the candidate's profile matches at least 60% of the requirements.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}