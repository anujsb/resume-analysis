// src/lib/db/seed.ts
import { db } from ".";
import { candidates, analyses } from "./schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

// Use connection string from environment variable
const connectionString = process.env.NEXT_PUBLIC_DATABASE_URL;

// Check if connection string is provided
if (!connectionString) {
  throw new Error("NEXT_PUBLIC_DATABASE_URL is not set in environment variables");
}

// For server-side usage
const queryClient = postgres(connectionString);
const dbForSeeding = drizzle(queryClient);

async function seed() {
  console.log("Seeding the database...");

  try {
    // Clear existing data
    await dbForSeeding.delete(analyses);
    await dbForSeeding.delete(candidates);
    
    console.log("Database tables cleared.");

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await queryClient.end();
  }
}

seed();