// src/components/interview-questions.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, HelpCircle } from "lucide-react";

interface Question {
  question: string;
  expectedAnswer: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface InterviewQuestionsProps {
  skills: Array<{
    skill: string;
    proficiency: string;
  }>;
  experienceLevel: string;
  experienceYears: string;
}

export function InterviewQuestions({
  skills,
  experienceLevel,
  experienceYears,
}: InterviewQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  const generateQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills,
          experienceLevel,
          experienceYears,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setQuestions(data.data);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (index: number) => {
    setShowAnswers(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
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
    <div className="space-y-4">
      {questions.length === 0 ? (
        <div className="text-center">
          <Button
            onClick={generateQuestions}
            disabled={loading}
            size="lg"
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <HelpCircle className="h-4 w-4" />
            )}
            Generate Interview Questions
          </Button>
          {error && (
            <p className="text-red-500 mt-2 text-sm">{error}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Interview Questions</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuestions([])}
            >
              Generate New Questions
            </Button>
          </div>
          
          {questions.map((q, index) => (
            <Card key={index} className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="font-medium">{q.question}</div>
                    <Badge
                      variant="secondary"
                      className={getDifficultyColor(q.difficulty)}
                    >
                      {q.difficulty}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAnswer(index)}
                  >
                    {showAnswers[index] ? "Hide Answer" : "Show Answer"}
                  </Button>
                </div>
              </CardHeader>
              {showAnswers[index] && (
                <CardContent className="pt-2 text-sm text-muted-foreground">
                  {q.expectedAnswer}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}