"use client";

import { useState, useEffect } from "react";
import { JobRequirementsForm } from "@/components/job-requirements-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobRequirement } from "@/types/job-requirements";
import { RefreshCw, Search } from "lucide-react";

export default function RequirementsPage() {
  const [savedRequirements, setSavedRequirements] = useState<JobRequirement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadRequirements = async () => {
    try {
      const response = await fetch("/api/job-requirements");
      const data = await response.json();
      if (data.success) {
        setSavedRequirements(data.data);
      }
    } catch (error) {
      console.error("Failed to load requirements:", error);
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
    // Immediately load requirements after a new one is added
    await loadRequirements();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Requirements</h1>
          <p className="text-gray-500">Manage and create job requirements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <JobRequirementsForm 
            onRequirementsSet={handleRequirementsSet}
            savedRequirements={savedRequirements}
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Saved Requirements</h3>
          <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
            {savedRequirements.map((req) => (
              <Card key={req.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle>{req.title}</CardTitle>
                  <CardDescription>
                    {req.requiredSkills.length} required skills • {req.minimumExperience}+ years
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {req.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}