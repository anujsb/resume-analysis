// src/lib/repository/candidates-repository.ts
import { db } from "../db";
import { candidates, analyses, NewCandidate, NewAnalysis, Candidate, Analysis } from "../db/schema";
import { eq } from "drizzle-orm";

export class CandidatesRepository {
  // Create a new candidate
  async createCandidate(candidate: NewCandidate): Promise<Candidate> {
    const result = await db.insert(candidates).values(candidate).returning();
    return result[0];
  }

  // Get a candidate by ID
  async getCandidateById(id: number): Promise<Candidate | undefined> {
    const result = await db.select().from(candidates).where(eq(candidates.id, id));
    return result[0];
  }

  // Get all candidates
  async getAllCandidates(): Promise<Candidate[]> {
    return await db.select().from(candidates).orderBy(candidates.createdAt);
  }

  // Create analysis for a candidate with enhanced profile
  async createAnalysis(analysis: NewAnalysis): Promise<Analysis> {
    const result = await db.insert(analyses).values({
      ...analysis,
      professionalProfile: analysis.professionalProfile || analysis.summary,
      fullResume: analysis.fullResume || analysis.summary
    }).returning();
    return result[0];
  }

  // Update analysis for a candidate
  async updateAnalysis(candidateId: number, analysis: Partial<NewAnalysis>): Promise<Analysis> {
    const result = await db
      .update(analyses)
      .set(analysis)
      .where(eq(analyses.candidateId, candidateId))
      .returning();
    return result[0];
  }

  // Get analysis by candidate ID
  async getAnalysisByCandidateId(candidateId: number): Promise<Analysis | undefined> {
    const result = await db.select().from(analyses).where(eq(analyses.candidateId, candidateId));
    return result[0];
  }

  // Get candidate with enhanced profile analysis
  async getCandidateWithAnalysis(id: number): Promise<{ candidate: Candidate; analysis?: Analysis }> {
    const candidate = await this.getCandidateById(id);
    
    if (!candidate) {
      throw new Error("Candidate not found");
    }
    
    const analysis = await this.getAnalysisByCandidateId(id);
    
    return {
      candidate,
      analysis: analysis ? {
        ...analysis,
        professionalProfile: analysis.professionalProfile || analysis.summary,
        fullResume: analysis.fullResume || candidate.resumeText
      } : undefined
    };
  }

  // Get all candidates with analyses
  async getAllCandidatesWithAnalyses(): Promise<Array<{ candidate: Candidate; analysis?: Analysis }>> {
    const candidatesList = await this.getAllCandidates();
    const results = [];
    
    for (const candidate of candidatesList) {
      const analysis = await this.getAnalysisByCandidateId(candidate.id);
      results.push({
        candidate,
        analysis,
      });
    }
    
    return results;
  }

  // Update candidate status
  async updateCandidateStatus(id: number, status: string) {
    await db
      .update(candidates)
      .set({ status })
      .where(eq(candidates.id, id));
  }

  // Update candidate remark
  async updateCandidateRemark(id: number, remark: string) {
    await db
      .update(candidates)
      .set({ remark })
      .where(eq(candidates.id, id));
  }
}