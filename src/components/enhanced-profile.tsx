// src/components/enhanced-profile.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResumeUploader } from "@/components/resume-uploader";
import { CandidateSkills } from "@/components/candidate-skills";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Analysis } from '@/lib/db/schema';
import { SkillProficiency } from '@/types/candidate';
import { Loader2 } from 'lucide-react';

interface EnhancedProfileProps {
  analysis: Analysis | null;
  onAnalysisComplete: (analysis: Analysis) => void;
}

export function EnhancedProfile({ analysis, onAnalysisComplete }: EnhancedProfileProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const handleAnalysisComplete = (data: any) => {
    setIsUploading(false);
    onAnalysisComplete(data.analysis);
  };

  const reloadProfile = async () => {
    setIsReloading(true);
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      if (data.success && data.data?.analysis) {
        onAnalysisComplete(data.data.analysis);
      }
    } catch (error) {
      console.error('Failed to reload profile:', error);
    } finally {
      setIsReloading(false);
    }
  };

  const enhancedData = analysis?.enhancedData as any || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Resume Analysis</CardTitle>
            {analysis && (
              <Button
                variant="outline"
                onClick={reloadProfile}
                disabled={isReloading}
              >
                {isReloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reloading...
                  </>
                ) : (
                  'Reload Profile'
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />
          {analysis && (
            <div className="mt-2 text-sm text-gray-500">
              Last updated: {new Date(enhancedData.lastUpdated || analysis.createdAt).toLocaleString()}
            </div>
          )}
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
                {enhancedData.professionalProfile || analysis.summary}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <CandidateSkills skills={analysis.skills as SkillProficiency[]} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Full Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="whitespace-pre-wrap text-gray-700">
                  {enhancedData.fullResume || analysis.summary}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
