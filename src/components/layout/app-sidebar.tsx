"use client"
import { Calendar, FormInput, Home, Inbox, Search, Settings } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, User } from "lucide-react"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CandidateWithAnalysis } from "@/types/candidate"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar"
// import { navigation } from "@/config/navigation"
import Link from "next/link"

export function AppSidebar() {
  const [candidates, setCandidates] = useState<CandidateWithAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadCandidates = async () => {
      setIsLoading(true)
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

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link href="/dashboard" className="flex items-center">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link href="/requirements" className="flex items-center">
                    <Inbox className="mr-2 h-4 w-4" />
                    Job Requirements
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible defaultOpen className="group/collapsible">
                <CollapsibleTrigger asChild>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="w-full">
                      <div className="flex w-full items-center">
                        <a href="/candidates" className="flex w-full items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Candidates</span>
                        </a>
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <SidebarMenuSkeleton key={i} showIcon />
                        ))
                      ) : (
                        candidates.map((item) => (
                          <SidebarMenuItem key={item.candidate.id}>
                            <SidebarMenuButton asChild>
                              <Link href={`/candidates/${item.candidate.id}`}>
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {getInitials(item.candidate.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{item.candidate.name}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))
                      )}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link href="/reports" className="flex items-center">
                    <FormInput className="mr-2 h-4 w-4" />
                    Reports
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
