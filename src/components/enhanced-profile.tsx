// src/components/enhanced-profile.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResumeUploader } from "@/components/resume-uploader";
import { CandidateSkills } from "@/components/candidate-skills";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileAnalysis } from "@/types/candidate";
import { Analysis } from '@/lib/db/schema';

interface EnhancedProfileProps {
  analysis: Analysis | null;
  onAnalysisComplete: (analysis: Analysis) => void;
}

export function EnhancedProfile({ analysis, onAnalysisComplete }: EnhancedProfileProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleAnalysisComplete = (data: any) => {
    setIsUploading(false);
    onAnalysisComplete(data.analysis);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resume Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />
        </CardContent>
      </Card>

      {analysis && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Professional Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-gray-700">
                {analysis.professionalProfile || analysis.summary}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <CandidateSkills skills={analysis.skills} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Full Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="whitespace-pre-wrap text-gray-700">
                  {analysis.fullResume || analysis.summary}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
