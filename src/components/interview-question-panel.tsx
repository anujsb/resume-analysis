import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";
import { CandidateWithAnalysis } from "@/types/candidate";
import { JobRequirement } from "@/types/job-requirements";

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

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: candidate.analysis.skills,
          experienceLevel: candidate.analysis.experienceLevel,
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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Interview Questions</h2>
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
          Generate Questions
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="font-medium">{question.question}</div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {question.category}
                  </Badge>
                  <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-800">
                    {question.difficulty}
                  </Badge>
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
    </div>
  );
}