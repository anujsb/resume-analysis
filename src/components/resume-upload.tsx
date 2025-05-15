"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResumeAnalysisResponse } from "@/types";
import { LoadingState } from "@/components/loading-state";
import { AnalysisResults } from "@/components/analysis-results";
import { Upload, FileType } from "lucide-react";

export function ResumeUpload() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<ResumeAnalysisResponse | null>(null);

  const onSubmit = async (data: any) => {
    try {
      setIsUploading(true);
      setError(null);
      setAnalysisResults(null);

      const formData = new FormData();
      formData.append("file", data.resume[0]);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload and analyze the resume");
      }

      const result = await response.json();
      setAnalysisResults(result);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      {!analysisResults ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>
              Upload a candidate resume to analyze skills and experience level.
              We support PDF, DOCX, DOC, and TXT files.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input
                  id="resume"
                  type="file"
                  {...register("resume", { 
                    required: "Resume file is required",
                    validate: {
                      validFileType: (files) => {
                        const file = files[0];
                        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
                        return validTypes.includes(file.type) || "File type must be PDF, DOCX, DOC or TXT";
                      }
                    }
                  })}
                  accept=".pdf,.docx,.doc,.txt"
                  className="cursor-pointer"
                  disabled={isUploading}
                />
                {errors.resume && (
                  <p className="text-sm text-red-500">
                    {errors.resume.message as string}
                  </p>
                )}
              </div>
              
              <Button type="submit" disabled={isUploading} className="w-full">
                {isUploading ? (
                  <LoadingState />
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Upload & Analyze
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <AnalysisResults results={analysisResults} />
          <div className="flex justify-center">
            <Button onClick={() => setAnalysisResults(null)}>
              Analyze Another Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}