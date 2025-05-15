import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/repository";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get("id");
    const candidateId = searchParams.get("candidateId");

    if (!analysisId && !candidateId) {
      return NextResponse.json(
        { error: "Either analysis ID or candidate ID is required" },
        { status: 400 }
      );
    }

    let analysisData;
    
    // Query by analysis ID
    if (analysisId) {
      analysisData = await repository.getAnalysisById(parseInt(analysisId));
    } 
    // Query by candidate ID
    else if (candidateId) {
      analysisData = await repository.getAnalysisByCandidateId(parseInt(candidateId));
    }

    if (!analysisData) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(analysisData);
  } catch (error) {
    console.error("Error in analyze API:", error);
    return NextResponse.json(
      { error: `Failed to retrieve analysis: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}