// src/components/candidate-details.tsx
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CandidateWithAnalysis, CandidateStatus } from "@/types/candidate";
import { Mail, Phone, Save, Globe } from "lucide-react";
import { translateText } from "@/lib/gemini";
import { ExperienceLevelBadge } from "./experience-level-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CandidateDetailsProps {
  candidate: CandidateWithAnalysis;
  onCandidateUpdate?: (updatedCandidate: CandidateWithAnalysis) => void;
}

export function CandidateDetails({ candidate, onCandidateUpdate }: CandidateDetailsProps) {
  const [currentStatus, setCurrentStatus] = useState<CandidateStatus>(candidate.candidate.status as CandidateStatus);
  const [currentRemark, setCurrentRemark] = useState(candidate.candidate.remark || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/candidates/${candidate.candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: currentStatus, remark: currentRemark }),
      });

      if (response.ok) {
        if (onCandidateUpdate) {
          const updatedCandidate = {
            ...candidate,
            candidate: { ...candidate.candidate, status: currentStatus, remark: currentRemark },
          };
          onCandidateUpdate(updatedCandidate);
        }
      } else {
        console.error("Failed to update candidate");
      }
    } catch (error) {
      console.error("Error updating candidate:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTranslate = async () => {
    try {
      setIsTranslating(true);
      const translated = await translateText(candidate.candidate.resumeText);
      setTranslatedText(translated);
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const getStatusBadgeColor = (status: CandidateStatus) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      hold: "bg-yellow-100 text-yellow-800",
      selected: "bg-green-100 text-green-800",
    };
    return colors[status] || colors.new;
  };

  return (
    <CardContent className="space-y-6 p-6">
      {/* Candidate Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{candidate.candidate.name}</h2>
        <div className="flex items-center gap-2">
          <ExperienceLevelBadge
            level={candidate.analysis.experienceLevel}
            years={candidate.analysis.workExperienceYears}
          />
          <Badge variant="outline" className={`${getStatusBadgeColor(currentStatus)} text-xs font-medium`}>
            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {candidate.candidate.email && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{candidate.candidate.email}</span>
          </div>
        )}
        {candidate.candidate.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{candidate.candidate.phone}</span>
          </div>
        )}
      </div>

      {/* Status and Remark */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="status" className="text-sm font-medium text-gray-700">
            Status
          </Label>
          <Select
            value={currentStatus}
            onValueChange={(value: CandidateStatus) => setCurrentStatus(value)}
            disabled={isUpdating}
          >
            <SelectTrigger id="status" className="w-40">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="hold">Hold</SelectItem>
              <SelectItem value="selected">Selected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-2">
          <Label htmlFor="remark" className="text-sm font-medium text-gray-700">
            Remark ({currentRemark.length}/100)
          </Label>
          <Input
            id="remark"
            value={currentRemark}
            onChange={(e) => setCurrentRemark(e.target.value.slice(0, 100))}
            placeholder="Add a remark..."
            maxLength={100}
            className="w-full sm:w-64"
            disabled={isUpdating}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isUpdating || (currentStatus === candidate.candidate.status && currentRemark === (candidate.candidate.remark || ""))}
          size="sm"
          className="w-fit"
        >
          <Save className="h-4 w-4 mr-2" />
          {isUpdating ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Professional Summary */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Professional Summary</h3>
        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
          {candidate.analysis.summary || "No summary available"}
        </p>
      </div>

      {/* Resume Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Resume Content</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTranslate}
            disabled={isTranslating}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            {isTranslating ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Translating...
              </>
            ) : (
              "Translate"
            )}
          </Button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          <pre className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
            {translatedText || candidate.candidate.resumeText || "No resume content available"}
          </pre>
        </div>
      </div>

      {/* Translation Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Translation</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleTranslate}
            disabled={isTranslating || !candidate.candidate.resumeText}
            size="sm"
            className="w-fit"
          >
            <Globe className="h-4 w-4 mr-2" />
            {isTranslating ? "Translating..." : "Translate Resume"}
          </Button>
        </div>
        {translatedText && (
          <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
            {translatedText}
          </p>
        )}
      </div>
    </CardContent>
  );
}