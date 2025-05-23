"use client"

import { useEffect, useState } from "react"
import { CandidateWithAnalysis } from "@/types/candidate"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CandidatesListPage() {
  const [candidates, setCandidates] = useState<CandidateWithAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCandidates()
  }, [])

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

  const updateCandidateStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/candidates/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        loadCandidates()
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const updateCandidateRemark = async (id: number, remark: string) => {
    try {
      const response = await fetch(`/api/candidates/${id}/remark`, {
        method: 'PUT',
        body: JSON.stringify({ remark }),
      })
      if (response.ok) {
        loadCandidates()
      }
    } catch (error) {
      console.error("Failed to update remark:", error)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      hold: "bg-yellow-100 text-yellow-800",
      selected: "bg-green-100 text-green-800",
    }
    return colors[status as keyof typeof colors] || colors.new
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((item) => (
              <TableRow key={item.candidate.id}>
                <TableCell>{item.candidate.id}</TableCell>
                <TableCell>
                  <a 
                    href={`/candidates/${item.candidate.id}`}
                    className="hover:underline font-medium"
                  >
                    {item.candidate.name}
                  </a>
                </TableCell>
                <TableCell>
                  {new Date(item.candidate.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={item.candidate.status}
                    onValueChange={(value) => updateCandidateStatus(item.candidate.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="hold">Hold</SelectItem>
                      <SelectItem value="selected">Selected</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Add remark..."
                    value={item.candidate.remark || ""}
                    onChange={(e) => updateCandidateRemark(item.candidate.id, e.target.value)}
                    className="text-sm"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}