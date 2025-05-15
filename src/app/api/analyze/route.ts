// src/app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseAndStoreResume, getCandidateAnalysis } from '@/lib/utils/resume-parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const resumeText = formData.get('resumeText') as string;
    const name = formData.get('name') as string || undefined;
    const email = formData.get('email') as string || undefined;
    
    if (!resumeText) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }
    
    // Parse and store the resume
    const result = await parseAndStoreResume(resumeText, name, email);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in analyze API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch a candidate's analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    
    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }
    
    const analysis = await getCandidateAnalysis(parseInt(candidateId, 10));
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error fetching candidate analysis:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}