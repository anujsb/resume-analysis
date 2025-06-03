'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Analysis } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/protected-route";
import { EnhancedProfile } from "@/components/enhanced-profile";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisComplete = (newAnalysis: Analysis) => {
    setAnalysis(newAnalysis);
    setError(null);
  };

  // Function to fetch analysis data
  const fetchAnalysis = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      // First try to fetch using the session
      const response = await fetch('/api/profile');
      const data = await response.json();
      
      if (data.success && data.data?.analysis) {
        setAnalysis(data.data.analysis);
        return;
      }

      // If no data and this was our first try, attempt to fetch from candidates API
      if (retryCount === 0) {
        const candidatesRes = await fetch('/api/candidates');
        const candidatesData = await candidatesRes.json();
        
        if (candidatesData.success && candidatesData.data?.length > 0) {
          // Get the most recent candidate analysis
          const latestCandidate = candidatesData.data[0];
          setAnalysis(latestCandidate.analysis);
        } else {
          setError("No profile data found. Please upload your resume to get started.");
        }
      }
    } catch (error) {
      setError('Failed to fetch profile data. Please try again.');
      console.error('Failed to fetch analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchAnalysis();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Profile</h1>
          {!loading && analysis && (
            <button
              onClick={() => fetchAnalysis()}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4" />
              Refresh
            </button>
          )}
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center w-full p-6">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading profile data...</span>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <span className="font-medium">Name:</span>
                    <span className="ml-2">{session?.user?.name || 'Guest User'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{session?.user?.email || 'Not available'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <EnhancedProfile 
              analysis={analysis}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
