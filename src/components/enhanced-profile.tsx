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
import { Loader2, FileText, Brain, Target, Clock, Sparkles, TrendingUp } from 'lucide-react';

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
    <div className="space-y-8">
      {/* Resume Analysis Card */}
      <Card className="group bg-white/90 backdrop-blur-md border-0 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="pb-6 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-4 text-2xl text-slate-800">
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg group-hover:shadow-emerald-500/30 transition-shadow duration-300">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold">Resume Analysis</span>
            </CardTitle>
            {analysis && (
              <div className="flex-shrink-0 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={reloadProfile}
                  disabled={isReloading}
                  className="group/btn w-full sm:w-auto border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 rounded-xl px-6 py-2.5 shadow-sm hover:shadow-md"
                >
                  {isReloading ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="font-medium">Reloading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <TrendingUp className="h-4 w-4 text-slate-600 group-hover/btn:text-blue-600 transition-colors duration-300" />
                      <span className="font-medium">Reload Profile</span>
                    </div>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="bg-gradient-to-br from-slate-50/80 to-gray-50/80 rounded-2xl border border-slate-100/80 p-6">
            <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />
          </div>
          {analysis && (
            <div className="mt-6 flex items-center justify-center sm:justify-start gap-3 text-sm text-slate-500 bg-slate-50/50 rounded-xl p-4 border border-slate-100">
              <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="font-medium text-center sm:text-left">
                Last updated: {new Date(enhancedData.lastUpdated || analysis.createdAt).toLocaleString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <>
          {/* Professional Profile Card */}
          <Card className="group bg-white/90 backdrop-blur-md border-0 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-6 relative">
              <CardTitle className="flex items-center gap-4 text-2xl text-slate-800">
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-purple-500/30 transition-shadow duration-300">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold">Professional Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="bg-gradient-to-br from-slate-50/80 to-gray-50/80 rounded-2xl border border-slate-100/80 p-6 sm:p-8">
                <p className="whitespace-pre-wrap text-slate-700 text-base sm:text-lg leading-relaxed font-medium text-left">
                  {enhancedData.professionalProfile || analysis.summary}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Skills Matrix Card */}
          <Card className="group bg-white/90 backdrop-blur-md border-0 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-6 relative">
              <CardTitle className="flex items-center gap-4 text-2xl text-slate-800">
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-indigo-500/30 transition-shadow duration-300">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold">Skills Matrix</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="bg-gradient-to-br from-slate-50/80 to-gray-50/80 rounded-2xl border border-slate-100/80 p-4 sm:p-6">
                <CandidateSkills skills={analysis.skills as SkillProficiency[]} />
              </div>
            </CardContent>
          </Card>

          {/* Full Resume Card */}
          <Card className="group bg-white/90 backdrop-blur-md border-0 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-6 relative">
              <CardTitle className="flex items-center gap-4 text-2xl text-slate-800">
                <div className="flex-shrink-0 p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg group-hover:shadow-orange-500/30 transition-shadow duration-300">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold">Full Resume</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="bg-gradient-to-br from-slate-50/80 to-gray-50/80 rounded-2xl border border-slate-100/80 overflow-hidden">
                <ScrollArea className="h-[500px] p-6 sm:p-8">
                  <div className="whitespace-pre-wrap text-slate-700 text-sm sm:text-base leading-relaxed">
                    {enhancedData.fullResume || analysis.summary}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}