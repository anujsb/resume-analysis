'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Analysis } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/protected-route";
import { EnhancedProfile } from "@/components/enhanced-profile";
import { Loader2, AlertCircle, RefreshCw, User, Mail, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleAnalysisComplete = (newAnalysis: Analysis) => {
    setAnalysis(newAnalysis);
    setError(null);
  };

  // Function to fetch analysis data
  const fetchAnalysis = async (retryCount = 0) => {
    if (retryCount === 0) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
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
      setRefreshing(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchAnalysis();
  }, []);

  const handleRefresh = () => {
    fetchAnalysis(1);
  };

  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      {/* <div className="min-h-screen border rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40"> */}
      <div className="min-h-screen">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-12 max-w-7xl">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent leading-tight">
                  My Profile
                </h1>
              </div>
              <p className="text-slate-600 text-lg max-w-2xl leading-relaxed ml-1">
                Manage your professional profile and unlock career insights powered by AI
              </p>
            </div>
            
            {!loading && analysis && (
              <div className="flex-shrink-0 self-start lg:self-center">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="group inline-flex items-center gap-3 px-6 py-3 text-sm font-medium text-slate-700 bg-white/90 backdrop-blur-sm hover:bg-white hover:text-slate-900 border border-slate-200/80 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <RefreshCw className={`h-4 w-4 transition-transform duration-300 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                  <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-10 border-amber-200/60 bg-gradient-to-r from-amber-50/90 to-orange-50/90 backdrop-blur-sm shadow-lg rounded-xl">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-amber-800 font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center w-full py-24">
              <Card className="p-12 bg-white/90 backdrop-blur-md border-0 shadow-2xl shadow-blue-500/10 rounded-2xl">
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-blue-100 animate-pulse"></div>
                    <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-semibold text-slate-800">Loading your profile</p>
                    <p className="text-slate-500">Analyzing your professional data...</p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            /* Main Content */
            <div className="grid gap-10">
              {/* Personal Information Card */}
              <Card className="group bg-white/90 backdrop-blur-md border-0 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-6 relative">
                  <CardTitle className="flex items-center gap-4 text-2xl text-slate-800">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-blue-500/30 transition-shadow duration-300">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-bold">Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 relative">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="group/item flex items-center gap-5 p-6 bg-gradient-to-br from-slate-50/90 to-gray-50/90 rounded-2xl border border-slate-100/80 hover:border-blue-200/60 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                      <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow-sm group-hover/item:shadow-md transition-shadow duration-300">
                        <User className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="space-y-2 flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          Full Name
                        </span>
                        <p className="text-xl font-bold text-slate-800 leading-tight truncate">
                          {session?.user?.name || 'Guest User'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="group/item flex items-center gap-5 p-6 bg-gradient-to-br from-slate-50/90 to-gray-50/90 rounded-2xl border border-slate-100/80 hover:border-blue-200/60 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                      <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow-sm group-hover/item:shadow-md transition-shadow duration-300">
                        <Mail className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="space-y-2 flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          Email Address
                        </span>
                        <p className="text-xl font-bold text-slate-800 leading-tight break-words">
                          {session?.user?.email || 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Profile Component */}
              <div className="relative">
                {refreshing && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-2xl z-10 flex items-center justify-center">
                    <div className="flex items-center gap-4 px-8 py-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
                      <div className="relative flex-shrink-0">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        <div className="absolute inset-0 h-6 w-6 rounded-full border-2 border-blue-100 animate-pulse"></div>
                      </div>
                      <span className="text-lg font-semibold text-slate-800">Updating profile...</span>
                    </div>
                  </div>
                )}
                
                <EnhancedProfile 
                  analysis={analysis}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}