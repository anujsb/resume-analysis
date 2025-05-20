"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExperienceLevelBadge } from "@/components/experience-level-badge";
import { AnalysisResult } from "@/components/analysis-result";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, RefreshCw, Search, Mail, Calendar, Filter, SortDesc, Grid, List, X, Plus, Bookmark } from "lucide-react";
import { CandidateWithAnalysis } from "@/types/candidate";
import { JobRequirement } from "@/types/job-requirements";
import { Separator } from "@/components/ui/separator";

interface ViewMode {
  type: "grid" | "list";
}

function CandidatesList() {
  const [candidatesList, setCandidatesList] = useState<CandidateWithAnalysis[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode["type"]>("list");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filterExperience, setFilterExperience] = useState<string>("all");
  const [savedRequirements, setSavedRequirements] = useState<JobRequirement[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/candidates");
      const data = await response.json();
      if (data.success) {
        setCandidatesList(data.data);
        
        const id = searchParams.get("id");
        if (id) {
          const candidate = data.data.find((c: CandidateWithAnalysis) => 
            c.candidate.id.toString() === id
          );
          if (candidate) setSelectedCandidate(candidate);
        }
      }
    } catch (error) {
      console.error("Failed to load candidates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRequirements = async () => {
    try {
      const response = await fetch("/api/job-requirements");
      const data = await response.json();
      if (data.success) {
        setSavedRequirements(data.data);
      }
    } catch (error) {
      console.error("Failed to load job requirements:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCandidates();
    await loadRequirements();
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadCandidates();
    loadRequirements();
  }, [searchParams]);

  useEffect(() => {
    // Update URL when a candidate is selected
    if (selectedCandidate) {
      router.push(`/candidates?id=${selectedCandidate.candidate.id}`);
    } else {
      router.push('/candidates');
    }
  }, [selectedCandidate, router]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const filteredAndSortedCandidates = candidatesList
    .filter(item => {
      const matchesSearch = 
        item.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.candidate.email && item.candidate.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.analysis.skills.some(s => s.skill.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesExperience = 
        filterExperience === "all" || 
        item.analysis.experienceLevel === filterExperience;

      return matchesSearch && matchesExperience;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.candidate.createdAt).getTime() - new Date(a.candidate.createdAt).getTime();
        case "oldest":
          return new Date(a.candidate.createdAt).getTime() - new Date(b.candidate.createdAt).getTime();
        case "experience":
          return parseInt(b.analysis.workExperienceYears) - parseInt(a.analysis.workExperienceYears);
        case "alphabetical":
          return a.candidate.name.localeCompare(b.candidate.name);
        default:
          return 0;
      }
    });

  const renderCandidateCard = (item: CandidateWithAnalysis) => (
    <Card 
      key={item.candidate.id}
      className={`hover:border-primary/50 shadow-sm hover:shadow transition-all cursor-pointer ${
        selectedCandidate?.candidate.id === item.candidate.id ? 'border-primary border-2' : ''
      }`}
      onClick={() => setSelectedCandidate(item)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(item.candidate.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              {item.candidate.name}
              {selectedCandidate?.candidate.id === item.candidate.id && (
                <Badge className="ml-1">Active</Badge>
              )}
            </CardTitle>
            {item.candidate.email && (
              <CardDescription className="flex items-center gap-1 text-xs">
                <Mail className="h-3 w-3" />
                {item.candidate.email}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2 pt-2">
          {item.analysis.skills.slice(0, viewMode === "grid" ? 3 : 5).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill.skill}
            </Badge>
          ))}
          {item.analysis.skills.length > (viewMode === "grid" ? 3 : 5) && (
            <Badge variant="outline" className="text-xs">
              +{item.analysis.skills.length - (viewMode === "grid" ? 3 : 5)}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-0">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(item.candidate.createdAt).toLocaleDateString()}
        </div>
        <ExperienceLevelBadge 
          level={item.analysis.experienceLevel}
          years={item.analysis.workExperienceYears}
        />
      </CardFooter>
    </Card>
  );

  const renderCandidateListItem = (item: CandidateWithAnalysis) => (
    <Card 
      key={item.candidate.id}
      className={`hover:border-primary/50 shadow-sm hover:shadow transition-all cursor-pointer ${
        selectedCandidate?.candidate.id === item.candidate.id ? 'border-primary border-2' : ''
      }`}
      onClick={() => setSelectedCandidate(item)}
    >
      <div className="flex items-center p-4">
        <Avatar className="h-10 w-10 mr-4">
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(item.candidate.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium truncate">{item.candidate.name}</h3>
            <ExperienceLevelBadge 
              level={item.analysis.experienceLevel}
              years={item.analysis.workExperienceYears}
            />
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            {item.candidate.email && (
              <span className="flex items-center mr-4 truncate">
                <Mail className="h-3 w-3 mr-1" />
                {item.candidate.email}
              </span>
            )}
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(item.candidate.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderCandidatesList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      );
    }
    
    if (filteredAndSortedCandidates.length === 0) {
      return (
        <Card className="py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No candidates found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setFilterExperience("all");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <div className={viewMode === "grid" 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        : "space-y-2"
      }>
        {filteredAndSortedCandidates.map(item => 
          viewMode === "grid" 
            ? renderCandidateCard(item) 
            : renderCandidateListItem(item)
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 max-w-screen-2xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-6 xl:col-span-5 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
              <p className="text-muted-foreground">
                {filteredAndSortedCandidates.length} candidates found
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name, email, or skills..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Experience Level</label>
                    <Select value={filterExperience} onValueChange={setFilterExperience}>
                      <SelectTrigger>
                        <SelectValue placeholder="Experience Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="fresher">Fresher</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mediocre">Mid-Level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="experience">Most Experienced</SelectItem>
                        <SelectItem value="alphabetical">Alphabetical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">View Mode</label>
                    <div className="flex gap-2">
                      <Button 
                        variant={viewMode === "grid" ? "default" : "outline"} 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid className="h-4 w-4 mr-2" />
                        Grid
                      </Button>
                      <Button 
                        variant={viewMode === "list" ? "default" : "outline"} 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setViewMode("list")}
                      >
                        <List className="h-4 w-4 mr-2" />
                        List
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Candidates List */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Candidate Profiles</h2>
              <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => setSelectedCandidate(null)}>
                <Plus className="h-3 w-3 mr-1" />
                Import
              </Button>
            </div>
            <div className="h-[calc(100vh-350px)] overflow-y-auto pr-1">
              {renderCandidatesList()}
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-6 xl:col-span-7">
          {selectedCandidate ? (
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                      {getInitials(selectedCandidate.candidate.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold">{selectedCandidate.candidate.name}</h1>
                    <p className="text-muted-foreground">
                      {selectedCandidate.analysis.experienceLevel.charAt(0).toUpperCase() + 
                       selectedCandidate.analysis.experienceLevel.slice(1)} • 
                      {selectedCandidate.analysis.workExperienceYears} years experience
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedCandidate(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <AnalysisResult 
                candidate={selectedCandidate.candidate}
                analysis={selectedCandidate.analysis}
                savedRequirements={savedRequirements}
              />
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center h-[calc(100vh-250px)] text-center p-10">
              <div className="max-w-md space-y-4">
                <h2 className="text-2xl font-bold">Select a Candidate</h2>
                <p className="text-muted-foreground">
                  Choose a candidate from the list to view their detailed profile and analysis.
                </p>
                <div className="flex justify-center">
                  <Button variant="outline" onClick={() => router.push('/dashboard')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Import New Candidate
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <CandidatesList />
    </Suspense>
  );
}