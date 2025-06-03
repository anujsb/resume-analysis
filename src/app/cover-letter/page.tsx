'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Analysis } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from "@/components/protected-route";
import { JobRequirement } from "@/types/job-requirements";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Briefcase, 
  Sparkles, 
  Copy, 
  Download, 
  RefreshCw,
  CheckCircle,
  User,
  Building
} from "lucide-react";
import { toast } from "sonner";

export default function CoverLetterPage() {
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [requirements, setRequirements] = useState<JobRequirement[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<JobRequirement | null>(null);
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

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

        if (profileData.success && profileData.data?.analysis) {
          setAnalysis(profileData.data.analysis);
        }
        if (requirementsData.success) {
          setRequirements(requirementsData.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error("Failed to load data. Please refresh the page.");
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
        toast.success("Cover letter generated successfully!");
      } else {
        toast.error("Failed to generate cover letter");
      }
    } catch (error) {
      console.error('Failed to generate cover letter:', error);
      toast.error("An error occurred while generating the cover letter");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      toast.success("Cover letter copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const downloadCoverLetter = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${selectedRequirement?.title?.replace(/\s+/g, '-').toLowerCase() || 'job'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded!");
  };

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto py-8 px-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg">
                <FileText className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Cover Letter Generator
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Create personalized cover letters tailored to specific job requirements using AI
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            {/* Left Column - Job Selection */}
            <div className="space-y-6">
              {/* Profile Status */}
              <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-blue-600" />
                    Profile Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">
                        {session?.user?.name || 'User'} Profile
                      </span>
                    </div>
                    <Badge variant={analysis ? "default" : "secondary"} className="bg-green-100 text-green-700 border-green-200">
                      {analysis ? "Ready" : "Loading..."}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Job Selection */}
              <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="h-5 w-5 text-indigo-600" />
                    Select Job Position
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{requirements.length} positions available</span>
                    {selectedRequirement && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Selected
                      </Badge>
                    )}
                  </div>

                  <Select
                    onValueChange={(id) => {
                      const requirement = requirements.find(r => r.id?.toString() === id);
                      if (requirement) {
                        setSelectedRequirement(requirement);
                        setCoverLetter(""); // Clear previous cover letter
                      }
                    }}
                    value={selectedRequirement?.id?.toString() || ""}
                  >
                    <SelectTrigger className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors">
                      <SelectValue placeholder="Choose a job position..." />
                    </SelectTrigger>
                    <SelectContent>
                      {requirements.map((req) => (
                        <SelectItem 
                          key={req.id} 
                          value={req.id?.toString() || ''}
                          className="py-3"
                        >
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{req.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Selected Job Details */}
                  {selectedRequirement && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-gray-900 mb-2">{selectedRequirement.title}</h3>
                      <div className="text-xs text-gray-600 space-y-2">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span>Experience: {selectedRequirement.minimumExperience}+ years ({selectedRequirement.experienceLevel})</span>
                        </div>
                        {selectedRequirement.primarySkills.length > 0 && (
                          <p>Primary Skills: {selectedRequirement.primarySkills.join(", ")}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={generateCoverLetter}
                    disabled={!selectedRequirement || isGenerating || !analysis}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Cover Letter
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Cover Letter Display */}
            <div className="lg:sticky lg:top-8 h-fit">
              {coverLetter ? (
                <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Your Cover Letter
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                          className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                          {copied ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadCoverLetter}
                          className="hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <Separator className="mb-4" />
                  <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                      <Textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="min-h-[580px] border-0 resize-none font-serif text-base leading-relaxed bg-transparent focus:ring-0 p-6"
                        placeholder="Your generated cover letter will appear here..."
                      />
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center h-[600px] text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Ready to Generate
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm">
                      Select a job position and click "Generate Cover Letter" to create your personalized cover letter
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Sparkles className="h-4 w-4" />
                      <span>AI-powered personalization</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}