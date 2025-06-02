'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Analysis } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/protected-route";
import { EnhancedProfile } from "@/components/enhanced-profile";
import { ProfileAnalysis } from "@/types/candidate";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const handleAnalysisComplete = (newAnalysis: ProfileAnalysis) => {
    setAnalysis(newAnalysis);
  };

  // Fetch existing analysis when the component mounts
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        if (data.success && data.data?.analysis) {
          setAnalysis(data.data.analysis);
        }
      } catch (error) {
        console.error('Failed to fetch analysis:', error);
      }
    };

    if (session?.user) {
      fetchAnalysis();
    }
  }, [session]);

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

          <EnhancedProfile 
            analysis={analysis}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
