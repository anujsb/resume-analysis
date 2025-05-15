import { db } from "./db";
import { candidates, analysisResults, type Candidate, type AnalysisResult, type ExperienceLevel } from "./schema";
import { eq } from "drizzle-orm";

/**
 * Repository layer for database operations
 * This abstraction separates database logic from the API routes
 */
export class Repository {
  /**
   * Create a new candidate record
   */
  async createCandidate(candidateData: {
    name: string | null;
    email: string | null;
    phone: string | null;
    resumeUrl: string;
  }): Promise<Candidate> {
    const [newCandidate] = await db
      .insert(candidates)
      .values(candidateData)
      .returning();
    
    return newCandidate as Candidate;
  }

  /**
   * Create a new analysis result
   */
  async createAnalysisResult(analysisData: {
    candidateId: number;
    skills: { skill: string; proficiency: number }[];
    experienceLevel: ExperienceLevel;
    yearsOfExperience: number;
    rawAnalysis: Record<string, any>;
  }): Promise<AnalysisResult> {
    const [newAnalysis] = await db
      .insert(analysisResults)
      .values(analysisData)
      .returning();
    
    return newAnalysis as AnalysisResult;
  }

  /**
   * Get analysis result by ID
   */
  async getAnalysisById(id: number): Promise<(AnalysisResult & { candidate: Candidate }) | null> {
    const result = await db.query.analysisResults.findFirst({
      where: (analysisResults) => eq(analysisResults.id, id),
      with: {
        candidate: true
      }
    });
    
    return result as (AnalysisResult & { candidate: Candidate }) | null;
  }

  /**
   * Get analysis result by candidate ID
   */
  async getAnalysisByCandidateId(candidateId: number): Promise<(AnalysisResult & { candidate: Candidate }) | null> {
    const result = await db.query.analysisResults.findFirst({
      where: (analysisResults) => eq(analysisResults.candidateId, candidateId),
      with: {
        candidate: true
      }
    });
    
    return result as (AnalysisResult & { candidate: Candidate }) | null;
  }

  /**
   * Get all candidates
   */
  async getAllCandidates(): Promise<Candidate[]> {
    const results = await db.query.candidates.findMany();
    return results as Candidate[];
  }

  /**
   * Get candidate by ID
   */
  async getCandidateById(id: number): Promise<Candidate | null> {
    const result = await db.query.candidates.findFirst({
      where: (candidates) => eq(candidates.id, id)
    });
    
    return result as Candidate | null;
  }
}

// Export a singleton instance
export const repository = new Repository();