import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CandidatesRepository } from "@/lib/repository/candidates-repository";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const candidatesRepo = new CandidatesRepository();
    let userCandidate = null;
    
    // First try to find by session email if available
    if (session?.user?.email) {
      const candidates = await candidatesRepo.getAllCandidatesWithAnalyses();
      userCandidate = candidates.find(c => 
        c.candidate.email === session.user.email
      );
    }
    
    // If no candidate found by email, get the most recent one
    if (!userCandidate) {
      const candidates = await candidatesRepo.getAllCandidatesWithAnalyses();
      if (candidates.length > 0) {
        // Get the most recent candidate based on creation date
        userCandidate = candidates.sort((a, b) => 
          new Date(b.candidate.createdAt).getTime() - new Date(a.candidate.createdAt).getTime()
        )[0];
      }
    }

    if (!userCandidate) {
      return NextResponse.json({
        success: true,
        data: null
      });
    }

    // Format the response with enhanced data
    const response = {
      success: true,
      data: {
        candidate: userCandidate.candidate,
        analysis: {
          ...userCandidate.analysis,
          enhancedData: userCandidate.analysis?.enhancedData || {
            professionalProfile: userCandidate.analysis?.summary,
            fullResume: userCandidate.candidate.resumeText,
            lastUpdated: userCandidate.analysis?.createdAt
          }
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
