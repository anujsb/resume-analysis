import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

interface QuestionRequest {
  skills: Array<{
    skill: string;
    proficiency: string;
  }>;
  experienceLevel: string;
  experienceYears: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: QuestionRequest = await request.json();
    const { skills, experienceLevel, experienceYears } = body;

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a structured prompt based on experience level
    const difficultyLevel = getDifficultyLevel(experienceLevel, experienceYears);
    const skillsList = skills.map(s => `${s.skill} (${s.proficiency})`).join(", ");

    const prompt = `
      Generate a set of technical interview questions for a ${experienceLevel} level candidate 
      with ${experienceYears} years of experience in: ${skillsList}.

      Requirements:
      - Difficulty level: ${difficultyLevel}
      - Generate 5-8 questions
      - Include a mix of theoretical and practical questions
      - Questions should be relevant to the candidate's proficiency levels
      - For each question, provide:
        * The question
        * Expected answer points
        * Difficulty rating (Easy/Medium/Hard)

      Format the response as a JSON array of objects with:
      {
        "question": "The question text",
        "expectedAnswer": "Key points to look for in the answer",
        "difficulty": "Easy/Medium/Hard"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON from the response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}

function getDifficultyLevel(experienceLevel: string, yearsStr: string): string {
  const years = parseInt(yearsStr);
  
  switch (experienceLevel) {
    case "fresher":
      return "basic concepts and fundamentals";
    case "junior":
      return "intermediate concepts with practical scenarios";
    case "mediocre":
      return "advanced concepts with system design considerations";
    case "senior":
      return "expert-level concepts, architecture, and best practices";
    default:
      return "mixed difficulty";
  }
}