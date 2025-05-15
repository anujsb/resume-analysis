// // src/lib/gemini.ts
// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Types for analysis results
// export interface SkillProficiency {
//   skill: string;
//   proficiency: "beginner" | "intermediate" | "advanced" | "expert";
// }

// export interface ResumeAnalysis {
//   name: string;
//   email?: string;
//   phone?: string;
//   skills: SkillProficiency[];
//   experienceYears: number;
//   experienceLevel: "fresher" | "junior" | "mediocre" | "senior";
//   summary: string;
//   rawText: string;
// }

// // Initialize Gemini AI
// export function getGeminiClient() {
//   const apiKey = process.env.GEMINI_API_KEY;
  
//   if (!apiKey) {
//     throw new Error("Gemini API key is missing. Please check your .env.local file.");
//   }
  
//   return new GoogleGenerativeAI(apiKey);
// }

// export async function analyzeResume(text: string, fileName: string): Promise<ResumeAnalysis> {
//   try {
//     const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
//       },
//       body: JSON.stringify({ text, fileName }),
//     });

//     const responseText = await response.text();
//     console.log("Raw Gemini API Response:", responseText);

//     try {
//       const parsedResponse = JSON.parse(responseText);
//       return parsedResponse;
//     } catch (error) {
//       console.error("Failed to parse Gemini response as JSON:", responseText);
//       throw new Error("Failed to parse resume analysis result");
//     }
//   } catch (error) {
//     console.error("Error analyzing resume:", error);
//     throw new Error(`Failed to analyze resume: ${error instanceof Error ? error.message : "Unknown error"}`);
//   }
// }


// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Types for analysis results
export interface SkillProficiency {
  skill: string;
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface ResumeAnalysis {
  name: string;
  email?: string;
  phone?: string;
  skills: SkillProficiency[];
  experienceYears: number;
  experienceLevel: "fresher" | "junior" | "mediocre" | "senior";
  summary: string;
  rawText: string;
}

// Initialize Gemini AI
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please check your .env.local file.");
  }
  
  return new GoogleGenerativeAI(apiKey);
}

export async function analyzeResume(text: string, fileName: string): Promise<ResumeAnalysis> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a structured prompt for resume analysis
    const prompt = `
      Analyze the following resume and extract this information in JSON format:
      
      1. Full name of the candidate
      2. Email address (if available)
      3. Phone number (if available)
      4. List of technical skills with proficiency level (beginner, intermediate, advanced, expert)
      5. Years of professional experience (as a number)
      6. Experience level (fresher, junior, mediocre, senior)
      7. A brief professional summary (100-150 words)

      Resume content from file "${fileName}":
      ${text}

      Return ONLY a valid JSON object with these fields:
      {
        "name": "Full Name",
        "email": "email@example.com",
        "phone": "1234567890",
        "skills": [{"skill": "Skill Name", "proficiency": "level"}],
        "experienceYears": 5,
        "experienceLevel": "senior",
        "summary": "Professional summary text"
      }
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from the response
    let jsonMatch;
    try {
      // Try to parse the entire response as JSON first
      const analysis = JSON.parse(responseText);
      return {
        ...analysis,
        rawText: text
      };
    } catch (e) {
      // If that fails, try to extract JSON using regex
      jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const analysis = JSON.parse(jsonStr);
        return {
          ...analysis,
          rawText: text
        };
      } else {
        throw new Error("Could not extract valid JSON from the API response");
      }
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error(`Failed to analyze resume: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}