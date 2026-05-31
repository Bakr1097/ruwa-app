import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { fabrics } from "../lib/db/schema";
import { desc } from "drizzle-orm";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log("Inserting test fabric...");
  const [inserted] = await db.insert(fabrics).values({
    name: "TEST - Sage Green Linen",
    color: "Sage Green",
    supplier: "Test Supplier",
    stockMeters: "0",
    avgCostPerMeter: "0",
    reorderThresholdMeters: "5",
    notes: "Inserted by test script",
  }).returning({ id: fabrics.id, name: fabrics.name });

  console.log("Inserted:", inserted);

  const rows = await db.select({ id: fabrics.id, name: fabrics.name }).from(fabrics).orderBy(desc(fabrics.createdAt));
  console.log("\nAll fabrics now:", rows.map(r => r.name).join(", "));
}

main().catch((e) => { console.error(e); process.exit(1); });
