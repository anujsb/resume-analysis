import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

interface QuestionRequest {
  skills: Array<{
    skill: string;
    proficiency: string;
  }>;
  experienceLevel: string;
  experienceYears: string;
  primarySkills: Array<{
    skill: string;
    proficiency: string;
  }>;
  secondarySkills: Array<{
    skill: string;
    proficiency: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: QuestionRequest = await request.json();
    const { skills = [], experienceLevel = 'junior', experienceYears = '0', primarySkills = [], secondarySkills = [] } = body;

    if (!skills.length) {
      return NextResponse.json(
        { error: "No skills provided" },
        { status: 400 }
      );
    }

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const difficultyLevel = getDifficultyLevel(experienceLevel, experienceYears);
    
    // Format skills lists with null checks
    let primarySkillsList = Array.isArray(primarySkills) 
      ? primarySkills.map(s => `${s.skill} (${s.proficiency})`).join(", ")
      : skills.filter(s => s.proficiency === "advanced" || s.proficiency === "expert")
          .map(s => `${s.skill} (${s.proficiency})`).join(", ");

    let secondarySkillsList = Array.isArray(secondarySkills)
      ? secondarySkills.map(s => `${s.skill} (${s.proficiency})`).join(", ")
      : skills.filter(s => s.proficiency === "beginner" || s.proficiency === "intermediate")
          .map(s => `${s.skill} (${s.proficiency})`).join(", ");

    // If no skills are categorized, use all skills
    if (!primarySkillsList && !secondarySkillsList) {
      const allSkills = skills.map(s => `${s.skill} (${s.proficiency})`).join(", ");
      primarySkillsList = allSkills;
      secondarySkillsList = allSkills;
    }

    const prompt = `
      Generate a structured technical interview question set for a ${experienceLevel} level candidate 
      with ${experienceYears} years of experience.

      Primary Skills: ${primarySkillsList}
      Secondary Skills: ${secondarySkillsList}

      Generate questions in the following categories:
      1. Primary Skills (3-4 questions)
      2. Secondary Skills (3-4 questions)
      3. Behavioral Questions (3-4 questions)
      4. Project Discussion Questions (2-3 questions)

      Requirements for each category:
      - Primary Skills: Technical questions focusing on ${difficultyLevel} of primary skills
      - Secondary Skills: Technical questions about supporting technologies
      - Behavioral: Leadership, teamwork, and problem-solving scenarios
      - Project Questions: Architecture, decisions, challenges, and outcomes

      Format the response as a JSON object with categorized arrays:
      {
        "primarySkills": [
          {
            "question": "Question text",
            "expectedAnswer": "Key points to look for",
            "difficulty": "Easy/Medium/Hard"
          }
        ],
        "secondarySkills": [...],
        "behavioral": [...],
        "projectDiscussion": [...]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
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