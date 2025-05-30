'use client';

import { useSession } from "next-auth/react";
import { useState } from "react";
import ProtectedRoute from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeUploader } from "@/components/resume-uploader";
import { Analysis } from "@/lib/db/schema";

interface Skill {
  skill: string;
  proficiency: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const handleAnalysisComplete = (newAnalysis: Analysis) => {
    setAnalysis(newAnalysis);
  };

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <span className="font-medium">Name:</span>
                  <span className="ml-2">{session?.user?.name}</span>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">{session?.user?.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />
            </CardContent>
          </Card>

          {analysis && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Experience & Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div>
                      <span className="font-medium">Experience Level:</span>
                      <span className="ml-2">{analysis.experienceLevel}</span>
                    </div>
                    <div>
                      <span className="font-medium">Years of Experience:</span>
                      <span className="ml-2">{analysis.workExperienceYears}</span>
                    </div>
                    <div>
                      <span className="font-medium">Skills:</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(analysis.skills as Skill[]).map((skill, index) => (
                          <div key={index} className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                            {skill.skill} ({skill.proficiency})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Professional Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{analysis.summary}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
