// src/app/api/candidate-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CandidateProfileRepository } from "@/lib/repository/candidate-profile-repository";

// Get candidate profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const repo = new CandidateProfileRepository();
    const profile = await repo.getProfileByUserId(Number(session.user.id));
    
    return NextResponse.json({
      success: true,
      data: profile || null
    });
  } catch (error) {
    console.error("Error fetching candidate profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// Create or update candidate profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { analysis, resumeText } = body;

    if (!analysis || !resumeText) {
      return NextResponse.json(
        { error: "Analysis data and resume text are required" },
        { status: 400 }
      );
    }

    const repo = new CandidateProfileRepository();
    
    // Create profile data
    const profileData = {
      userId: Number(session.user.id),
      name: session.user.name || "Unknown",
      email: session.user.email || "",
      phone: analysis.phone || "",
      resumeText: resumeText,
      skills: analysis.skills,
      experienceLevel: analysis.experienceLevel,
      workExperienceYears: analysis.workExperienceYears,
      summary: analysis.summary,
    };

    const profile = await repo.upsertCandidateProfile(profileData);
    
    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error("Error creating/updating candidate profile:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}

// Delete candidate profile
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const repo = new CandidateProfileRepository();
    await repo.deleteProfile(Number(session.user.id));
    
    return NextResponse.json({
      success: true,
      message: "Profile deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting candidate profile:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}