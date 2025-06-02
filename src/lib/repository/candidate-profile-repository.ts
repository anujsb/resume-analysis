// src/lib/repository/candidate-profile-repository.ts
import { db } from "../db";
import { candidateProfiles, NewCandidateProfile, CandidateProfile } from "../db/schema";
import { eq } from "drizzle-orm";

export class CandidateProfileRepository {
  // Create or update candidate profile
  async upsertCandidateProfile(profile: Omit<NewCandidateProfile, 'createdAt' | 'updatedAt'>): Promise<CandidateProfile> {
    // First check if profile exists for this user
    const existingProfile = await this.getProfileByUserId(profile.userId);
    
    if (existingProfile) {
      // Update existing profile
      const result = await db
        .update(candidateProfiles)
        .set({
          ...profile,
          updatedAt: new Date(),
        })
        .where(eq(candidateProfiles.userId, profile.userId))
        .returning();
      return result[0];
    } else {
      // Create new profile
      const result = await db.insert(candidateProfiles).values(profile).returning();
      return result[0];
    }
  }

  // Get profile by user ID
  async getProfileByUserId(userId: number): Promise<CandidateProfile | undefined> {
    const result = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userId));
    return result[0];
  }

  // Get profile by ID
  async getProfileById(id: number): Promise<CandidateProfile | undefined> {
    const result = await db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.id, id));
    return result[0];
  }

  // Delete profile
  async deleteProfile(userId: number): Promise<void> {
    await db
      .delete(candidateProfiles)
      .where(eq(candidateProfiles.userId, userId));
  }

  // Get all profiles (for admin/recruiter use)
  async getAllProfiles(): Promise<CandidateProfile[]> {
    return await db
      .select()
      .from(candidateProfiles)
      .orderBy(candidateProfiles.updatedAt);
  }
}