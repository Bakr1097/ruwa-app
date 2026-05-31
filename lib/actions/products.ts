"use server";
import { db } from "@/lib/db";
import { products, productVariants, fabrics } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface VariantInput {
  size: string;
  color: string;
  finishedStockQty: number;
}

export async function createProduct(formData: FormData): Promise<void> {
  console.log("[createProduct] called");

  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const sellingPrice = formData.get("sellingPrice") as string;
  const fabricId = formData.get("fabricId") as string;
  const metersPerPiece = formData.get("metersPerPiece") as string;
  const stitchingCostPerPiece = formData.get("stitchingCostPerPiece") as string;
  const variantsJson = formData.get("variants") as string;

  if (!name || !sellingPrice || !fabricId || !metersPerPiece || !stitchingCostPerPiece) {
    throw new Error("Missing required fields.");
  }

  const variantInputs: VariantInput[] = JSON.parse(variantsJson || "[]");
  if (!variantInputs.length) throw new Error("At least one variant is required.");

  const productId = crypto.randomUUID();

  // db.batch sends both inserts in one HTTP request and Neon executes them
  // atomically — no WebSocket or ws package needed.
  await db.batch([
    db.insert(products).values({
      id: productId,
      name,
      category,
      description,
      sellingPrice,
      fabricId,
      metersPerPiece,
      stitchingCostPerPiece,
    }),
    db.insert(productVariants).values(
      variantInputs.map((v) => ({
        productId,
        size: v.size?.trim() || null,
        color: v.color?.trim() || null,
        finishedStockQty: v.finishedStockQty ?? 0,
      }))
    ),
  ]);

  console.log("[createProduct] inserted:", name);
  revalidatePath("/products");
}

export async function getProducts() {
  return db
    .select({
      id: products.id,
      name: products.name,
      category: products.category,
      status: products.status,
      sellingPrice: products.sellingPrice,
      metersPerPiece: products.metersPerPiece,
      stitchingCostPerPiece: products.stitchingCostPerPiece,
      fabricName: fabrics.name,
      fabricAvgCost: fabrics.avgCostPerMeter,
    })
    .from(products)
    .innerJoin(fabrics, eq(products.fabricId, fabrics.id))
    .orderBy(asc(products.name));
}

export async function getActiveFabrics() {
  return db
    .select({
      id: fabrics.id,
      name: fabrics.name,
      avgCostPerMeter: fabrics.avgCostPerMeter,
    })
    .from(fabrics)
    .where(eq(fabrics.status, "active"))
    .orderBy(asc(fabrics.name));
}

export async function getProductById(id: string) {
  const [row] = await db
    .select({
      id: products.id,
      name: products.name,
      category: products.category,
      description: products.description,
      status: products.status,
      sellingPrice: products.sellingPrice,
      metersPerPiece: products.metersPerPiece,
      stitchingCostPerPiece: products.stitchingCostPerPiece,
      fabricId: products.fabricId,
      fabricName: fabrics.name,
      fabricAvgCost: fabrics.avgCostPerMeter,
    })
    .from(products)
    .innerJoin(fabrics, eq(products.fabricId, fabrics.id))
    .where(eq(products.id, id))
    .limit(1);

  if (!row) return null;

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, id))
    .orderBy(asc(productVariants.createdAt));

  return { ...row, variants };
}
