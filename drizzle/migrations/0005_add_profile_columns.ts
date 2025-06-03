import { pgTable, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export async function up(db: any): Promise<void> {
  await db.execute(sql`
    ALTER TABLE analyses
    ADD COLUMN IF NOT EXISTS professional_profile TEXT,
    ADD COLUMN IF NOT EXISTS full_resume TEXT,
    ADD COLUMN IF NOT EXISTS enhanced_data JSONB;
  `);
}

export async function down(db: any): Promise<void> {
  await db.execute(sql`
    ALTER TABLE analyses
    DROP COLUMN IF EXISTS professional_profile,
    DROP COLUMN IF EXISTS full_resume,
    DROP COLUMN IF EXISTS enhanced_data;
  `);
}
