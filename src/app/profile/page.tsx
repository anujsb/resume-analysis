// src/app/profile/page.tsx
'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResumeUploader } from "@/components/resume-uploader";
import { CandidateProfile } from "@/lib/db/schema";
import { Loader2, Upload, Eye, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Skill {
  skill: string;
  proficiency: string;
}

interface Analysis {
  skills: Skill[];
  experienceLevel: string;
  workExperienceYears: string;
  summary: string;
  phone?: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  // Load existing profile on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/candidate-profile");
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
        setShowUploader(!data.data); // Show uploader only if no profile exists
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysisComplete = async (analysis: Analysis, resumeText: string) => {
    setIsUploading(true);
    try {
      const response = await fetch("/api/candidate-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysis,
          resumeText,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
        setShowUploader(false);
      } else {
        console.error("Failed to save profile:", data.error);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReUpload = () => {
    setShowUploader(true);
  };

  const getProficiencyColor = (proficiency: string) => {
    const colors = {
      "Beginner": "bg-red-100 text-red-800",
      "Intermediate": "bg-yellow-100 text-yellow-800", 
      "Advanced": "bg-green-100 text-green-800",
      "Expert": "bg-blue-100 text-blue-800",
    };
    return colors[proficiency as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getExperienceLevelColor = (level: string) => {
    const colors = {
      "fresher": "bg-blue-100 text-blue-800",
      "junior": "bg-green-100 text-green-800",
      "mediocre": "bg-yellow-100 text-yellow-800",
      "senior": "bg-purple-100 text-purple-800",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["candidate"]}>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Profile</h1>
          {profile && (
            <Button 
              onClick={handleReUpload}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Re-upload Resume
            </Button>
          )}
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="font-medium text-gray-600">Name:</span>
                <span className="ml-2 text-lg">{session?.user?.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <span className="ml-2">{session?.user?.email}</span>
              </div>
              {profile?.phone && (
                <div>
                  <span className="font-medium text-gray-600">Phone:</span>
                  <span className="ml-2">{profile.phone}</span>
                </div>
              )}
              {profile && (
                <div>
                  <span className="font-medium text-gray-600">Last Updated:</span>
                  <span className="ml-2">{new Date(profile.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resume Upload Section */}
        {(showUploader || !profile) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {profile ? "Re-upload Resume" : "Upload Resume"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isUploading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Processing your resume...</span>
                </div>
              ) : (
                <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />
              )}
              {profile && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUploader(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Professional Profile */}
        {profile && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Professional Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <span className="font-medium text-gray-600">Experience Level:</span>
                      <div className="mt-1">
                        <Badge className={getExperienceLevelColor(profile.experienceLevel)}>
                          {profile.experienceLevel.charAt(0).toUpperCase() + profile.experienceLevel.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Years of Experience:</span>
                      <span className="ml-2 text-lg font-semibold">{profile.workExperienceYears}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium text-gray-600 mb-3">Professional Summary</h3>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {profile.summary}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(profile.skills as Skill[]).map((skill, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                      >
                        <span className="font-medium">{skill.skill}</span>
                        <Badge className={getProficiencyColor(skill.proficiency)}>
                          {skill.proficiency}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Full Resume */}
            <Card>
              <CardHeader>
                <CardTitle>Full Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                    {profile.resumeText}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!profile && !showUploader && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No Resume Uploaded
              </h3>
              <p className="text-gray-500 mb-4">
                Upload your resume to create your professional profile
              </p>
              <Button onClick={() => setShowUploader(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}