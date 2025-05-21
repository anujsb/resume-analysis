"use client";

import { useState, useEffect } from "react";
import { JobRequirementsForm } from "@/components/job-requirements-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobRequirement } from "@/types/job-requirements";
import { RefreshCw, Search, Filter, Plus, Clock } from "lucide-react";

export default function RequirementsPage() {
  const [savedRequirements, setSavedRequirements] = useState<JobRequirement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("browse");

  const loadRequirements = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/job-requirements");
      const data = await response.json();
      if (data.success) {
        setSavedRequirements(data.data);
      }
    } catch (error) {
      console.error("Failed to load requirements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
    
    // Set up polling to check for updates every 30 seconds
    const intervalId = setInterval(loadRequirements, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleRequirementsSet = async (requirement: JobRequirement) => {
    await loadRequirements();
    // Switch to browse tab after successful creation
    setActiveTab("browse");
  };

  const filteredRequirements = savedRequirements.filter(req => 
    req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    [...req.primarySkills, ...req.secondarySkills, ...req.niceToHaveSkills].some(
      skill => skill.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Requirements</h1>
          <p className="text-gray-500 mt-1">Create, manage, and search job requirement templates</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadRequirements} 
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button 
            onClick={() => setActiveTab("create")} 
            size="sm" 
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>New Template</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="browse">Browse Templates</TabsTrigger>
          <TabsTrigger value="create">Create Template</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex gap-2 items-center bg-white p-3 rounded-lg shadow-sm border">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by title or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button variant="ghost" size="icon">
              <Filter className="h-5 w-5" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredRequirements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRequirements.map((req) => (
                <Card key={req.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{req.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {req.minimumExperience}+ years • {req.experienceLevel} level
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-medium uppercase text-blue-600 mb-1">Primary</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {req.primarySkills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                              {skill}
                            </Badge>
                          ))}
                          {req.primarySkills.length === 0 && 
                            <span className="text-xs text-gray-400">No primary skills added</span>
                          }
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-medium uppercase text-green-600 mb-1">Secondary</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {req.secondarySkills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                              {skill}
                            </Badge>
                          ))}
                          {req.secondarySkills.length === 0 && 
                            <span className="text-xs text-gray-400">No secondary skills added</span>
                          }
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-medium uppercase text-gray-600 mb-1">Nice to Have</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {req.niceToHaveSkills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-gray-50 text-gray-700 hover:bg-gray-100">
                              {skill}
                            </Badge>
                          ))}
                          {req.niceToHaveSkills.length === 0 && 
                            <span className="text-xs text-gray-400">No additional skills added</span>
                          }
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="default" size="sm">Use Template</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No job requirements found</p>
              {searchQuery && (
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search or 
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm" 
                    onClick={() => setSearchQuery("")}
                  >
                    clear your search
                  </Button>
                </p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <JobRequirementsForm 
            onRequirementsSet={handleRequirementsSet}
            savedRequirements={savedRequirements}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}