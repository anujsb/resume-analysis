// src/app/api/candidates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CandidatesRepository } from "@/lib/repository/candidates-repository";

export async function GET(request: NextRequest) {
  try {
    const candidatesRepo = new CandidatesRepository();
    const candidates = await candidatesRepo.getAllCandidatesWithAnalyses();
    
    return NextResponse.json({
      success: true,
      data: candidates
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}

// Get a specific candidate by ID
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 400 }
      );
    }
    
    const candidatesRepo = new CandidatesRepository();
    const candidateWithAnalysis = await candidatesRepo.getCandidateWithAnalysis(Number(id));
    
    return NextResponse.json({
      success: true,
      data: candidateWithAnalysis
    });
  } catch (error) {
    console.error("Error fetching candidate:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch candidate" },
      { status: 500 }
    );
  }
}