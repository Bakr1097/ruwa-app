import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { getExpenses } from "@/lib/actions/expenses";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "muted";

const CATEGORY_VARIANT: Record<string, BadgeVariant> = {
  ads: "default",
  packaging: "success",
  shipping: "warning",
  overheads: "destructive",
  other: "muted",
};

export default async function ExpensesPage() {
  noStore();
  const expenseList = await getExpenses();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-semibold">Expenses</h1>
        <Link href="/expenses/new">
          <Button size="sm">+ Add Expense</Button>
        </Link>
      </div>

      {expenseList.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-sm">No expenses yet.</p>
          <p className="text-sm mt-1">
            <Link href="/expenses/new" className="underline underline-offset-2 text-foreground">
              Add your first expense
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-sm font-semibold">
              PKR{" "}
              {expenseList
                .reduce((sum, e) => sum + parseFloat(e.amount), 0)
                .toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          {expenseList.map((expense) => (
            <Card key={expense.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {parseFloat(expense.amount).toFixed(2)} PKR
                  </p>
                  {expense.description && (
                    <p className="text-xs text-muted-foreground truncate">{expense.description}</p>
                  )}
                </div>
                <Badge
                  variant={CATEGORY_VARIANT[expense.category] ?? "muted"}
                  className="shrink-0 capitalize"
                >
                  {expense.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{expense.expenseDate}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
