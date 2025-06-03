"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeUploader } from "@/components/resume-uploader";
import {
  BriefcaseIcon,
  UsersIcon,
  FileTextIcon,
  TrendingUpIcon,
  UploadIcon,
  ActivityIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BarChartIcon,
  PieChartIcon,
  CalendarIcon,
  StarIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [stats, setStats] = useState({
    totalCandidates: 0,
    totalRequirements: 0,
    recentAnalyses: 0,
    averageMatch: 0
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'analysis', candidate: 'John Doe', time: '2 hours ago', match: 85 },
    { id: 2, type: 'upload', candidate: 'Jane Smith', time: '4 hours ago', match: 92 },
    { id: 3, type: 'requirement', title: 'Senior Developer', time: '1 day ago' },
    { id: 4, type: 'analysis', candidate: 'Mike Johnson', time: '2 days ago', match: 78 },
  ]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const [candidatesRes, requirementsRes] = await Promise.all([
        fetch("/api/candidates"),
        fetch("/api/job-requirements")
      ]);

      const [candidatesData, requirementsData] = await Promise.all([
        candidatesRes.json(),
        requirementsRes.json()
      ]);

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleAnalysisComplete = (data: any) => {
    router.push(`/candidates?id=${data.candidate.id}`);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'analysis': return <BarChartIcon className="h-4 w-4" />;
      case 'upload': return <UploadIcon className="h-4 w-4" />;
      case 'requirement': return <BriefcaseIcon className="h-4 w-4" />;
      default: return <ActivityIcon className="h-4 w-4" />;
    }
  };

  const getMatchColor = (match: number) => {
    if (match >= 90) return 'text-emerald-600';
    if (match >= 75) return 'text-blue-600';
    if (match >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen border rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg">
              <BarChartIcon className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Recruitment Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Monitor your recruitment process with real-time analytics and insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Candidates</CardTitle>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <UsersIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? <Spinner className="w-6 h-6" /> : stats.totalCandidates}
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpIcon className="h-3 w-3 text-emerald-600" />
                <p className="text-xs text-emerald-600 font-medium">+12% from last month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Job Requirements</CardTitle>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <BriefcaseIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? <Spinner className="w-6 h-6" /> : stats.totalRequirements}
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpIcon className="h-3 w-3 text-emerald-600" />
                <p className="text-xs text-emerald-600 font-medium">+5 new this week</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Recent Analyses</CardTitle>
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <FileTextIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? <Spinner className="w-6 h-6" /> : stats.recentAnalyses}
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-3 w-3 text-gray-500" />
                <p className="text-xs text-gray-500 font-medium">Last 7 days</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Match</CardTitle>
              <div className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg">
                <TrendingUpIcon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {isLoading ? <Spinner className="w-6 h-6" /> : `${stats.averageMatch}%`}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.averageMatch}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 font-medium">Requirements match rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
                  <UploadIcon className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">Analyze New Resume</CardTitle>
              </div>
              <CardDescription className="text-gray-600">
                Upload a candidate's resume to analyze their profile and get instant matching insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />
            </CardContent>
          </Card>

          {/* Recent Activity Section */}
          {/* <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                    <ActivityIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Recent Activity</CardTitle>
                    <CardDescription className="text-gray-600">Latest updates from your recruitment process</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="hover:bg-blue-50">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'analysis' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'upload' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {activity.type === 'analysis' && `Analyzed ${activity.candidate}`}
                            {activity.type === 'upload' && `Uploaded resume for ${activity.candidate}`}
                            {activity.type === 'requirement' && `New requirement: ${activity.title}`}
                          </p>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                      {activity.match && (
                        <Badge variant="outline" className={`${getMatchColor(activity.match)} border-current`}>
                          {activity.match}% match
                        </Badge>
                      )}
                    </div>
                    {index < recentActivity.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StarIcon className="h-5 w-5 text-yellow-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Frequently used features to streamline your workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-16 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={() => router.push('/candidates')}
                >
                  <UsersIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">View All Candidates</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                  onClick={() => router.push('/job-requirements')}
                >
                  <BriefcaseIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Manage Requirements</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 flex flex-col gap-2 hover:bg-green-50 hover:border-green-300 transition-colors"
                  onClick={() => router.push('/analytics')}
                >
                  <PieChartIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">View Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  );
}