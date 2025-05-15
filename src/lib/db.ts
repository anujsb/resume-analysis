import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Check if database URL is provided in environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// Create Neon connection
const sql = neon(process.env.DATABASE_URL);

// Create Drizzle ORM client with schema
export const db = drizzle(sql, { schema });

// Optionally, you can create a function to run migrations
export async function runMigrations() {
  try {
    const { migrate } = await import("drizzle-orm/neon-http/migrator");
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations completed.");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}