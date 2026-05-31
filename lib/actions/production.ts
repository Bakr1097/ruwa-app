"use server";
import { db } from "@/lib/db";
import {
  productionJobs,
  productionJobOutputs,
  fabrics,
  products,
  productVariants,
  userProfiles,
} from "@/lib/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getProductionJobs() {
  return db
    .select({
      id: productionJobs.id,
      metersSent: productionJobs.metersSent,
      status: productionJobs.status,
      createdAt: productionJobs.createdAt,
      productName: products.name,
      fabricName: fabrics.name,
      assignedToName: userProfiles.fullName,
    })
    .from(productionJobs)
    .innerJoin(products, eq(productionJobs.productId, products.id))
    .innerJoin(fabrics, eq(productionJobs.fabricId, fabrics.id))
    .leftJoin(userProfiles, eq(productionJobs.assignedTo, userProfiles.id))
    .orderBy(desc(productionJobs.createdAt));
}

export async function getProductsForDropdown() {
  return db
    .select({
      id: products.id,
      name: products.name,
      fabricId: products.fabricId,
      fabricName: fabrics.name,
      fabricStockMeters: fabrics.stockMeters,
      stitchingCostPerPiece: products.stitchingCostPerPiece,
    })
    .from(products)
    .innerJoin(fabrics, eq(products.fabricId, fabrics.id))
    .where(eq(products.status, "active"))
    .orderBy(asc(products.name));
}

export async function getWorkshopUsers() {
  return db
    .select({ id: userProfiles.id, fullName: userProfiles.fullName, email: userProfiles.email })
    .from(userProfiles)
    .where(eq(userProfiles.role, "workshop"))
    .orderBy(asc(userProfiles.fullName));
}

export async function createProductionJob(formData: FormData): Promise<void> {
  console.log("[createProductionJob] called");

  const productId = formData.get("productId") as string;
  const metersSentRaw = formData.get("metersSent") as string;
  const assignedTo = (formData.get("assignedTo") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!productId || !metersSentRaw) throw new Error("Missing required fields.");
  const metersSent = parseFloat(metersSentRaw);
  if (isNaN(metersSent) || metersSent <= 0) throw new Error("Invalid meters sent.");

  const [product] = await db
    .select({ fabricId: products.fabricId })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product) throw new Error("Product not found.");

  const [fabric] = await db
    .select({ stockMeters: fabrics.stockMeters })
    .from(fabrics)
    .where(eq(fabrics.id, product.fabricId))
    .limit(1);
  if (!fabric) throw new Error("Fabric not found.");

  const stock = parseFloat(fabric.stockMeters ?? "0");
  if (metersSent > stock) {
    throw new Error(
      `Not enough fabric. Available: ${stock.toFixed(2)} m, requested: ${metersSent.toFixed(2)} m.`
    );
  }

  const newStock = (stock - metersSent).toFixed(2);

  await db.batch([
    db.insert(productionJobs).values({
      productId,
      fabricId: product.fabricId,
      metersSent: metersSent.toFixed(2),
      assignedTo: assignedTo ?? undefined,
      notes,
      status: "pending",
    }),
    db.update(fabrics).set({ stockMeters: newStock }).where(eq(fabrics.id, product.fabricId)),
  ]);

  console.log("[createProductionJob] inserted, new fabric stock:", newStock);
  revalidatePath("/production");
  revalidatePath("/fabrics");
}

export async function getProductionJobById(id: string) {
  const [job] = await db
    .select({
      id: productionJobs.id,
      productId: productionJobs.productId,
      fabricId: productionJobs.fabricId,
      metersSent: productionJobs.metersSent,
      leftoverMetersReturned: productionJobs.leftoverMetersReturned,
      status: productionJobs.status,
      assignedTo: productionJobs.assignedTo,
      notes: productionJobs.notes,
      fabricAvgCostAtCompletion: productionJobs.fabricAvgCostAtCompletion,
      fabricConsumedMeters: productionJobs.fabricConsumedMeters,
      costPerPiece: productionJobs.costPerPiece,
      createdAt: productionJobs.createdAt,
      completedAt: productionJobs.completedAt,
      productName: products.name,
      stitchingCostPerPiece: products.stitchingCostPerPiece,
      fabricName: fabrics.name,
      assignedToName: userProfiles.fullName,
    })
    .from(productionJobs)
    .innerJoin(products, eq(productionJobs.productId, products.id))
    .innerJoin(fabrics, eq(productionJobs.fabricId, fabrics.id))
    .leftJoin(userProfiles, eq(productionJobs.assignedTo, userProfiles.id))
    .where(eq(productionJobs.id, id))
    .limit(1);

  if (!job) return null;

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, job.productId))
    .orderBy(asc(productVariants.createdAt));

  const outputs =
    job.status === "completed"
      ? await db
          .select({
            variantId: productionJobOutputs.variantId,
            piecesProduced: productionJobOutputs.piecesProduced,
          })
          .from(productionJobOutputs)
          .where(eq(productionJobOutputs.jobId, id))
      : [];

  return { ...job, variants, outputs };
}

export async function completeProductionJob(formData: FormData): Promise<void> {
  console.log("[completeProductionJob] called");

  const jobId = formData.get("jobId") as string;
  const leftoverRaw = formData.get("leftoverMetersReturned") as string;
  const piecesJson = formData.get("piecesJson") as string;

  if (!jobId) throw new Error("Missing job ID.");
  const leftover = parseFloat(leftoverRaw);
  if (isNaN(leftover) || leftover < 0) throw new Error("Leftover must be >= 0.");

  const piecesInput: { variantId: string; piecesProduced: number }[] = JSON.parse(
    piecesJson || "[]"
  );

  const [job] = await db
    .select({
      productId: productionJobs.productId,
      fabricId: productionJobs.fabricId,
      metersSent: productionJobs.metersSent,
      status: productionJobs.status,
    })
    .from(productionJobs)
    .where(eq(productionJobs.id, jobId))
    .limit(1);

  if (!job) throw new Error("Job not found.");
  if (job.status !== "pending") throw new Error("Job is already completed.");

  const metersSent = parseFloat(job.metersSent);
  if (leftover > metersSent) {
    throw new Error(
      `Leftover (${leftover}) cannot exceed meters sent (${metersSent}).`
    );
  }

  const [fabric] = await db
    .select({ stockMeters: fabrics.stockMeters, avgCostPerMeter: fabrics.avgCostPerMeter })
    .from(fabrics)
    .where(eq(fabrics.id, job.fabricId))
    .limit(1);
  if (!fabric) throw new Error("Fabric not found.");

  const [product] = await db
    .select({ stitchingCostPerPiece: products.stitchingCostPerPiece })
    .from(products)
    .where(eq(products.id, job.productId))
    .limit(1);
  if (!product) throw new Error("Product not found.");

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, job.productId));

  // Step 2-5: calculations
  const fabricConsumed = metersSent - leftover;
  const fabricAvg = parseFloat(fabric.avgCostPerMeter ?? "0");
  const stitchingCostPerPiece = parseFloat(product.stitchingCostPerPiece);
  const totalPieces = piecesInput.reduce((s, p) => s + (p.piecesProduced ?? 0), 0);

  if (totalPieces <= 0) throw new Error("At least 1 piece is required.");

  const costPerPiece =
    (fabricConsumed * fabricAvg + stitchingCostPerPiece * totalPieces) / totalPieces;

  const currentStock = parseFloat(fabric.stockMeters ?? "0");
  const newFabricStock = (currentStock + leftover).toFixed(2);

  // Build operations array for batch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ops: any[] = [
    db.update(fabrics).set({ stockMeters: newFabricStock }).where(eq(fabrics.id, job.fabricId)),
  ];

  // Step 6: update each variant + insert outputs
  for (const piece of piecesInput) {
    if ((piece.piecesProduced ?? 0) <= 0) continue;
    const variant = variants.find((v) => v.id === piece.variantId);
    if (!variant) continue;

    const oldQty = variant.finishedStockQty;
    const oldCost = parseFloat(variant.avgFinishedCost ?? "0");
    const newQty = oldQty + piece.piecesProduced;
    const newAvgCost =
      ((oldQty * oldCost) + (piece.piecesProduced * costPerPiece)) / newQty;

    ops.push(
      db
        .update(productVariants)
        .set({ finishedStockQty: newQty, avgFinishedCost: newAvgCost.toFixed(4) })
        .where(eq(productVariants.id, piece.variantId))
    );

    ops.push(
      db.insert(productionJobOutputs).values({
        jobId,
        variantId: piece.variantId,
        piecesProduced: piece.piecesProduced,
      })
    );
  }

  // Step 7: update job
  ops.push(
    db
      .update(productionJobs)
      .set({
        status: "completed",
        leftoverMetersReturned: leftover.toFixed(2),
        fabricAvgCostAtCompletion: fabricAvg.toFixed(4),
        fabricConsumedMeters: fabricConsumed.toFixed(4),
        costPerPiece: costPerPiece.toFixed(4),
        completedAt: new Date(),
      })
      .where(eq(productionJobs.id, jobId))
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.batch(ops as any);

  console.log("[completeProductionJob] completed, cost/piece:", costPerPiece.toFixed(4));
  revalidatePath("/production");
  revalidatePath(`/production/${jobId}`);
  revalidatePath("/products");
  revalidatePath("/fabrics");
}
