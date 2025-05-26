import { NextRequest, NextResponse } from "next/server"
import { CandidatesRepository } from "@/lib/repository/candidates-repository"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { remark } = body
    
    // Await the params object in Next.js 15
    const resolvedParams = await params
    
    const candidatesRepo = new CandidatesRepository()
    await candidatesRepo.updateCandidateRemark(Number(resolvedParams.id), remark)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update remark" },
      { status: 500 }
    )
  }
}