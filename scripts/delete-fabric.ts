import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { fabrics } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  const name = process.argv[2];
  if (!name) { console.error("Usage: tsx delete-fabric.ts <name>"); process.exit(1); }
  await db.delete(fabrics).where(eq(fabrics.name, name));
  const all = await db.select({ name: fabrics.name }).from(fabrics);
  console.log("Done. Remaining:", all.map(r => r.name).join(", "));
}
main().catch(console.error);
