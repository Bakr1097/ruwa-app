"use server";
import { db } from "@/lib/db";
import { fabrics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// No auth.getSession() here — middleware already blocks unauthenticated
// requests before they reach this action.
export async function createFabric(formData: FormData): Promise<void> {
  console.log("[createFabric] called");

  const name = (formData.get("name") as string)?.trim();
  const color = (formData.get("color") as string)?.trim();
  const supplier = (formData.get("supplier") as string)?.trim() || null;
  const reorderThreshold = (formData.get("reorderThreshold") as string) || "0";
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name || !color) throw new Error("Name and color are required.");

  await db.insert(fabrics).values({
    name,
    color,
    supplier,
    reorderThresholdMeters: reorderThreshold,
    notes,
  });

  console.log("[createFabric] inserted:", name);
  revalidatePath("/fabrics");
}

export async function getFabrics() {
  return db.select().from(fabrics).orderBy(fabrics.name);
}

export async function getFabricById(id: string) {
  const [fabric] = await db
    .select()
    .from(fabrics)
    .where(eq(fabrics.id, id))
    .limit(1);
  return fabric ?? null;
}
