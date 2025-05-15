"use client";

import { Camera } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex items-center justify-center">
      <Camera className="mr-2 h-4 w-4 animate-spin" />
      <span>Processing...</span>
    </div>
  );
}