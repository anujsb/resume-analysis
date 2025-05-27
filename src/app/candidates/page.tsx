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

type CandidateStatus = "new" | "rejected" | "hold" | "selected";

export default function CandidatesListPage() {
  const [candidates, setCandidates] = useState<CandidateWithAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [remarkInputs, setRemarkInputs] = useState<{[key: number]: string}>({})
  const [statusUpdating, setStatusUpdating] = useState<{[key: number]: boolean}>({})
  const [remarkSaving, setRemarkSaving] = useState<{[key: number]: boolean}>({})

  useEffect(() => {
    loadCandidates()
  }, [])

  const loadCandidates = async () => {
    try {
      const response = await fetch("/api/candidates")
      const data = await response.json()
      if (data.success) {
        setCandidates(data.data)
        // Initialize remark inputs with current values
        const initialRemarks: {[key: number]: string} = {}
        data.data.forEach((item: CandidateWithAnalysis) => {
          initialRemarks[item.candidate.id] = item.candidate.remark || ""
        })
        setRemarkInputs(initialRemarks)
      }
    } catch (error) {
      console.error("Failed to load candidates:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateCandidateStatus = async (id: number, status: CandidateStatus) => {
    setStatusUpdating(prev => ({ ...prev, [id]: true }))
    
    try {
      const response = await fetch(`/api/candidates/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        // Update local state immediately for better UX
        setCandidates(prev => prev.map(item => 
          item.candidate.id === id 
            ? { ...item, candidate: { ...item.candidate, status } }
            : item
        ))
      } else {
        console.error("Failed to update status:", await response.text())
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setStatusUpdating(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleRemarkChange = (id: number, value: string) => {
    setRemarkInputs(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const saveRemark = async (id: number) => {
    const remark = remarkInputs[id] || ""
    setRemarkSaving(prev => ({ ...prev, [id]: true }))
    
    try {
      const response = await fetch(`/api/candidates/${id}/remark`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remark }),
      })
      if (response.ok) {
        // Update local state immediately
        setCandidates(prev => prev.map(item => 
          item.candidate.id === id 
            ? { ...item, candidate: { ...item.candidate, remark } }
            : item
        ))
      } else {
        console.error("Failed to update remark:", await response.text())
      }
    } catch (error) {
      console.error("Failed to update remark:", error)
    } finally {
      setRemarkSaving(prev => ({ ...prev, [id]: false }))
    }
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
              <TableHead className="w-[300px]">Remark</TableHead>
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
                  <div className="flex items-center gap-2">
                    <Select
                      value={item.candidate.status}
                      onValueChange={(value) => updateCandidateStatus(item.candidate.id, value as CandidateStatus)}
                      disabled={statusUpdating[item.candidate.id]}
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
                    {statusUpdating[item.candidate.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Badge className={getStatusBadgeColor(item.candidate.status)}>
                        {item.candidate.status}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add remark..."
                      value={remarkInputs[item.candidate.id] || ""}
                      onChange={(e) => handleRemarkChange(item.candidate.id, e.target.value)}
                      className="text-sm flex-1"
                      disabled={remarkSaving[item.candidate.id]}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !remarkSaving[item.candidate.id]) {
                          saveRemark(item.candidate.id)
                        }
                      }}
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => saveRemark(item.candidate.id)}
                      disabled={
                        remarkInputs[item.candidate.id] === item.candidate.remark ||
                        remarkSaving[item.candidate.id]
                      }
                    >
                      {remarkSaving[item.candidate.id] ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}