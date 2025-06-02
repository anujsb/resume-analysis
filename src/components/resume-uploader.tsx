// src/components/resume-uploader.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, FileText, CheckCircle } from 'lucide-react';

interface Skill {
  skill: string;
  proficiency: string;
}

interface Analysis {
  skills: Skill[];
  experienceLevel: string;
  workExperienceYears: string;
  summary: string;
  phone?: string;
}

interface ResumeUploaderProps {
  onAnalysisComplete: (analysis: Analysis, resumeText: string) => void;
}

export function ResumeUploader({ onAnalysisComplete }: ResumeUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, Word document, or text file.');
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setIsLoading(true);
    setUploadComplete(false);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data = await response.json();
      
      if (data.success) {
        setUploadComplete(true);
        
        // Call the callback with analysis data and resume text
        onAnalysisComplete(data.analysis, data.resumeText);
        
        // Reset upload complete state after a delay
        setTimeout(() => {
          setUploadComplete(false);
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to analyze resume');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <Card 
      className={`transition-all duration-200 ${
        dragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-dashed border-gray-300 hover:border-gray-400'
      } ${uploadComplete ? 'border-green-500 bg-green-50' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <CardContent className="p-8">
        <div className="text-center">
          {isLoading ? (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Analyzing your resume...
                </h3>
                <p className="text-gray-600">
                  This may take a few moments while we extract your information.
                </p>
              </div>
            </div>
          ) : uploadComplete ? (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-green-800">
                  Resume analyzed successfully!
                </h3>
                <p className="text-green-600">
                  Your profile has been updated with the extracted information.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                {dragActive ? (
                  <Upload className="h-12 w-12 text-blue-500" />
                ) : (
                  <FileText className="h-12 w-12 text-gray-400" />
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {dragActive ? 'Drop your resume here' : 'Upload your resume'}
                </h3>
                <p className="text-gray-600 mt-1">
                  Drag and drop your file here, or click to browse
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                
                <div className="text-xs text-gray-500">
                  Supported formats: PDF, Word (.doc, .docx), Text files
                  <br />
                  Maximum file size: 10MB
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}