import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, CheckCircle, XCircle, User, Database, ChevronRight } from "lucide-react";

export default function DashboardDemo() {
  const [uploadState, setUploadState] = useState("idle"); // idle, uploading, success, error
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);

  // Demo data
  const candidateData = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    skills: [
      { skill: "React", proficiency: 5 },
      { skill: "TypeScript", proficiency: 4 },
      { skill: "Node.js", proficiency: 4 },
      { skill: "GraphQL", proficiency: 3 },
      { skill: "AWS", proficiency: 2 },
    ],
    experienceLevel: "mediocre",
    yearsOfExperience: 5
  };

  const handleUpload = () => {
    setUploadState("uploading");
    setProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadState("success");
          setTimeout(() => setStep(2), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  // Experience level to badge color
  const experienceBadgeColor = {
    fresher: "bg-blue-100 text-blue-800",
    junior: "bg-green-100 text-green-800",
    mediocre: "bg-yellow-100 text-yellow-800",
    senior: "bg-purple-100 text-purple-800"
  };

  // Proficiency level to color
  const proficiencyColor = (level) => {
    switch(level) {
      case 1: return "bg-gray-200";
      case 2: return "bg-blue-400";
      case 3: return "bg-green-400";
      case 4: return "bg-yellow-400";
      case 5: return "bg-purple-400";
      default: return "bg-gray-200";
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Resume Analyzer for Recruiters
          </h1>
          <p className="text-gray-600 mt-2">
            Upload candidate resumes to get AI-powered insights into their skills and experience
          </p>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar - Upload section */}
          <div className="lg:col-span-1">
            <Card className="shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
              
              {/* Step 1: Upload */}
              <div className={`mb-4 ${step !== 1 && 'opacity-50'}`}>
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                    1
                  </div>
                  <span className="font-medium">Upload Resume</span>
                </div>
                
                {step === 1 && (
                  <div className="pl-11">
                    <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {uploadState === "idle" && (
                        <>
                          <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                          <p className="text-sm text-gray-500 mb-4">
                            PDF, DOCX, DOC or TXT files
                          </p>
                          <Button 
                            onClick={handleUpload}
                            className="w-full"
                          >
                            Select File
                          </Button>
                        </>
                      )}
                      
                      {uploadState === "uploading" && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium">Uploading and analyzing...</p>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                      
                      {uploadState === "success" && (
                        <div className="flex items-center justify-center text-green-500">
                          <CheckCircle className="h-10 w-10" />
                        </div>
                      )}
                      
                      {uploadState === "error" && (
                        <div className="flex items-center justify-center text-red-500">
                          <XCircle className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Step 2: View Analysis */}
              <div className={`${step !== 2 && 'opacity-50'}`}>
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">
                    2
                  </div>
                  <span className="font-medium">View Analysis</span>
                </div>
                
                {step === 2 && (
                  <div className="pl-11 pt-2">
                    <p className="text-sm text-gray-600">
                      View the AI-generated analysis of the candidate's resume including skills, experience level, and more.
                    </p>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Upload another button */}
            {step === 2 && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setStep(1);
                    setUploadState("idle");
                  }}
                >
                  Analyze Another Resume
                </Button>
              </div>
            )}
          </div>
          
          {/* Main content area - Analysis */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    No Resume Analyzed Yet
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Upload a candidate's resume to see AI-powered analysis of their skills and experience level.
                  </p>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                {/* Candidate Info */}
                <Card className="shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <User className="h-5 w-5 text-blue-500 mr-2" />
                    <h2 className="text-xl font-semibold">Candidate Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{candidateData.name}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{candidateData.email}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{candidateData.phone}</p>
                    </div>
                  </div>
                </Card>
                
                {/* Experience Level */}
                <Card className="shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <Database className="h-5 w-5 text-blue-500 mr-2" />
                    <h2 className="text-xl font-semibold">Experience Level</h2>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between mb-4">
                    <div>
                      <Badge className={experienceBadgeColor[candidateData.experienceLevel]}>
                        {candidateData.experienceLevel.charAt(0).toUpperCase() + candidateData.experienceLevel.slice(1)}
                      </Badge>
                      <p className="mt-2 text-gray-600 text-sm">
                        {candidateData.yearsOfExperience} years of total work experience
                      </p>
                    </div>
                    
                    <div className="flex mt-4 md:mt-0">
                      {['fresher', 'junior', 'mediocre', 'senior'].map((level, i) => (
                        <div key={level} className="flex flex-col items-center mx-2">
                          <div 
                            className={`w-4 h-4 rounded-full ${candidateData.experienceLevel === level ? 'bg-blue-500' : 'bg-gray-200'}`}
                          ></div>
                          <div className="h-1 w-6 bg-gray-200 mt-1"></div>
                          <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                            {i === 0 && '0-1yr'}
                            {i === 1 && '1-3yr'}
                            {i === 2 && '3-8yr'}
                            {i === 3 && '8yr+'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
                
                {/* Skills & Proficiency */}
                <Card className="shadow-md p-6">
                  <div className="flex items-center mb-6">
                    <ChevronRight className="h-5 w-5 text-blue-500 mr-2" />
                    <h2 className="text-xl font-semibold">Skills & Proficiency</h2>
                  </div>
                  
                  <div className="space-y-5">
                    {candidateData.skills.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{skill.skill}</span>
                          <Badge variant={skill.proficiency >= 4 ? "default" : "outline"}>
                            {skill.proficiency === 1 && "Beginner"}
                            {skill.proficiency === 2 && "Basic"}
                            {skill.proficiency === 3 && "Intermediate"}
                            {skill.proficiency === 4 && "Advanced"}
                            {skill.proficiency === 5 && "Expert"}
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${proficiencyColor(skill.proficiency)}`}
                            style={{ width: `${skill.proficiency * 20}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}