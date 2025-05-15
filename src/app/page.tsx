// src/app/page.tsx
"use client";

import { useState } from "react";
import { ResumeUploader } from "@/components/resume-uploader";
import { SkillsDisplay } from "@/components/skills-display";
import { ExperienceLevel } from "@/components/experience-level";
import { ResumeAnalysis } from "@/lib/utils/ai-helpers";

export default function Home() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [candidateId, setCandidateId] = useState<number | null>(null);
  
  const handleAnalysisComplete = (result: ResumeAnalysis, id: number) => {
    setAnalysis(result);
    setCandidateId(id);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };
  
  const handleReset = () => {
    setAnalysis(null);
    setCandidateId(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto py-6 px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Recruiter's Resume Analyzer</h1>
          <p className="mt-2 text-gray-600">
            Upload candidate resumes and get AI-powered skills and experience analysis
          </p>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center">
          <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />
          
          {analysis && (
            <div id="results" className="w-full max-w-4xl mt-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Analysis Results</h2>
                <button
                  onClick={handleReset}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Analyze Another Resume
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkillsDisplay skills={analysis.skills} />
                <ExperienceLevel
                  experienceLevel={analysis.experienceLevel}
                  totalExperience={analysis.totalExperience}
                  experiences={analysis.experiences}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto py-6 px-4">
          <p className="text-center text-gray-600 text-sm">
            Resume Analyzer - Powered by Gemini AI
          </p>
        </div>
      </footer>
    </div>
  );
}