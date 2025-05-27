import { NextRequest, NextResponse } from "next/server";
import { CandidatesRepository } from "@/lib/repository/candidates-repository";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { status } = body;
    
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }
    
    // Await the params object in Next.js 15
    const resolvedParams = await params;
    
    const candidatesRepo = new CandidatesRepository();
    await candidatesRepo.updateCandidateStatus(Number(resolvedParams.id), status);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update candidate status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}