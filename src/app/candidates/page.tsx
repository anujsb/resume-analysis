"use client"

import { useEffect, useState } from "react"
import { CandidateWithAnalysis } from "@/types/candidate"
import { Loader2, Users, Search, Filter, Calendar, User, MessageSquare, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type CandidateStatus = "new" | "rejected" | "hold" | "selected";

export default function CandidatesListPage() {
  const [candidates, setCandidates] = useState<CandidateWithAnalysis[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateWithAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [remarkInputs, setRemarkInputs] = useState<{[key: number]: string}>({})
  const [statusUpdating, setStatusUpdating] = useState<{[key: number]: boolean}>({})
  const [remarkSaving, setRemarkSaving] = useState<{[key: number]: boolean}>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    loadCandidates()
  }, [])

  useEffect(() => {
    filterCandidates()
  }, [candidates, searchTerm, statusFilter])

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

  const filterCandidates = () => {
    let filtered = candidates

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.candidate.id.toString().includes(searchTerm)
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.candidate.status === statusFilter)
    }

    setFilteredCandidates(filtered)
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
      new: "bg-blue-50 text-blue-700 border-blue-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      hold: "bg-amber-50 text-amber-700 border-amber-200",
      selected: "bg-emerald-50 text-emerald-700 border-emerald-200",
    }
    return colors[status] || colors.new
  }

  const getStatusIcon = (status: CandidateStatus) => {
    const icons = {
      new: <AlertCircle className="h-3 w-3" />,
      rejected: <XCircle className="h-3 w-3" />,
      hold: <Clock className="h-3 w-3" />,
      selected: <CheckCircle2 className="h-3 w-3" />,
    }
    return icons[status] || icons.new
  }

  const getStatusCounts = () => {
    const counts = candidates.reduce((acc, item) => {
      acc[item.candidate.status] = (acc[item.candidate.status] || 0) + 1
      return acc
    }, {} as Record<CandidateStatus, number>)

    return {
      total: candidates.length,
      new: counts.new || 0,
      selected: counts.selected || 0,
      hold: counts.hold || 0,
      rejected: counts.rejected || 0,
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading candidates...</p>
        </div>
      </div>
    )
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Candidates Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage and track all candidate applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.total}</div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                New
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{statusCounts.new}</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Selected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">{statusCounts.selected}</div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                On Hold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700">{statusCounts.hold}</div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{statusCounts.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="selected">Selected</SelectItem>
                    <SelectItem value="hold">On Hold</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Showing {filteredCandidates.length} of {candidates.length} candidates
            </div>
          </CardContent>
        </Card>

        {/* Candidates Table */}
        <Card className="shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[80px] font-semibold text-gray-700">ID</TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Candidate
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Application Date
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="w-[350px] font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Remarks
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No candidates found</p>
                        <p className="text-sm">Try adjusting your search or filter criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCandidates.map((item) => (
                    <TableRow key={item.candidate.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-mono text-sm text-gray-600">
                        #{item.candidate.id}
                      </TableCell>
                      <TableCell>
                        <a 
                          href={`/candidates/${item.candidate.id}`}
                          className="hover:underline font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {item.candidate.name}
                        </a>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(item.candidate.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Select
                            value={item.candidate.status}
                            onValueChange={(value) => updateCandidateStatus(item.candidate.id, value as CandidateStatus)}
                            disabled={statusUpdating[item.candidate.id]}
                          >
                            <SelectTrigger className="w-[140px] bg-white">
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
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          ) : (
                            <Badge 
                              variant="outline" 
                              className={`${getStatusBadgeColor(item.candidate.status)} flex items-center gap-1 px-2 py-1`}
                            >
                              {getStatusIcon(item.candidate.status)}
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
                            className="text-sm flex-1 bg-white"
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
                            className="whitespace-nowrap"
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}