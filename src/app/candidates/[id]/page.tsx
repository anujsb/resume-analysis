"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CandidateWithAnalysis } from "@/types/candidate"
import { JobRequirement } from "@/types/job-requirements"
import { Loader2, Bookmark, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { AnalysisResult } from "@/components/analysis-result"

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
              <p className="text-muted-foreground">
                {candidate.analysis.experienceLevel.charAt(0).toUpperCase() + 
                 candidate.analysis.experienceLevel.slice(1)} • 
                {candidate.analysis.workExperienceYears} years experience
              </p>
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