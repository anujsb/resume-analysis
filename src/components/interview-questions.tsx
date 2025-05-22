// src/components/interview-questions.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, HelpCircle, RefreshCw } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Question {
  question: string;
  expectedAnswer: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface CategorizedQuestions {
  primarySkills: Question[];
  secondarySkills: Question[];
  behavioral: Question[];
  projectDiscussion: Question[];
}

interface InterviewQuestionsProps {
  skills: Array<{
    skill: string;
    proficiency: string;
  }>;
  experienceLevel: string;
  experienceYears: string;
  onExperienceLevelChange?: (level: string) => void;
}

export function InterviewQuestions({
  skills,
  experienceLevel,
  experienceYears,
  onExperienceLevelChange
}: InterviewQuestionsProps) {
  const [questions, setQuestions] = useState<CategorizedQuestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});
  const [selectedLevel, setSelectedLevel] = useState(experienceLevel);

  const generateQuestions = async (level = selectedLevel) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills,
          experienceLevel: level,
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

  const handleExperienceLevelChange = (level: string) => {
    setSelectedLevel(level);
    onExperienceLevelChange?.(level);
    generateQuestions(level);
  };

  const toggleAnswer = (index: string) => {
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

  const renderQuestionSection = (title: string, questions: Question[]) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {questions.map((q, index) => (
        <QuestionCard
          key={`${title}-${index}`}
          question={q}
          showAnswer={showAnswers[`${title}-${index}`]}
          onToggleAnswer={() => toggleAnswer(`${title}-${index}`)}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Interview Questions</h2>
        <div className="flex items-center gap-4">
          <Select
            value={selectedLevel}
            onValueChange={handleExperienceLevelChange}
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
            onClick={() => generateQuestions()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Regenerate
          </Button>
        </div>
      </div>

      {questions ? (
        <div className="space-y-8">
          {renderQuestionSection("Primary Skills", questions.primarySkills)}
          {renderQuestionSection("Secondary Skills", questions.secondarySkills)}
          {renderQuestionSection("Behavioral Questions", questions.behavioral)}
          {renderQuestionSection("Project Discussion", questions.projectDiscussion)}
        </div>
      ) : (
        <Button
          onClick={() => generateQuestions()}
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
    </div>
  );
}

// Helper component for individual questions
function QuestionCard({ 
  question, 
  showAnswer, 
  onToggleAnswer 
}: { 
  question: Question;
  showAnswer: boolean;
  onToggleAnswer: () => void;
}) {
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <div className="font-medium">{question.question}</div>
            <Badge variant="secondary" className={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggleAnswer}>
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </Button>
        </div>
      </CardHeader>
      {showAnswer && (
        <CardContent className="pt-2 text-sm text-muted-foreground">
          {question.expectedAnswer}
        </CardContent>
      )}
    </Card>
  );
}