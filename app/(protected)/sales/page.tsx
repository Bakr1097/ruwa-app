import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { getSales } from "@/lib/actions/sales";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

function statusVariant(status: string): "warning" | "success" | "destructive" | "muted" {
  if (status === "delivered") return "success";
  if (status === "returned") return "destructive";
  if (status === "pending") return "warning";
  return "muted";
}

export default async function SalesPage() {
  noStore();
  const salesList = await getSales();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-semibold">Sales</h1>
        <Link href="/sales/new">
          <Button size="sm">+ New Sale</Button>
        </Link>
      </div>

      {salesList.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-sm">No sales yet.</p>
          <p className="text-sm mt-1">
            <Link href="/sales/new" className="underline underline-offset-2 text-foreground">
              Record your first sale
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {salesList.map((sale) => {
            const revenue = parseFloat(sale.totalRevenue);
            const summary = sale.itemsSummary.slice(0, 2).join(", ");
            const overflow = sale.itemsSummary.length > 2 ? ` +${sale.itemsSummary.length - 2} more` : "";

            return (
              <Link key={sale.id} href={`/sales/${sale.id}`}>
                <Card className="p-4 space-y-2 active:opacity-75 transition-opacity">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {summary ? summary + overflow : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {sale.paymentMethod.replace("_", " ")}
                      </p>
                    </div>
                    <Badge variant={statusVariant(sale.orderStatus)} className="shrink-0">
                      {sale.orderStatus}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      <span className="font-medium text-foreground">{revenue.toFixed(2)}</span>{" "}
                      PKR
                    </span>
                    <span className="ml-auto">
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
