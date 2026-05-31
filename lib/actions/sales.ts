"use server";
import { db } from "@/lib/db";
import {
  sales,
  saleItems,
  productVariants,
  products,
  userProfiles,
} from "@/lib/db/schema";
import { eq, asc, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth/server";

// P&L NOTE (Phase 4): when computing revenue/profit, always filter
// WHERE order_status != 'returned'. Totals are kept intact on returned
// sales for audit trail, but they must be excluded from P&L aggregations.

export async function getProductsWithVariants() {
  const productList = await db
    .select({ id: products.id, name: products.name, sellingPrice: products.sellingPrice })
    .from(products)
    .where(eq(products.status, "active"))
    .orderBy(asc(products.name));

  const variantList = await db
    .select({
      id: productVariants.id,
      productId: productVariants.productId,
      size: productVariants.size,
      color: productVariants.color,
      finishedStockQty: productVariants.finishedStockQty,
      avgFinishedCost: productVariants.avgFinishedCost,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(products.status, "active"))
    .orderBy(asc(productVariants.createdAt));

  return { products: productList, variants: variantList };
}

export async function getSales() {
  const salesData = await db
    .select({
      id: sales.id,
      saleDate: sales.saleDate,
      paymentMethod: sales.paymentMethod,
      orderStatus: sales.orderStatus,
      totalRevenue: sales.totalRevenue,
      totalCogs: sales.totalCogs,
    })
    .from(sales)
    .orderBy(desc(sales.saleDate));

  if (salesData.length === 0) return [];

  const saleIds = salesData.map((s) => s.id);

  const itemsData = await db
    .select({
      saleId: saleItems.saleId,
      qty: saleItems.qty,
      variantSize: productVariants.size,
      variantColor: productVariants.color,
      productName: products.name,
    })
    .from(saleItems)
    .innerJoin(productVariants, eq(saleItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(inArray(saleItems.saleId, saleIds));

  const itemsBySale = new Map<string, string[]>();
  for (const item of itemsData) {
    if (!itemsBySale.has(item.saleId)) itemsBySale.set(item.saleId, []);
    const label = [item.qty + "×", item.productName, item.variantColor, item.variantSize]
      .filter(Boolean)
      .join(" ");
    itemsBySale.get(item.saleId)!.push(label);
  }

  return salesData.map((s) => ({
    ...s,
    itemsSummary: itemsBySale.get(s.id) ?? [],
  }));
}

export async function getSaleById(id: string) {
  const [sale] = await db
    .select({
      id: sales.id,
      saleDate: sales.saleDate,
      paymentMethod: sales.paymentMethod,
      orderStatus: sales.orderStatus,
      customerNote: sales.customerNote,
      totalRevenue: sales.totalRevenue,
      totalCogs: sales.totalCogs,
      createdBy: sales.createdBy,
      createdAt: sales.createdAt,
      createdByName: userProfiles.fullName,
    })
    .from(sales)
    .leftJoin(userProfiles, eq(sales.createdBy, userProfiles.id))
    .where(eq(sales.id, id))
    .limit(1);

  if (!sale) return null;

  const items = await db
    .select({
      id: saleItems.id,
      variantId: saleItems.variantId,
      qty: saleItems.qty,
      sellingPrice: saleItems.sellingPrice,
      costPerPiece: saleItems.costPerPiece,
      lineRevenue: saleItems.lineRevenue,
      lineCogs: saleItems.lineCogs,
      variantSize: productVariants.size,
      variantColor: productVariants.color,
      productName: products.name,
    })
    .from(saleItems)
    .innerJoin(productVariants, eq(saleItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(saleItems.saleId, id));

  return { ...sale, items };
}

export async function createSale(formData: FormData): Promise<void> {
  console.log("[createSale] called");

  const session = await getServerSession();
  const paymentMethod = (formData.get("paymentMethod") as string)?.trim();
  const customerNote = (formData.get("customerNote") as string)?.trim() || null;
  const linesJson = formData.get("linesJson") as string;

  if (!paymentMethod) throw new Error("Payment method is required.");

  const lines: { variantId: string; qty: number }[] = JSON.parse(linesJson || "[]");
  if (!lines.length) throw new Error("At least one item is required.");

  // Read all variants involved (for stock validation + cost snapshots)
  const variantIds = lines.map((l) => l.variantId);
  const variantRows = await db
    .select({
      id: productVariants.id,
      productId: productVariants.productId,
      finishedStockQty: productVariants.finishedStockQty,
      avgFinishedCost: productVariants.avgFinishedCost,
    })
    .from(productVariants)
    .where(inArray(productVariants.id, variantIds));

  // Read all products involved (for selling price snapshot)
  const productIds = Array.from(new Set(variantRows.map((v) => v.productId)));
  const productRows = await db
    .select({ id: products.id, sellingPrice: products.sellingPrice })
    .from(products)
    .where(inArray(products.id, productIds));

  const variantMap = new Map(variantRows.map((v) => [v.id, v]));
  const productMap = new Map(productRows.map((p) => [p.id, p]));

  // Validate and compute line amounts
  let totalRevenue = 0;
  let totalCogs = 0;

  type LineCalc = {
    variantId: string;
    qty: number;
    sellingPrice: number;
    costPerPiece: number;
    lineRevenue: number;
    lineCogs: number;
    newStock: number;
  };

  const lineCalcs: LineCalc[] = [];

  for (const line of lines) {
    const variant = variantMap.get(line.variantId);
    if (!variant) throw new Error(`Variant not found.`);
    if (line.qty < 1) throw new Error("Quantity must be at least 1.");
    if (line.qty > variant.finishedStockQty) {
      throw new Error(
        `Quantity (${line.qty}) exceeds available stock (${variant.finishedStockQty}).`
      );
    }

    const product = productMap.get(variant.productId);
    if (!product) throw new Error("Product not found.");

    const sellingPrice = parseFloat(product.sellingPrice);
    const costPerPiece = parseFloat(variant.avgFinishedCost ?? "0");
    const lineRevenue = line.qty * sellingPrice;
    const lineCogs = line.qty * costPerPiece;
    const newStock = variant.finishedStockQty - line.qty;

    totalRevenue += lineRevenue;
    totalCogs += lineCogs;

    lineCalcs.push({
      variantId: line.variantId,
      qty: line.qty,
      sellingPrice,
      costPerPiece,
      lineRevenue,
      lineCogs,
      newStock,
    });
  }

  const saleId = crypto.randomUUID();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ops: any[] = [
    db.insert(sales).values({
      id: saleId,
      paymentMethod,
      customerNote,
      orderStatus: "pending",
      totalRevenue: totalRevenue.toFixed(2),
      totalCogs: totalCogs.toFixed(2),
      createdBy: session?.user?.id ?? undefined,
    }),
  ];

  for (const lc of lineCalcs) {
    ops.push(
      db.insert(saleItems).values({
        saleId,
        variantId: lc.variantId,
        qty: lc.qty,
        sellingPrice: lc.sellingPrice.toFixed(2),
        costPerPiece: lc.costPerPiece.toFixed(4),
        lineRevenue: lc.lineRevenue.toFixed(2),
        lineCogs: lc.lineCogs.toFixed(2),
      })
    );
    ops.push(
      db
        .update(productVariants)
        .set({ finishedStockQty: lc.newStock })
        .where(eq(productVariants.id, lc.variantId))
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.batch(ops as any);

  console.log("[createSale] done, total revenue:", totalRevenue.toFixed(2));
  revalidatePath("/sales");
  revalidatePath("/products");
}

export async function markSaleDelivered(saleId: string): Promise<void> {
  const [sale] = await db
    .select({ orderStatus: sales.orderStatus })
    .from(sales)
    .where(eq(sales.id, saleId))
    .limit(1);
  if (!sale) throw new Error("Sale not found.");
  if (sale.orderStatus !== "pending") throw new Error("Only pending sales can be marked delivered.");

  await db.update(sales).set({ orderStatus: "delivered" }).where(eq(sales.id, saleId));

  revalidatePath(`/sales/${saleId}`);
  revalidatePath("/sales");
}

export async function markSaleReturned(saleId: string): Promise<void> {
  const [sale] = await db
    .select({ orderStatus: sales.orderStatus })
    .from(sales)
    .where(eq(sales.id, saleId))
    .limit(1);
  if (!sale) throw new Error("Sale not found.");
  if (sale.orderStatus === "returned") throw new Error("Sale is already returned.");

  const items = await db
    .select({ variantId: saleItems.variantId, qty: saleItems.qty })
    .from(saleItems)
    .where(eq(saleItems.saleId, saleId));

  // Read current stock for each variant to compute new values
  const variantIds = items.map((i) => i.variantId);
  const variantRows = await db
    .select({ id: productVariants.id, finishedStockQty: productVariants.finishedStockQty })
    .from(productVariants)
    .where(inArray(productVariants.id, variantIds));
  const variantMap = new Map(variantRows.map((v) => [v.id, v]));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ops: any[] = [
    db.update(sales).set({ orderStatus: "returned" }).where(eq(sales.id, saleId)),
  ];

  for (const item of items) {
    const variant = variantMap.get(item.variantId);
    const newStock = (variant?.finishedStockQty ?? 0) + item.qty;
    ops.push(
      db
        .update(productVariants)
        .set({ finishedStockQty: newStock })
        .where(eq(productVariants.id, item.variantId))
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.batch(ops as any);

  revalidatePath(`/sales/${saleId}`);
  revalidatePath("/sales");
  revalidatePath("/products");
}
