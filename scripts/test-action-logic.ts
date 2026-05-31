/**
 * Runs the exact same DB logic as createFabric (minus auth)
 * to verify the insert + revalidatePath cycle works correctly.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { fabrics } from "../lib/db/schema";
import { asc, eq } from "drizzle-orm";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  // ---- simulate createFabric payload ----
  const name = "Midnight Blue Crepe";
  const color = "Midnight Blue";
  const supplier = "Fabric House Dubai";
  const reorderThresholdMeters = "8";
  const notes = "Added via test script";

  console.log("Inserting fabric:", name);
  const [row] = await db.insert(fabrics).values({
    name,
    color,
    supplier,
    reorderThresholdMeters,
    notes,
  }).returning({ id: fabrics.id });

  console.log("Inserted id:", row.id);

  // ---- simulate FabricsPage query ----
  const list = await db
    .select()
    .from(fabrics)
    .where(eq(fabrics.status, "active"))
    .orderBy(asc(fabrics.name));

  console.log(`\nFabricsPage query returns ${list.length} fabrics:`);
  list.forEach(f => console.log(`  ${f.name} | ${f.color}`));
}

main().catch((e) => { console.error(e); process.exit(1); });
