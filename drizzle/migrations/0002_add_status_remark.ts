import { sql } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

export async function up(db: any) {
  await db.schema.alterTable("candidates", (table: any) => {
    table.addColumn("status", text("status").notNull().default("new"));
    table.addColumn("remark", text("remark"));
  });
}

export async function down(db: any) {
  await db.schema.alterTable("candidates", (table: any) => {
    table.dropColumn("status");
    table.dropColumn("remark");
  });
}