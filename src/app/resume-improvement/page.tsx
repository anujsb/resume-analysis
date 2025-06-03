'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Analysis } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from "@/components/protected-route";
import { JobRequirement } from "@/types/job-requirements";
import { 
  Loader2, 
  AlertCircle, 
  FileEdit,
  Target,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  User,
  Building,
  Sparkles,
  Copy,
  RefreshCw,
  BookOpen,
  Award,
  Zap
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function ResumeImprovementPage() {
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [requirements, setRequirements] = useState<JobRequirement[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<JobRequirement | null>(null);
  const [suggestions, setSuggestions] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
        toast.error("Failed to load data. Please refresh the page.");
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
        toast.success("Resume suggestions generated successfully!");
      } else {
        setError('Failed to generate suggestions. Please try again.');
        toast.error("Failed to generate suggestions");
      }
    } catch (error) {
      setError('Failed to generate suggestions. Please try again.');
      console.error('Failed to generate suggestions:', error);
      toast.error("An error occurred while generating suggestions");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(suggestions);
      setCopied(true);
      toast.success("Suggestions copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const formatSuggestions = (text: string) => {
    // Parse and format the suggestions text
    const sections = text.split('\n\n');
    return sections.map((section, index) => {
      if (section.trim().startsWith('##') || section.trim().startsWith('#')) {
        const title = section.replace(/#+\s*/, '');
        return (
          <div key={index} className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              {title}
            </h3>
          </div>
        );
      } else if (section.trim().startsWith('•') || section.trim().startsWith('-')) {
        const items = section.split('\n').filter(item => item.trim());
        return (
          <div key={index} className="mb-4">
            <ul className="space-y-2">
              {items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{item.replace(/^[•\-]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      } else if (section.trim()) {
        return (
          <div key={index} className="mb-4">
            <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border-l-4 border-blue-200">
              {section.trim()}
            </p>
          </div>
        );
      }
      return null;
    }).filter(Boolean);
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["candidate"]}>
        <div className="min-h-screen border rounded-2xl bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <FileEdit className="h-8 w-8 text-white" />
                </div>
                <Loader2 className="absolute -top-2 -right-2 h-6 w-6 animate-spin text-purple-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Loading Your Data</h3>
                <p className="text-gray-600 text-sm">Preparing resume analysis...</p>
              </div>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <div className="container mx-auto py-8 px-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white shadow-lg">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Resume Enhancement
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Get AI-powered suggestions to optimize your resume for specific job requirements
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="max-w-4xl mx-auto mb-6">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            {/* Left Column - Controls */}
            <div className="space-y-6">
              {/* Profile Status */}
              <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-purple-600" />
                    Profile Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${analysis ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                      <span className="text-sm font-medium">
                        {session?.user?.name || 'User'} Resume
                      </span>
                    </div>
                    <Badge variant={analysis ? "default" : "secondary"} className="bg-green-100 text-green-700 border-green-200">
                      {analysis ? "Analyzed" : "Pending"}
                    </Badge>
                  </div>
                  
                  {analysis && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                        <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                        <div className="text-xs text-blue-700 font-medium">Experience</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                        <Award className="h-6 w-6 text-green-600 mx-auto mb-1" />
                        <div className="text-xs text-green-700 font-medium">Skills</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                        <Zap className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                        <div className="text-xs text-purple-700 font-medium">Ready</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Job Selection */}
              <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-pink-600" />
                    Target Position
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{requirements.length} positions available</span>
                    {selectedRequirement && (
                      <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                        Selected
                      </Badge>
                    )}
                  </div>

                  <Select
                    onValueChange={(id) => {
                      const requirement = requirements.find(r => r.id?.toString() === id);
                      if (requirement) {
                        setSelectedRequirement(requirement);
                        setSuggestions(""); // Clear previous suggestions
                        setError(null);
                      }
                    }}
                    value={selectedRequirement?.id?.toString() || ""}
                  >
                    <SelectTrigger className="w-full h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors">
                      <SelectValue placeholder="Choose a target position..." />
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
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <h3 className="font-semibold text-gray-900 mb-2">{selectedRequirement.title}</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <Building className="h-4 w-4 inline mr-1" />
                          {selectedRequirement.experienceLevel} • {selectedRequirement.minimumExperience}+ years
                        </p>
                        {selectedRequirement.primarySkills.length > 0 && (
                          <div className="text-xs text-gray-600">
                            <p className="font-medium mb-1">Key Skills:</p>
                            <p className="line-clamp-2">{selectedRequirement.primarySkills.join(", ")}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={generateSuggestions}
                    disabled={!selectedRequirement || generating || !analysis}
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Generate Suggestions
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Suggestions Display */}
            <div className="lg:sticky lg:top-8 h-fit">
              {suggestions ? (
                <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        Enhancement Suggestions
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="hover:bg-purple-50 hover:border-purple-300 transition-colors"
                      >
                        {copied ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <Separator className="mb-4" />
                  <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-4">
                        {formatSuggestions(suggestions)}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center h-[600px] text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
                      <TrendingUp className="h-12 w-12 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Ready to Enhance
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm">
                      Select a target position and generate AI-powered suggestions to optimize your resume for better job matches
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <span>Personalized recommendations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span>Job-specific optimization</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span>AI-powered insights</span>
                      </div>
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