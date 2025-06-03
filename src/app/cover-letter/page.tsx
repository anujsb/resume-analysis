'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Analysis } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ProtectedRoute from "@/components/protected-route";
import { JobRequirement } from "@/types/job-requirements";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CoverLetterPage() {
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [requirements, setRequirements] = useState<JobRequirement[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<JobRequirement | null>(null);
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch profile data and job requirements when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, requirementsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/job-requirements')
        ]);

        const [profileData, requirementsData] = await Promise.all([
          profileRes.json(),
          requirementsRes.json()
        ]);

        console.log('Profile Data:', profileData);
        console.log('Requirements Data:', requirementsData);

        if (profileData.success && profileData.data?.analysis) {
          setAnalysis(profileData.data.analysis);
        }
        if (requirementsData.success) {
          setRequirements(requirementsData.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const generateCoverLetter = async () => {
    if (!analysis || !selectedRequirement) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis: analysis,
          requirement: selectedRequirement,
          candidateName: session?.user?.name,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCoverLetter(data.coverLetter);
      }
    } catch (error) {
      console.error('Failed to generate cover letter:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Cover Letter Generator</h1>
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
                  console.log('Selected ID:', id);
                  const requirement = requirements.find(r => r.id?.toString() === id);
                  console.log('Found Requirement:', requirement);
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
                onClick={generateCoverLetter}
                disabled={!selectedRequirement || isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Cover Letter"}
              </Button>
            </CardContent>
          </Card>

          {/* Cover Letter Display */}
          {coverLetter && (
            <Card>
              <CardHeader>
                <CardTitle>Your Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="min-h-[500px] font-serif text-base leading-relaxed"
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
