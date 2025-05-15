// src/lib/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Use connection string from environment variable
const connectionString = process.env.NEXT_PUBLIC_DATABASE_URL;

// Check if connection string is provided
if (!connectionString) {
  throw new Error("NEXT_PUBLIC_DATABASE_URL is not set in environment variables");
}

// For server-side usage
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

// drizzle.config.ts
export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.NEXT_PUBLIC_DATABASE_URL || "",
  },
};