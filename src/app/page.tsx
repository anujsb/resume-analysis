// src/app/page.tsx
"use client";

import { useState } from "react";
import { ResumeUploader } from "@/components/resume-uploader";
import { AnalysisResult } from "@/components/analysis-result";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, RefreshCw } from "lucide-react";

type CandidateWithAnalysis = {
  candidate: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    resumeText: string;
    createdAt: string;
  };
  analysis: {
    id: number;
    candidateId: number;
    skills: Array<{
      skill: string;
      proficiency: "beginner" | "intermediate" | "advanced" | "expert";
    }>;
    experienceLevel: "fresher" | "junior" | "mediocre" | "senior";
    workExperienceYears: string;
    summary: string;
    createdAt: string;
  };
};

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>("upload");
  const [candidatesList, setCandidatesList] = useState<CandidateWithAnalysis[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysisComplete = (data: any) => {
    const newCandidate = {
      candidate: data.candidate,
      analysis: data.analysis,
    };
    setSelectedCandidate(newCandidate);
    setCandidatesList([newCandidate, ...candidatesList]);
    setCurrentTab("result");
  };

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/candidates");
      const data = await response.json();
      
      if (data.success && data.data) {
        setCandidatesList(data.data);
      }
    } catch (error) {
      console.error("Failed to load candidates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectCandidate = (candidate: CandidateWithAnalysis) => {
    setSelectedCandidate(candidate);
    setCurrentTab("result");
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Resume Analyzer</h1>
        <p className="text-gray-600">Upload candidate resumes for AI-powered skill analysis</p>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="upload" className="px-4">
              Upload Resume
            </TabsTrigger>
            <TabsTrigger value="candidates" className="px-4" onClick={loadCandidates}>
              All Candidates
            </TabsTrigger>
            {selectedCandidate && (
              <TabsTrigger value="result" className="px-4">
                Analysis Result
              </TabsTrigger>
            )}
          </TabsList>
          
          {currentTab === "candidates" && (
            <Button variant="outline" size="sm" onClick={loadCandidates}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
        
        <TabsContent value="upload" className="mt-4">
          <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />
        </TabsContent>
        
        <TabsContent value="candidates" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : candidatesList.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">No candidates found</h3>
              <p className="text-gray-600 mb-4">Upload a candidate resume to get started</p>
              <Button onClick={() => setCurrentTab("upload")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {candidatesList.map((item) => (
                <div 
                  key={item.candidate.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => selectCandidate(item)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{item.candidate.name || "Unknown Candidate"}</h3>
                      {item.candidate.email && (
                        <p className="text-sm text-gray-600">{item.candidate.email}</p>
                      )}
                    </div>
                    <ExperienceLevelBadge 
                      level={item.analysis.experienceLevel} 
                      years={item.analysis.workExperienceYears} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="result" className="mt-4">
          {selectedCandidate && (
            <AnalysisResult 
              candidate={selectedCandidate.candidate} 
              analysis={selectedCandidate.analysis} 
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Add the missing import
import { ExperienceLevelBadge } from "@/components/experience-level-badge";