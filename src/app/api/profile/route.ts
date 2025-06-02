import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CandidatesRepository } from "@/lib/repository/candidates-repository";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const candidatesRepo = new CandidatesRepository();
    const candidates = await candidatesRepo.getAllCandidatesWithAnalyses();
    
    // Find the candidate associated with the current user's email
    const userCandidate = candidates.find(c => 
      c.candidate.email === session.user.email
    );

    if (!userCandidate) {
      return NextResponse.json({
        success: true,
        data: null
      });
    }

    return NextResponse.json({
      success: true,
      data: userCandidate
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
