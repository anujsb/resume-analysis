"use client";

import { ResumeAnalysisResponse } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillProficiency } from "@/components/skill-proficiency";
import { ExperienceLevel } from "@/components/experience-level";
import { Badge } from "@/components/ui/badge";
import { FileText, Mail, Phone, User } from "lucide-react";

interface AnalysisResultsProps {
  results: ResumeAnalysisResponse;
}

export function AnalysisResults({ results }: AnalysisResultsProps) {
  return (
    <div className="space-y-6">
      {/* Candidate Info Card */}
      {(results.candidateName || results.candidateEmail || results.candidatePhone) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" /> Candidate Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {results.candidateName && (
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="font-medium">{results.candidateName}</span>
                </div>
              )}
              {results.candidateEmail && (
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{results.candidateEmail}</span>
                </div>
              )}
              {results.candidatePhone && (
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{results.candidatePhone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience Level Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Experience Assessment
          </CardTitle>
          <CardDescription>
            Experience level category and total work experience duration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ExperienceLevel 
              level={results.experienceLevel}
              years={results.yearsOfExperience}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills Card */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Proficiency</CardTitle>
          <CardDescription>
            Skills identified from the resume with estimated proficiency levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {results.skills.length > 0 ? (
              <div className="grid gap-6">
                {results.skills.map((skill, index) => (
                  <SkillProficiency 
                    key={index}
                    skill={skill.skill}
                    proficiency={skill.proficiency}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No specific skills identified</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}