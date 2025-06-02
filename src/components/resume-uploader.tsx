// src/components/resume-uploader.tsx
"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ResumeUploaderProps {
  onAnalysisComplete: (data: any) => void;
}

export function ResumeUploader({ onAnalysisComplete }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    setError(null);
    
    // Check if there are any accepted files
    if (acceptedFiles.length === 0) {
      return;
    }
    
    // Take the first file
    const uploadedFile = acceptedFiles[0];
    
    // Check file type
    const validTypes = [
      "application/pdf", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain"
    ];
    
    if (!validTypes.includes(uploadedFile.type)) {
      setError("Please upload a PDF, DOC, DOCX, or TXT file.");
      return;
    }
    
    // Set the file
    setFile(uploadedFile);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"]
    },
    multiple: false,
  });

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a resume file");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      const data = await response.json();
      onAnalysisComplete(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-8 text-center rounded-lg cursor-pointer ${
            isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <p className="text-sm font-medium">Selected: {file.name}</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm">Drag and drop a resume file here, or click to select</p>
              <p className="text-xs text-gray-500">Supports PDF, DOC, DOCX, and TXT</p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={!file || isUploading}
          className="w-full mt-4"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Resume"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}