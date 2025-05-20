"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeUploader } from "@/components/resume-uploader";
import { BriefcaseIcon, UsersIcon, FileTextIcon, TrendingUpIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardPage() {

  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const [stats, setStats] = useState({
    totalCandidates: 0,
    totalRequirements: 0,
    recentAnalyses: 0,
    averageMatch: 0
  });

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Fetch total candidates
      const candidatesRes = await fetch("/api/candidates");
      const candidatesData = await candidatesRes.json();
      console.log("Candidates data:", candidatesData); // Debug log

      // Fetch requirements
      const requirementsRes = await fetch("/api/job-requirements");
      const requirementsData = await requirementsRes.json();
      console.log("Requirements data:", requirementsData); // Debug log

      // Check if data exists and has the expected structure
      if (!candidatesData.data || !requirementsData.data) {
        console.error("Invalid data structure received:", { candidatesData, requirementsData });
        return;
      }

      const recentAnalyses = candidatesData.data.filter((c: any) => {
        if (!c.analysis?.createdAt) return false;
        const analysisDate = new Date(c.analysis.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return analysisDate > weekAgo;
      }).length;

      const totalCandidates = candidatesData.data.length;
      const totalRequirements = requirementsData.data.length;

      // Calculate average match if you have the data
      let averageMatch = 0;
      const candidatesWithMatch = candidatesData.data.filter((c: any) => c.analysis?.matchPercentage);
      if (candidatesWithMatch.length > 0) {
        averageMatch = Math.round(
          candidatesWithMatch.reduce((acc: number, c: any) => acc + c.analysis.matchPercentage, 0) /
          candidatesWithMatch.length
        );
      }

      setStats({
        totalCandidates,
        totalRequirements,
        recentAnalyses,
        averageMatch
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Loading stats...");
    loadStats();
  }, []);

  const handleAnalysisComplete = (data: any) => {
    // Redirect to the candidate's analysis
    router.push(`/candidates?id=${data.candidate.id}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Overview of your recruitment process</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <UsersIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Spinner className="w-6 h-6" /> : stats.totalCandidates}
            </div>
            <p className="text-xs text-gray-500">Total processed resumes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Job Requirements</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Spinner className="w-6 h-6" /> : stats.totalRequirements}
            </div>
            <p className="text-xs text-gray-500">Active job requirements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Analyses</CardTitle>
            <FileTextIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Spinner className="w-6 h-6" /> : stats.recentAnalyses}
            </div>
            <p className="text-xs text-gray-500">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Match</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Spinner className="w-6 h-6" /> : `${stats.averageMatch}%`}
            </div>
            <p className="text-xs text-gray-500">Requirements match rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Analyze New Resume</CardTitle>
          <CardDescription>
            Upload a candidate's resume to analyze their profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />
        </CardContent>
      </Card>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your recruitment process</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add recent activity list here */}
        </CardContent>
      </Card>
    </div>
  );
}