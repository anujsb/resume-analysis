// src/app/candidates/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CandidateWithAnalysis } from "@/types/candidate"
import { JobRequirement } from "@/types/job-requirements"
import { Loader2, Bookmark, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AnalysisResult } from "@/components/analysis-result"

type CandidateStatus = "new" | "rejected" | "hold" | "selected";

export default function CandidatePage() {
  const params = useParams()
  const router = useRouter()
  const [candidate, setCandidate] = useState<CandidateWithAnalysis | null>(null)
  const [savedRequirements, setSavedRequirements] = useState<JobRequirement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load candidate data
        const candidateResponse = await fetch(`/api/candidates`, {
          method: "POST",
          body: JSON.stringify({ id: params.id }),
        })
        const candidateData = await candidateResponse.json()
        
        // Load requirements data
        const requirementsResponse = await fetch("/api/job-requirements")
        const requirementsData = await requirementsResponse.json()
        
        if (candidateData.success) {
          setCandidate(candidateData.data)
        }
        if (requirementsData.success) {
          setSavedRequirements(requirementsData.data)
        }
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadData()
    }
  }, [params.id])

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const getStatusBadgeColor = (status: CandidateStatus) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800", 
      hold: "bg-yellow-100 text-yellow-800",
      selected: "bg-green-100 text-green-800",
    }
    return colors[status] || colors.new
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!candidate) {
    return (
      <Card className="container mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Candidate not found</h3>
          <p className="text-gray-600 mb-4">The requested candidate could not be found.</p>
          <Button variant="outline" onClick={() => router.push('/candidates')}>
            Back to Candidates
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="bg-white rounded-lg border shadow-sm p-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border">
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                {getInitials(candidate.candidate.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{candidate.candidate.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground">
                  {candidate.analysis.experienceLevel.charAt(0).toUpperCase() + 
                   candidate.analysis.experienceLevel.slice(1)} • 
                  {candidate.analysis.workExperienceYears} years experience
                </p>
                <Badge className={getStatusBadgeColor(candidate.candidate.status as CandidateStatus)}>
                  {candidate.candidate.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push('/candidates')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status and Remark Display */}
        {candidate.candidate.remark && (
          <Card className="mb-4 bg-blue-50 border-blue-200">
            <div className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Remarks</h3>
              <p className="text-blue-800 text-sm">{candidate.candidate.remark}</p>
            </div>
          </Card>
        )}
        
        <Separator className="my-4" />
        
        {/* Analysis Section */}
        <AnalysisResult 
          candidate={candidate.candidate}
          analysis={candidate.analysis}
          savedRequirements={savedRequirements}
        />
      </div>
    </div>
  )
}