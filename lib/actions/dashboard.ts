"use server";
import { db } from "@/lib/db";
import {
  sales,
  saleItems,
  expenses,
  products,
  productVariants,
} from "@/lib/db/schema";
import { eq, ne, and, gte, lt, lte, sum, sql } from "drizzle-orm";

// Returns the start of the day after dateStr (used for inclusive end-of-day on timestamp columns)
function nextDay(dateStr: string): Date {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

export async function getDashboardData(from: string, to: string) {
  // 1. Revenue & COGS — exclude returned sales
  const [salesAgg] = await db
    .select({
      totalRevenue: sum(sales.totalRevenue),
      totalCogs: sum(sales.totalCogs),
    })
    .from(sales)
    .where(
      and(
        ne(sales.orderStatus, "returned"),
        gte(sales.saleDate, new Date(from + "T00:00:00Z")),
        lt(sales.saleDate, nextDay(to))
      )
    );

  // 2. Operating expenses total
  const [expensesAgg] = await db
    .select({ totalAmount: sum(expenses.amount) })
    .from(expenses)
    .where(and(gte(expenses.expenseDate, from), lte(expenses.expenseDate, to)));

  // 3. Per-product profitability (exclude returned sales)
  const productProfit = await db
    .select({
      productId: products.id,
      productName: products.name,
      unitsSold: sum(saleItems.qty),
      revenue: sum(saleItems.lineRevenue),
      cogs: sum(saleItems.lineCogs),
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .innerJoin(productVariants, eq(saleItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(
      and(
        ne(sales.orderStatus, "returned"),
        gte(sales.saleDate, new Date(from + "T00:00:00Z")),
        lt(sales.saleDate, nextDay(to))
      )
    )
    .groupBy(products.id, products.name);

  // 4. Expenses by category
  const expensesByCategory = await db
    .select({ category: expenses.category, total: sum(expenses.amount) })
    .from(expenses)
    .where(and(gte(expenses.expenseDate, from), lte(expenses.expenseDate, to)))
    .groupBy(expenses.category);

  // 5. Inventory valuation — current snapshot, not date-filtered
  const [inventoryRow] = await db
    .select({
      value: sql<string>`COALESCE(SUM(${productVariants.finishedStockQty} * ${productVariants.avgFinishedCost}), '0')`,
    })
    .from(productVariants);

  const revenue = parseFloat(salesAgg?.totalRevenue ?? "0");
  const cogs = parseFloat(salesAgg?.totalCogs ?? "0");
  const operatingExpenses = parseFloat(expensesAgg?.totalAmount ?? "0");

  return {
    revenue,
    cogs,
    operatingExpenses,
    productProfit: productProfit.map((p) => ({
      productId: p.productId,
      productName: p.productName,
      unitsSold: parseInt(p.unitsSold ?? "0"),
      revenue: parseFloat(p.revenue ?? "0"),
      cogs: parseFloat(p.cogs ?? "0"),
    })),
    expensesByCategory: expensesByCategory.map((e) => ({
      category: e.category,
      total: parseFloat(e.total ?? "0"),
    })),
    inventoryValue: parseFloat(inventoryRow?.value ?? "0"),
  };
}
