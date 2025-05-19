"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobRequirement } from "@/types/job-requirements";

interface JobRequirementsFormProps {
  onRequirementsSet: (requirements: JobRequirement) => void;
  savedRequirements?: JobRequirement[]; // Add this prop
}

interface SavedJobRequirement extends JobRequirement {
  id: number; // Extend JobRequirement to ensure saved requirements have an ID
}

export function JobRequirementsForm({ 
  onRequirementsSet,
  savedRequirements = [] 
}: JobRequirementsFormProps) {
  const [requirements, setRequirements] = useState<JobRequirement>({
    title: "",
    requiredSkills: [],
    minimumExperience: 0,
    preferredExperience: 0,
    experienceLevel: "junior"
  });

  const [skillInput, setSkillInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRequirementId, setSelectedRequirementId] = useState<string>("");

  const addSkill = () => {
    if (skillInput.trim()) {
      setRequirements({
        ...requirements,
        requiredSkills: [...requirements.requiredSkills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setRequirements({
      ...requirements,
      requiredSkills: requirements.requiredSkills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      }
    } catch (error) {
      console.error("Error saving requirements:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequirementSelect = (id: string) => {
    const selected = savedRequirements.find(req => req.id === parseInt(id));
    if (selected) {
      setRequirements(selected);
      setSelectedRequirementId(id);
      onRequirementsSet(selected);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Set Job Requirements</h2>
        {savedRequirements.length > 0 && (
          <div className="mt-4">
            <Label>Load Saved Requirements</Label>
            <Select value={selectedRequirementId} onValueChange={handleRequirementSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select saved requirements" />
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
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={requirements.title}
              onChange={(e) => setRequirements({...requirements, title: e.target.value})}
              required
            />
          </div>

          <div>
            <Label>Required Skills</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Enter a skill"
              />
              <Button type="button" onClick={addSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {requirements.requiredSkills.map(skill => (
                <span 
                  key={skill}
                  className="bg-gray-100 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {skill}
                  <button 
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minExp">Minimum Experience (years)</Label>
              <Input
                id="minExp"
                type="number"
                value={requirements.minimumExperience}
                onChange={(e) => setRequirements({
                  ...requirements, 
                  minimumExperience: Number(e.target.value)
                })}
                required
              />
            </div>
            <div>
              <Label htmlFor="prefExp">Preferred Experience (years)</Label>
              <Input
                id="prefExp"
                type="number"
                value={requirements.preferredExperience}
                onChange={(e) => setRequirements({
                  ...requirements, 
                  preferredExperience: Number(e.target.value)
                })}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Requirements"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}