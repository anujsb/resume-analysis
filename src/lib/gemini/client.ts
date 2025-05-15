import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExperienceLevel, experienceLevels } from "@/lib/schema";
import { Skill, ResumeAnalysisResponse } from "@/types";

// Initialize the Google Generative AI client
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Default model to use
const MODEL_NAME = "gemini-pro";

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysisResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Create prompt for Gemini AI
    const prompt = `
    You are a professional resume analyzer for recruiters. Analyze the following resume text and extract structured information:

    Resume Text:
    ${resumeText}

    I need you to provide a detailed analysis with the following information:
    1. Extract all technical and non-technical skills and rate proficiency on a scale of 1-5 based on the resume content.
    2. Determine the experience level category based on total years of work experience:
       - "fresher" (0-1 years)
       - "junior" (1-3 years)
       - "mediocre" (3-8 years)
       - "senior" (8+ years)
    3. Calculate the exact total years of work experience.
    4. Extract candidate name, email, and phone number if available.

    Provide the response in a structured JSON format with these keys:
    {
      "skills": [{"skill": "skill name", "proficiency": number}],
      "experienceLevel": "level category",
      "yearsOfExperience": number,
      "candidateName": "full name",
      "candidateEmail": "email address",
      "candidatePhone": "phone number"
    }
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract the JSON from the response (it might be surrounded by markdown code blocks)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/{[\s\S]*?}/);
    let parsedResponse: any;

    if (jsonMatch) {
      parsedResponse = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
    } else {
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate experience level
    if (!Object.values(experienceLevels).includes(parsedResponse.experienceLevel as ExperienceLevel)) {
      parsedResponse.experienceLevel = determineExperienceLevel(parsedResponse.yearsOfExperience);
    }

    return {
      skills: parsedResponse.skills || [],
      experienceLevel: parsedResponse.experienceLevel,
      yearsOfExperience: parsedResponse.yearsOfExperience || 0,
      candidateName: parsedResponse.candidateName || undefined,
      candidateEmail: parsedResponse.candidateEmail || undefined,
      candidatePhone: parsedResponse.candidatePhone || undefined,
      rawAnalysis: parsedResponse
    };
  } catch (error) {
    console.error("Error analyzing resume with Gemini AI:", error);
    throw new Error(`Failed to analyze resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to determine experience level based on years
function determineExperienceLevel(years: number): ExperienceLevel {
  if (years < 1) return experienceLevels.FRESHER;
  if (years < 3) return experienceLevels.JUNIOR;
  if (years < 8) return experienceLevels.MEDIOCRE;
  return experienceLevels.SENIOR;
}