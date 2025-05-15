import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { parseResumeFile } from "@/lib/resume-parser";
import { analyzeResume } from "@/lib/gemini/client";
import { repository } from "@/lib/repository";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Check file type
    const fileType = file.type;
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain"
    ];

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files." },
        { status: 400 }
      );
    }

    // Create a unique filename
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}-${file.name}`;
    const uploadsDir = join(process.cwd(), "uploads");
    const filePath = join(uploadsDir, fileName);

    // Ensure uploads directory exists
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.log("Uploads directory already exists or couldn't be created");
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Write file to uploads directory
    await writeFile(filePath, buffer);

    // Parse resume file to extract text
    const resumeText = await parseResumeFile(filePath, fileType);

    // Analyze resume using Gemini AI
    const analysis = await analyzeResume(resumeText);

    // Save candidate information to database using repository
    const newCandidate = await repository.createCandidate({
      name: analysis.candidateName || null,
      email: analysis.candidateEmail || null,
      phone: analysis.candidatePhone || null,
      resumeUrl: fileName,
    });

    // Save analysis results to database using repository
    const newAnalysis = await repository.createAnalysisResult({
      candidateId: newCandidate.id,
      skills: analysis.skills,
      experienceLevel: analysis.experienceLevel,
      yearsOfExperience: analysis.yearsOfExperience,
      rawAnalysis: analysis.rawAnalysis || {},
    });

    return NextResponse.json({
      candidateId: newCandidate.id,
      analysisId: newAnalysis.id,
      ...analysis
    });
  } catch (error) {
    console.error("Error in upload API:", error);
    return NextResponse.json(
      { error: `Failed to process the resume: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}