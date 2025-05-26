import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, MessageSquare, HelpCircle } from "lucide-react";
import { CandidateWithAnalysis } from "@/types/candidate";
import { JobRequirement } from "@/types/job-requirements";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Question {
  question: string;
  expectedAnswer: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
}

export function InterviewQuestionPanel({
  candidate,
  requirement
}: {
  candidate: CandidateWithAnalysis;
  requirement: JobRequirement;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
  const [selectedLevel, setSelectedLevel] = useState(candidate.analysis.experienceLevel);

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: candidate.analysis.skills,
          experienceLevel: selectedLevel,
          experienceYears: candidate.analysis.workExperienceYears,
          jobRequirement: requirement,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (error) {
      console.error("Failed to generate questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Interview Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <Select
            value={selectedLevel}
            onValueChange={setSelectedLevel}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Experience Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fresher">Fresher</SelectItem>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="mediocre">Mid-Level</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={generateQuestions}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {questions.length ? "Regenerate" : "Generate"}
          </Button>
        </div>

        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card key={index} className="border border-muted">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="font-medium">{question.question}</div>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline">{question.category}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAnswers(prev => ({
                        ...prev,
                        [index]: !prev[index]
                      }))}
                    >
                      {showAnswers[index] ? "Hide Answer" : "Show Answer"}
                    </Button>
                  </div>
                </CardHeader>
                {showAnswers[index] && (
                  <CardContent className="pt-2 text-sm text-muted-foreground">
                    {question.expectedAnswer}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Button
            onClick={generateQuestions}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <HelpCircle className="h-4 w-4 mr-2" />
            )}
            Generate Interview Questions
          </Button>
        )}
      </CardContent>
    </Card>
  );
}