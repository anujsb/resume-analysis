// src/lib/utils/ai-helpers.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface SkillProficiency {
  skill: string;
  proficiency: "beginner" | "intermediate" | "expert";
  description?: string;
}

export interface ExperienceInfo {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  duration: number; // in months
}

export interface ResumeAnalysis {
  skills: SkillProficiency[];
  totalExperience: number; // in months
  experienceLevel: "fresher" | "junior" | "mediocre" | "senior";
  experiences: ExperienceInfo[];
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create a structured prompt for the AI
    const prompt = `
    Analyze the following resume and provide:
    
    1. A list of all technical and soft skills mentioned with a proficiency level estimate (beginner, intermediate, expert) based on context.
    2. Work experience details including company, position, dates, and duration in months for each role.
    3. Total experience in months.
    4. Experience level category based on the following scale:
       - "fresher": 0-1 years
       - "junior": 1-3 years
       - "mediocre": 3-8 years
       - "senior": 8+ years
    
    Return the information in a valid JSON format with the following structure:
    {
      "skills": [{"skill": "string", "proficiency": "beginner" | "intermediate" | "expert", "description": "string"}],
      "experiences": [{"company": "string", "position": "string", "startDate": "string", "endDate": "string", "duration": number}],
      "totalExperience": number,
      "experienceLevel": "fresher" | "junior" | "mediocre" | "senior"
    }
    
    Resume:
    ${resumeText}
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract the JSON from the response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/);
    
    if (jsonMatch && jsonMatch[1]) {
      const jsonResponse = JSON.parse(jsonMatch[1].trim());
      return jsonResponse as ResumeAnalysis;
    } else {
      try {
        // Try to parse the entire response as JSON
        return JSON.parse(text) as ResumeAnalysis;
      } catch (err) {
        throw new Error("Failed to parse AI response as JSON");
      }
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error(`Failed to analyze resume: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper function to map months to experience level
export function mapExperienceLevel(totalMonths: number): "fresher" | "junior" | "mediocre" | "senior" {
  if (totalMonths <= 12) return "fresher"; // 0-1 years
  if (totalMonths <= 36) return "junior"; // 1-3 years
  if (totalMonths <= 96) return "mediocre"; // 3-8 years
  return "senior"; // 8+ years
}