// src/lib/db/migrate.ts
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const runMigrations = async () => {
  const migrationClient = postgres(process.env.NEXT_PUBLIC_DATABASE_URL!, { max: 1 });
  const db = drizzle(migrationClient);
  
  try {
    console.log("Starting migrations...");
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  } finally {
    await migrationClient.end();
  }
};

runMigrations();
