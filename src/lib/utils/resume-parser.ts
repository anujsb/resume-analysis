// src/lib/utils/resume-parser.ts
import { analyzeResume, ResumeAnalysis } from './ai-helpers';
import { db } from '../db';
import { candidates, analyses, skills, experiences } from '../db/schema';

export async function parseAndStoreResume(resumeText: string, name?: string, email?: string): Promise<{
  candidateId: number;
  analysis: ResumeAnalysis;
}> {
  try {
    // Step 1: Analyze the resume using AI
    const analysis = await analyzeResume(resumeText);
    
    // Step 2: Store candidate information in the database
    const [newCandidate] = await db.insert(candidates)
      .values({
        name: name || 'Unknown',
        email: email || 'unknown@example.com',
        resumeText,
      })
      .returning({ id: candidates.id });
    
    if (!newCandidate) {
      throw new Error('Failed to create candidate record');
    }
    
    const candidateId = newCandidate.id;
    
    // Step 3: Store the analysis
    await db.insert(analyses)
      .values({
        candidateId,
        skillsAnalysis: analysis.skills,
        experienceLevel: analysis.experienceLevel,
        totalExperience: analysis.totalExperience,
      });
    
    // Step 4: Store individual skills
    for (const skill of analysis.skills) {
      await db.insert(skills)
        .values({
          candidateId,
          name: skill.skill,
          proficiency: skill.proficiency,
        });
    }
    
    // Step 5: Store work experiences
    for (const exp of analysis.experiences) {
      await db.insert(experiences)
        .values({
          candidateId,
          company: exp.company,
          position: exp.position,
          startDate: exp.startDate,
          endDate: exp.endDate,
          duration: exp.duration,
        });
    }
    
    return {
      candidateId,
      analysis,
    };
  } catch (error) {
    console.error('Error parsing and storing resume:', error);
    throw new Error(`Failed to parse and store resume: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getCandidateAnalysis(candidateId: number): Promise<{
  candidate: any;
  analysis: any;
  skills: any[];
  experiences: any[];
}> {
  const candidate = await db.query.candidates.findFirst({
    where: (candidates, { eq }) => eq(candidates.id, candidateId),
  });
  
  if (!candidate) {
    throw new Error('Candidate not found');
  }
  
  const analysis = await db.query.analyses.findFirst({
    where: (analyses, { eq }) => eq(analyses.candidateId, candidateId),
  });
  
  const skillsList = await db.query.skills.findMany({
    where: (skills, { eq }) => eq(skills.candidateId, candidateId),
  });
  
  const experienceList = await db.query.experiences.findMany({
    where: (experiences, { eq }) => eq(experiences.candidateId, candidateId),
  });
  
  return {
    candidate,
    analysis,
    skills: skillsList,
    experiences: experienceList,
  };
}