"use server";
import { db } from "@/lib/db";
import { fabrics, fabricPurchases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function logPurchase(formData: FormData): Promise<void> {
  console.log("[logPurchase] called");

  const fabricId = formData.get("fabricId") as string;
  const meters = parseFloat(formData.get("meters") as string);
  const costPerMeter = parseFloat(formData.get("costPerMeter") as string);
  const supplier = (formData.get("supplier") as string)?.trim() || null;
  const purchaseDate = formData.get("purchaseDate") as string;
  const note = (formData.get("note") as string)?.trim() || null;

  if (!fabricId || isNaN(meters) || isNaN(costPerMeter) || meters <= 0 || costPerMeter < 0) {
    throw new Error("Invalid purchase data.");
  }

  const [fabric] = await db
    .select()
    .from(fabrics)
    .where(eq(fabrics.id, fabricId))
    .limit(1);

  if (!fabric) throw new Error("Fabric not found.");

  const oldStock = parseFloat(fabric.stockMeters ?? "0");
  const oldAvg = parseFloat(fabric.avgCostPerMeter ?? "0");
  const newStock = oldStock + meters;
  const totalCost = meters * costPerMeter;

  // Weighted average: ((old_stock × old_avg) + (meters × cost_per_meter)) / new_stock
  const newAvg =
    newStock === 0 ? 0 : (oldStock * oldAvg + meters * costPerMeter) / newStock;

  await db.insert(fabricPurchases).values({
    fabricId,
    meters: meters.toFixed(2),
    costPerMeter: costPerMeter.toFixed(2),
    totalCost: totalCost.toFixed(2),
    supplier,
    purchaseDate,
    note,
  });

  await db
    .update(fabrics)
    .set({
      stockMeters: newStock.toFixed(2),
      avgCostPerMeter: newAvg.toFixed(4),
    })
    .where(eq(fabrics.id, fabricId));

  revalidatePath(`/fabrics/${fabricId}`);
  revalidatePath("/fabrics");
  console.log("[logPurchase] done, new stock:", newStock.toFixed(2));
}
