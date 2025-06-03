import { NextRequest, NextResponse } from "next/server";
import { Analysis } from "@/lib/db/schema";
import { JobRequirement } from "@/types/job-requirements";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { analysis, requirement } = await request.json();

    if (!analysis || !requirement) {
      return NextResponse.json(
        { error: "Both analysis and requirement are required" },
        { status: 400 }
      );
    }

    // Use Gemini to generate resume improvement suggestions
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a professional resume reviewer and career coach. Based on the candidate's profile and the job requirements, 
      provide specific, actionable suggestions to improve their resume. Focus on:
      
      1. Skills alignment and gaps
      2. Experience presentation
      3. Keywords and terminology
      4. Achievement quantification
      5. Overall resume structure and impact
      
      Candidate Profile:
      ${JSON.stringify(analysis, null, 2)}
      
      Job Requirements:
      ${JSON.stringify(requirement, null, 2)}
      
      Format your response as a well-structured list of suggestions, with each suggestion including:
      - The specific area of improvement
      - Why it matters for this role
      - How to implement the change
      
      Keep the suggestions practical and tailored to the specific role.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestions = response.text();

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Error generating resume suggestions:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
