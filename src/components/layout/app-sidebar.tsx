"use client"
import { Calendar, FormInput, Home, Inbox, Search, Settings } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, User } from "lucide-react"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CandidateWithAnalysis } from "@/types/candidate"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

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
import { recruiterNavigation, candidateNavigation } from "@/config/navigation"
import Link from "next/link"

export function AppSidebar() {
  const { data: session } = useSession()
  const [candidates, setCandidates] = useState<CandidateWithAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const navigation = session?.user?.role === 'candidate' ? candidateNavigation : recruiterNavigation

  useEffect(() => {
    if (session?.user?.role !== 'recruiter') return;

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
  }, [session])

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }

  if (!session) return null;

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton>
                    <Link href={item.href} className="flex items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="ml-2">Signed in as {session.user?.name}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => signOut()}>
                  <div className="flex items-center text-red-600">
                    <Settings className="mr-2 h-4 w-4" />
                    Logout
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
