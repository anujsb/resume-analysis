import { NextRequest, NextResponse } from 'next/server';
import { CandidatesRepository } from '@/lib/repository/candidates-repository';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, remark } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 400 }
      );
    }

    const candidatesRepo = new CandidatesRepository();
    
    if (status) {
      await candidatesRepo.updateCandidateStatus(Number(id), status);
    }
    
    if (remark !== undefined) {
      await candidatesRepo.updateCandidateRemark(Number(id), remark);
    }

    const updatedCandidate = await candidatesRepo.getCandidateWithAnalysis(Number(id));

    return NextResponse.json({
      success: true,
      data: updatedCandidate
    });
  } catch (error) {
    console.error("Error updating candidate:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update candidate" },
      { status: 500 }
    );
  }
}
