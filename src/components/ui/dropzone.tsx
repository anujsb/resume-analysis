// src/components/ui/dropzone.tsx
"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileWithPreview extends File {
  preview?: string;
}

interface DropzoneProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  onFileChange: (file: File) => void;
  accept?: Record<string, string[]>;
  loading?: boolean;
  maxSize?: number;
  maxFiles?: number;
}

export function Dropzone({
  className,
  onFileChange,
  accept = {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "text/plain": [".txt"],
  },
  loading = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 1,
  ...props
}: DropzoneProps) {
  const [file, setFile] = useState<FileWithPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles?.length > 0) {
        const selected = acceptedFiles[0];
        setFile(
          Object.assign(selected, {
            preview: URL.createObjectURL(selected),
          })
        );
        onFileChange(selected);
        setError(null);
      }
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    multiple: false,
    onDropRejected: (fileRejections) => {
      if (fileRejections[0]?.errors[0]?.code === "file-too-large") {
        setError(`File is too large. Max size is ${maxSize / (1024 * 1024)}MB`);
      } else if (fileRejections[0]?.errors[0]?.code === "file-invalid-type") {
        setError("Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file");
      } else {
        setError(fileRejections[0]?.errors[0]?.message || "Invalid file");
      }
    },
  });

  const removeFile = () => {
    setFile(null);
    URL.revokeObjectURL(file?.preview || "");
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-dashed p-6 transition-colors",
          isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:bg-gray-50",
          file ? "bg-gray-50" : "",
          className
        )}
        {...props}
      >
        <input {...getInputProps()} />

        {loading ? (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="mb-2 h-10 w-10 animate-spin text-gray-400" />
            <p>Processing file...</p>
          </div>
        ) : file ? (
          <div className="flex w-full flex-col items-center space-y-2">
            <File className="h-10 w-10 text-primary" />
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                {file.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 text-center">
            <UploadCloud className="h-10 w-10 text-gray-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                Drag & drop file or <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-gray-500">
                Supports PDF, DOC, DOCX, and TXT files (max {maxSize / (1024 * 1024)}MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}