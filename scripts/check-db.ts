import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { fabrics } from "../lib/db/schema";
import { desc } from "drizzle-orm";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  const rows = await db.select().from(fabrics).orderBy(desc(fabrics.createdAt));
  console.log(`\nTotal fabrics in DB: ${rows.length}`);
  rows.forEach((r) =>
    console.log(`  ${r.name} | ${r.color} | status=${r.status} | created=${r.createdAt}`)
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
