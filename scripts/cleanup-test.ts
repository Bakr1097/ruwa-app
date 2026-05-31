import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { fabrics } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  await db.delete(fabrics).where(eq(fabrics.name, "TEST - Sage Green Linen"));
  console.log("Cleaned up test fabric.");

  const rows = await db.select({ name: fabrics.name }).from(fabrics);
  console.log("Remaining:", rows.map(r => r.name).join(", "));
}

main().catch(console.error);
