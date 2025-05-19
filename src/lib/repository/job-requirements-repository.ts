import { db } from "../db";
import { jobRequirements, JobRequirement, NewJobRequirement } from "../db/schema";
import { eq } from "drizzle-orm";

export class JobRequirementsRepository {
  async createRequirement(requirement: NewJobRequirement): Promise<JobRequirement> {
    const result = await db.insert(jobRequirements).values(requirement).returning();
    return result[0];
  }

  async getAllRequirements(): Promise<JobRequirement[]> {
    return await db.select().from(jobRequirements).orderBy(jobRequirements.createdAt);
  }

  async getRequirementById(id: number): Promise<JobRequirement | undefined> {
    const result = await db.select().from(jobRequirements).where(eq(jobRequirements.id, id));
    return result[0];
  }

  async deleteRequirement(id: number): Promise<void> {
    await db.delete(jobRequirements).where(eq(jobRequirements.id, id));
  }
}