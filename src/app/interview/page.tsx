"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CandidateWithAnalysis } from "@/types/candidate";
import { JobRequirement } from "@/types/job-requirements";
import { CandidateDetails } from "@/components/candidate-details";
import { CandidateSkills } from "@/components/candidate-skills";
import { MatchAnalysis } from "@/components/match-analysis";
import { InterviewQuestionPanel } from "@/components/interview-question-panel";

export default function InterviewPage() {
  const [candidates, setCandidates] = useState<CandidateWithAnalysis[]>([]);
  const [requirements, setRequirements] = useState<JobRequirement[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithAnalysis | null>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<JobRequirement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [candidatesRes, requirementsRes] = await Promise.all([
          fetch("/api/candidates"),
          fetch("/api/job-requirements")
        ]);

        const [candidatesData, requirementsData] = await Promise.all([
          candidatesRes.json(),
          requirementsRes.json()
        ]);

        if (candidatesData.success) {
          setCandidates(candidatesData.data);
        }
        if (requirementsData.success) {
          setRequirements(requirementsData.data);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Interview Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select
              onValueChange={(id) => {
                const candidate = candidates.find(c => c.candidate.id.toString() === id);
                if (candidate) setSelectedCandidate(candidate);
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select candidate" />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((candidate) => (
                  <SelectItem 
                    key={candidate.candidate.id} 
                    value={candidate.candidate.id.toString()}
                  >
                    {candidate.candidate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(id) => {
                const requirement = requirements.find(r => r.id?.toString() === id);
                if (requirement) setSelectedRequirement(requirement);
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[300px]">
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
          </div>
        </CardContent>
      </Card>

      {selectedCandidate && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Tabbed Content */}
          <Card>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="match">Match Analysis</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[calc(100vh-16rem)]">
                <TabsContent value="details">
                  <CandidateDetails candidate={selectedCandidate} />
                </TabsContent>

                <TabsContent value="skills">
                  <CandidateSkills skills={selectedCandidate.analysis.skills} />
                </TabsContent>

                <TabsContent value="match">
                  {selectedRequirement ? (
                    <MatchAnalysis 
                      candidate={selectedCandidate}
                      requirement={selectedRequirement}
                    />
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      Select a job requirement to view match analysis
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </Card>

          {/* Right Column - Interview Questions */}
          <Card>
            <ScrollArea className="h-[calc(100vh-12rem)]">
              {selectedCandidate && selectedRequirement ? (
                <InterviewQuestionPanel
                  candidate={selectedCandidate}
                  requirement={selectedRequirement}
                />
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  Select both a candidate and job requirement to generate questions
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      )}

      {!selectedCandidate && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Select a candidate and job requirement to start the interview process
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}