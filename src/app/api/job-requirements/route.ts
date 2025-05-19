import { NextRequest, NextResponse } from "next/server";
import { JobRequirementsRepository } from "@/lib/repository/job-requirements-repository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const repo = new JobRequirementsRepository();
    const requirement = await repo.createRequirement(body);
    
    return NextResponse.json({
      success: true,
      data: requirement
    });
  } catch (error) {
    console.error("Error creating job requirement:", error);
    return NextResponse.json(
      { error: "Failed to create job requirement" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const repo = new JobRequirementsRepository();
    const requirements = await repo.getAllRequirements();
    
    return NextResponse.json({
      success: true,
      data: requirements
    });
  } catch (error) {
    console.error("Error fetching job requirements:", error);
    return NextResponse.json(
      { error: "Failed to fetch job requirements" },
      { status: 500 }
    );
  }
}