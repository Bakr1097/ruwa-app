"use server";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth/server";

export async function getExpenses() {
  return db
    .select()
    .from(expenses)
    .orderBy(desc(expenses.expenseDate), desc(expenses.createdAt));
}

export async function createExpense(formData: FormData): Promise<void> {
  console.log("[createExpense] called");

  const session = await getServerSession();
  const expenseDate = (formData.get("expenseDate") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const amountRaw = formData.get("amount") as string;

  if (!expenseDate || !category || !amountRaw) throw new Error("Missing required fields.");
  const amount = parseFloat(amountRaw);
  if (isNaN(amount) || amount <= 0) throw new Error("Amount must be greater than 0.");

  await db.insert(expenses).values({
    expenseDate,
    category,
    description,
    amount: amount.toFixed(2),
    createdBy: session?.user?.id ?? undefined,
  });

  console.log("[createExpense] inserted:", category, amount.toFixed(2));
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
