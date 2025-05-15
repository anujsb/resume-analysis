// src/app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/utils";
import { analyzeResume } from "@/lib/gemini";
import { CandidatesRepository } from "@/lib/repository/candidates-repository";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    // Extract text from the uploaded file
    const text = await extractTextFromFile(file);
    
    // Analyze the resume text using Gemini
    const analysis = await analyzeResume(text, file.name);
    
    if (!analysis.name) {
      return NextResponse.json(
        { error: "Analysis result is missing the candidate's name." },
        { status: 400 }
      );
    }
    
    // Store candidate and analysis in the database
    const candidatesRepo = new CandidatesRepository();
    
    const candidate = await candidatesRepo.createCandidate({
      name: analysis.name ?? "Unknown", // Provide a default value for name
      email: analysis.email || null,
      phone: analysis.phone || null,
      resumeText: analysis.rawText,
    });
    
    const savedAnalysis = await candidatesRepo.createAnalysis({
      candidateId: candidate.id,
      skills: analysis.skills,
      experienceLevel: analysis.experienceLevel,
      workExperienceYears: analysis.experienceYears.toString(),
      summary: analysis.summary,
    });
    
    return NextResponse.json({
      success: true,
      candidate,
      analysis: {
        ...savedAnalysis,
        skills: analysis.skills,
      },
    });
  } catch (error) {
    console.error("Error processing resume:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process resume" },
      { status: 500 }
    );
  }
}