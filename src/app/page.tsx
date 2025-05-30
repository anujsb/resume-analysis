// // src/app/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { ResumeUploader } from "@/components/resume-uploader";
// import { AnalysisResult } from "@/components/analysis-result";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { CheckCircle2, FileText, Loader2, Plus, RefreshCw, Upload, Users, Users2 } from "lucide-react";
// import { JobRequirementsForm } from "@/components/job-requirements-form";
// import { JobRequirement } from "@/types/job-requirements";

// type CandidateWithAnalysis = {
//   candidate: {
//     id: number;
//     name: string;
//     email: string | null;
//     phone: string | null;
//     resumeText: string;
//     createdAt: string;
//   };
//   analysis: {
//     id: number;
//     candidateId: number;
//     skills: Array<{
//       skill: string;
//       proficiency: "beginner" | "intermediate" | "advanced" | "expert";
//     }>;
//     experienceLevel: "fresher" | "junior" | "mediocre" | "senior";
//     workExperienceYears: string;
//     summary: string;
//     createdAt: string;
//   };
// };

// export default function Home() {
//   const [currentTab, setCurrentTab] = useState<string>("upload");
//   const [candidatesList, setCandidatesList] = useState<CandidateWithAnalysis[]>([]);
//   const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithAnalysis | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [jobRequirements, setJobRequirements] = useState<JobRequirement | null>(null);
//   const [savedRequirements, setSavedRequirements] = useState<JobRequirement[]>([]);

//   const handleAnalysisComplete = (data: any) => {
//     const newCandidate = {
//       candidate: data.candidate,
//       analysis: data.analysis,
//     };
//     setSelectedCandidate(newCandidate);
//     setCandidatesList([newCandidate, ...candidatesList]);
//     setCurrentTab("result");
//   };

//   const loadCandidates = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch("/api/candidates");
//       const data = await response.json();
      
//       if (data.success && data.data) {
//         setCandidatesList(data.data);
//       }
//     } catch (error) {
//       console.error("Failed to load candidates:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadRequirements = async () => {
//     try {
//       const response = await fetch("/api/job-requirements");
//       const data = await response.json();
      
//       if (data.success) {
//         setSavedRequirements(data.data);
//       }
//     } catch (error) {
//       console.error("Failed to load requirements:", error);
//     }
//   };

//   useEffect(() => {
//     loadRequirements();
//   }, []);

//   const handleRequirementsSet = (requirement: JobRequirement) => {
//     setJobRequirements(requirement);
//     loadRequirements();
//   };

//   const selectCandidate = (candidate: CandidateWithAnalysis) => {
//     setSelectedCandidate(candidate);
//     setCurrentTab("result");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
//       <div className="container mx-auto py-8 px-4 max-w-7xl">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
//             AI Resume Matcher
//           </h1>
//           <p className="text-gray-600 text-lg max-w-2xl mx-auto">
//             Streamline your hiring process by matching candidates with job requirements using AI-powered analysis
//           </p>
//         </div>

//         <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
//           <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
//             <TabsList className="grid grid-cols-4 gap-4 w-full max-w-3xl mx-auto">
//               <TabsTrigger value="requirements" className="flex items-center gap-2 h-11">
//                 <FileText className="h-4 w-4" />
//                 Requirements
//               </TabsTrigger>
//               <TabsTrigger value="upload" className="flex items-center gap-2 h-11">
//                 <Upload className="h-4 w-4" />
//                 Upload Resume
//               </TabsTrigger>
//               <TabsTrigger value="candidates" className="flex items-center gap-2 h-11" onClick={loadCandidates}>
//                 <Users2 className="h-4 w-4" />
//                 Candidates
//               </TabsTrigger>
//               {selectedCandidate && (
//                 <TabsTrigger value="result" className="flex items-center gap-2 h-11">
//                   <CheckCircle2 className="h-4 w-4" />
//                   Analysis
//                 </TabsTrigger>
//               )}
//             </TabsList>
//           </div>

//           <TabsContent value="upload" className="mt-4">
//             <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />
//           </TabsContent>
          
//           <TabsContent value="candidates" className="mt-4">
//             {isLoading ? (
//               <div className="flex justify-center items-center py-12">
//                 <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
//               </div>
//             ) : candidatesList.length === 0 ? (
//               <div className="text-center py-12 bg-gray-50 rounded-lg">
//                 <h3 className="text-lg font-medium mb-2">No candidates found</h3>
//                 <p className="text-gray-600 mb-4">Upload a candidate resume to get started</p>
//                 <Button onClick={() => setCurrentTab("upload")}>
//                   <Plus className="h-4 w-4 mr-2" />
//                   Add Candidate
//                 </Button>
//               </div>
//             ) : (
//               <div className="grid gap-4">
//                 {candidatesList.map((item) => (
//                   <div 
//                     key={item.candidate.id} 
//                     className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
//                     onClick={() => selectCandidate(item)}
//                   >
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <h3 className="font-medium">{item.candidate.name || "Unknown Candidate"}</h3>
//                         {item.candidate.email && (
//                           <p className="text-sm text-gray-600">{item.candidate.email}</p>
//                         )}
//                       </div>
//                       <ExperienceLevelBadge 
//                         level={item.analysis.experienceLevel} 
//                         years={item.analysis.workExperienceYears} 
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </TabsContent>
          
//           <TabsContent value="requirements" className="mt-4 space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <h2 className="text-lg font-semibold mb-4">Set New Requirements</h2>
//                 <JobRequirementsForm 
//                   onRequirementsSet={handleRequirementsSet}
//                   savedRequirements={savedRequirements}
//                 />
//               </div>
//               {savedRequirements.length > 0 && (
//                 <div>
//                   <h2 className="text-lg font-semibold mb-4">Saved Requirements</h2>
//                   <div className="space-y-4">
//                     {savedRequirements.map((req) => (
//                       <Card key={req.id} className="hover:border-primary/50 transition-colors">
//                         <CardHeader>
//                           <CardTitle>{req.title}</CardTitle>
//                           <CardDescription>
//                             {req.requiredSkills.length} required skills • {req.minimumExperience}+ years
//                           </CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                           <div className="flex flex-wrap gap-2">
//                             {req.requiredSkills.map((skill, index) => (
//                               <Badge key={index} variant="secondary">
//                                 {skill}
//                               </Badge>
//                             ))}
//                           </div>
//                         </CardContent>
//                       </Card>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </TabsContent>
          
//           <TabsContent value="result" className="mt-4">
//             {selectedCandidate && (
//               <AnalysisResult 
//                 candidate={selectedCandidate.candidate} 
//                 analysis={selectedCandidate.analysis}
//                 jobRequirement={jobRequirements}
//                 savedRequirements={savedRequirements}
//               />
//             )}
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// }

// // Add the missing import
// import { ExperienceLevelBadge } from "@/components/experience-level-badge";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';

export default function RootPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (session.user?.role === 'candidate') {
      router.push('/profile');
    } else if (session.user?.role === 'recruiter') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner className="h-8 w-8 animate-spin" />
    </div>
  );
}