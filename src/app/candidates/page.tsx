"use client"

import { useEffect, useState } from "react"
import { CandidateWithAnalysis } from "@/types/candidate"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function CandidatesListPage() {
  const [candidates, setCandidates] = useState<CandidateWithAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const response = await fetch("/api/candidates")
        const data = await response.json()
        if (data.success) {
          setCandidates(data.data)
        }
      } catch (error) {
        console.error("Failed to load candidates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCandidates()
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">All Candidates</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {candidates.map((item) => (
          <Card
            key={item.candidate.id}
            className="p-4 hover:shadow-md transition-shadow"
          >
            <a
              href={`/candidates/${item.candidate.id}`}
              className="flex items-center space-x-4"
            >
              <Avatar>
                <AvatarFallback>
                  {getInitials(item.candidate.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{item.candidate.name}</h2>
                <p className="text-sm text-gray-500">
                  {item.analysis.experienceLevel} • {item.analysis.workExperienceYears} years
                </p>
              </div>
            </a>
          </Card>
        ))}
      </div>
    </div>
  )
}