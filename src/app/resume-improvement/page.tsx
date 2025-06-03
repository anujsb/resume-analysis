'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Analysis } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import { JobRequirement } from "@/types/job-requirements";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ResumeImprovementPage() {
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [requirements, setRequirements] = useState<JobRequirement[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<JobRequirement | null>(null);
  const [suggestions, setSuggestions] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data and job requirements when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, requirementsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/job-requirements')
        ]);

        const [profileData, requirementsData] = await Promise.all([
          profileRes.json(),
          requirementsRes.json()
        ]);

        if (profileData.success && profileData.data?.analysis) {
          setAnalysis(profileData.data.analysis);
        } else {
          setError("No profile data found. Please upload your resume to get started.");
        }

        if (requirementsData.success) {
          setRequirements(requirementsData.data);
        }
      } catch (error) {
        setError('Failed to fetch data. Please try again.');
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const generateSuggestions = async () => {
    if (!analysis || !selectedRequirement) return;

    setGenerating(true);
    setSuggestions("");
    try {
      const response = await fetch('/api/generate-resume-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis: analysis,
          requirement: selectedRequirement,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuggestions(data.suggestions);
      } else {
        setError('Failed to generate suggestions. Please try again.');
      }
    } catch (error) {
      setError('Failed to generate suggestions. Please try again.');
      console.error('Failed to generate suggestions:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Resume Improvement Suggestions</h1>

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
              <span>Loading data...</span>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Job Requirements Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Job Requirement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-sm text-gray-500">
                  {requirements.length} requirements loaded
                  {selectedRequirement && ` • Selected: ${selectedRequirement.title}`}
                </div>
                <Select
                  onValueChange={(id) => {
                    const requirement = requirements.find(r => r.id?.toString() === id);
                    if (requirement) setSelectedRequirement(requirement);
                  }}
                  value={selectedRequirement?.id?.toString() || ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select job requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    {requirements.map((req) => (
                      <SelectItem 
                        key={req.id} 
                        value={req.id?.toString() || ''}
                      >
                        {req.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  className="mt-4 w-full"
                  onClick={generateSuggestions}
                  disabled={!selectedRequirement || generating}
                >
                  {generating ? "Generating suggestions..." : "Generate Suggestions"}
                </Button>
              </CardContent>
            </Card>

            {/* Suggestions Display */}
            {suggestions && (
              <Card>
                <CardHeader>
                  <CardTitle>Resume Improvement Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] w-full">
                    <div className="space-y-4 p-4 whitespace-pre-wrap">
                      {suggestions}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
