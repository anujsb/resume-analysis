"use client";

import { useState } from "react";
import { Loader2, X, Plus, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { JobRequirement, ExperienceLevel } from "@/types/job-requirements";

type SkillCategory = "primarySkills" | "secondarySkills" | "niceToHaveSkills";

interface JobRequirementsFormProps {
  onRequirementsSet: (requirements: JobRequirement) => void;
  savedRequirements?: JobRequirement[];
}

export function JobRequirementsForm({ 
  onRequirementsSet,
  savedRequirements = [] 
}: JobRequirementsFormProps) {
  const [requirements, setRequirements] = useState<JobRequirement>({
    title: "",
    primarySkills: [],
    secondarySkills: [],
    niceToHaveSkills: [],
    minimumExperience: 0,
    preferredExperience: 2,
    experienceLevel: "junior"
  });

  const [skillInput, setSkillInput] = useState("");
  const [skillCategory, setSkillCategory] = useState<SkillCategory>("primarySkills");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedRequirementId, setSelectedRequirementId] = useState<string>("");

  const addSkill = () => {
    if (skillInput.trim()) {
      setRequirements({
        ...requirements,
        [skillCategory]: [...requirements[skillCategory], skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string, category: SkillCategory) => {
    setRequirements({
      ...requirements,
      [category]: requirements[category].filter((s: string) => s !== skill)
    });
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    
    // Validation
    if (!requirements.title) {
      setErrorMessage("Job title is required");
      return;
    }
    
    if (requirements.primarySkills.length === 0) {
      setErrorMessage("At least one primary skill is required");
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch("/api/job-requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requirements),
      });
      
      const data = await response.json();
      if (data.success) {
        onRequirementsSet(data.data);
        // Reset form after successful submission
        setRequirements({
          title: "",
          primarySkills: [],
          secondarySkills: [],
          niceToHaveSkills: [],
          minimumExperience: 0,
          preferredExperience: 2,
          experienceLevel: "junior"
        });
      } else {
        setErrorMessage(data.message || "Failed to save requirements");
      }
    } catch (error) {
      console.error("Error saving requirements:", error);
      setErrorMessage("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequirementSelect = (id: string) => {
    const selected = savedRequirements.find(req => req.id === parseInt(id));
    if (selected) {
      setRequirements(selected);
      setSelectedRequirementId(id);
    }
  };

  const getYearsLabel = (value: number) => {
    if (value === 0) return "No experience";
    if (value === 1) return "1 year";
    return `${value} years`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader className="space-y-1">
        <h2 className="text-2xl font-bold">Job Requirements Template</h2>
        <p className="text-gray-500 text-sm">Create a new template or load an existing one to modify</p>
        
        {savedRequirements.length > 0 && (
          <div className="mt-4">
            <Label className="text-sm">Load Existing Template</Label>
            <Select value={selectedRequirementId} onValueChange={handleRequirementSelect}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a template to load" />
              </SelectTrigger>
              <SelectContent>
                {savedRequirements
                  .filter((req) => req.id !== undefined)
                  .map((req) => (
                    <SelectItem key={req.id} value={req.id!.toString()}>
                      {req.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div>
          <Label htmlFor="title" className="text-sm font-medium">Job Title</Label>
          <Input
            id="title"
            value={requirements.title}
            onChange={(e) => setRequirements({...requirements, title: e.target.value})}
            className="mt-1"
            placeholder="e.g. Senior Frontend Developer"
          />
        </div>

        <Separator />
        
        <div>
          <Label className="text-sm font-medium">Experience Level</Label>
          <Select 
            value={requirements.experienceLevel} 
            onValueChange={(value: ExperienceLevel) => setRequirements({...requirements, experienceLevel: value})}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fresher">Fresher</SelectItem>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="mediocre">Mid-level</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="minExp" className="text-sm font-medium">Minimum Experience</Label>
              <span className="text-sm text-gray-500">{getYearsLabel(requirements.minimumExperience)}</span>
            </div>
            <Slider 
              id="minExp"
              value={[requirements.minimumExperience]} 
              min={0}
              max={10}
              step={1}
              onValueChange={(value: number[]) => setRequirements({...requirements, minimumExperience: value[0]})}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="prefExp" className="text-sm font-medium">Preferred Experience</Label>
              <span className="text-sm text-gray-500">{getYearsLabel(requirements.preferredExperience)}</span>
            </div>
            <Slider 
              id="prefExp"
              value={[requirements.preferredExperience]} 
              // min={requirements.minimumExperience}
              max={15}
              step={1}
              onValueChange={(value: number[]) => setRequirements({...requirements, preferredExperience: value[0]})}
            />
          </div>
        </div>

        <Separator />
        
        <div className="space-y-4">
          <Label className="text-sm font-medium">Skills</Label>
          
          <div className="flex gap-2">
            <Select value={skillCategory} onValueChange={(value: SkillCategory) => setSkillCategory(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primarySkills">Primary</SelectItem>
                <SelectItem value="secondarySkills">Secondary</SelectItem>
                <SelectItem value="niceToHaveSkills">Nice to Have</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex flex-1 gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter a skill, e.g. React"
              />
              <Button type="button" onClick={addSkill} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 mt-4">
            {/* Primary Skills */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <h4 className="text-sm font-medium">Primary Skills</h4>
              </div>
              <div className="min-h-10 bg-blue-50 rounded-md p-2">
                <div className="flex flex-wrap gap-2">
                  {requirements.primarySkills.length > 0 ? (
                    requirements.primarySkills.map(skill => (
                      <span key={skill} className="bg-white border border-blue-200 px-2 py-1 rounded-full text-sm flex items-center gap-1 group">
                        {skill}
                        <button 
                          type="button" 
                          onClick={() => removeSkill(skill, "primarySkills")}
                          className="opacity-50 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                          aria-label={`Remove ${skill} from primary skills`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No primary skills added</span>
                  )}
                </div>
              </div>
            </div>

            {/* Secondary Skills */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <h4 className="text-sm font-medium">Secondary Skills</h4>
              </div>
              <div className="min-h-10 bg-green-50 rounded-md p-2">
                <div className="flex flex-wrap gap-2">
                  {requirements.secondarySkills.length > 0 ? (
                    requirements.secondarySkills.map(skill => (
                      <span key={skill} className="bg-white border border-green-200 px-2 py-1 rounded-full text-sm flex items-center gap-1 group">
                        {skill}
                        <button 
                          type="button" 
                          onClick={() => removeSkill(skill, "secondarySkills")}
                          className="opacity-50 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                          aria-label={`Remove ${skill} from secondary skills`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No secondary skills added</span>
                  )}
                </div>
              </div>
            </div>

            {/* Nice to Have Skills */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <h4 className="text-sm font-medium">Nice to Have Skills</h4>
              </div>
              <div className="min-h-10 bg-gray-50 rounded-md p-2">
                <div className="flex flex-wrap gap-2">
                  {requirements.niceToHaveSkills.length > 0 ? (
                    requirements.niceToHaveSkills.map(skill => (
                      <span key={skill} className="bg-white border border-gray-200 px-2 py-1 rounded-full text-sm flex items-center gap-1 group">
                        {skill}
                        <button 
                          type="button" 
                          onClick={() => removeSkill(skill, "niceToHaveSkills")}
                          className="opacity-50 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                          aria-label={`Remove ${skill} from nice to have skills`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No nice-to-have skills added</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={() => {
          setRequirements({
            title: "",
            primarySkills: [],
            secondarySkills: [],
            niceToHaveSkills: [],
            minimumExperience: 0,
            preferredExperience: 2,
            experienceLevel: "junior"
          });
          setSelectedRequirementId("");
        }}>
          Reset
        </Button>
        <Button onClick={handleSubmit} className="min-w-32" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Template"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}