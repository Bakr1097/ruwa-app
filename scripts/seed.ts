import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("Seeding fabrics…");

  await db
    .insert(schema.fabrics)
    .values([
      {
        name: "Black Nida",
        color: "Black",
        supplier: "Al Rahma Textiles",
        stockMeters: "50",
        avgCostPerMeter: "25.00",
        reorderThresholdMeters: "10",
        notes: "Premium quality abaya fabric",
      },
      {
        name: "Ivory Crepe",
        color: "Ivory",
        supplier: "Dubai Fabric House",
        stockMeters: "30",
        avgCostPerMeter: "35.00",
        reorderThresholdMeters: "8",
        notes: null,
      },
      {
        name: "Dusty Rose Nida",
        color: "Dusty Rose",
        supplier: "Al Rahma Textiles",
        stockMeters: "9",
        avgCostPerMeter: "28.00",
        reorderThresholdMeters: "10",
        notes: "Popular colour this season",
      },
    ])
    .onConflictDoNothing();

  console.log("Done — seeded 3 fabrics (Dusty Rose shows LOW STOCK badge).");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
