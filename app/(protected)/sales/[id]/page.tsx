import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSaleById } from "@/lib/actions/sales";
import { Badge } from "@/components/ui/Badge";
import { StatusActions } from "./StatusActions";

export const dynamic = "force-dynamic";

function statusVariant(status: string): "warning" | "success" | "destructive" | "muted" {
  if (status === "delivered") return "success";
  if (status === "returned") return "destructive";
  if (status === "pending") return "warning";
  return "muted";
}

export default async function SaleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  noStore();
  const sale = await getSaleById(params.id);
  if (!sale) notFound();

  const totalRevenue = parseFloat(sale.totalRevenue);
  const totalCogs = parseFloat(sale.totalCogs);
  const grossProfit = totalRevenue - totalCogs;
  const marginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-3 pt-2">
        <Link href="/sales" className="text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
        <h1 className="text-xl font-semibold truncate">Sale</h1>
        <Badge variant={statusVariant(sale.orderStatus)} className="shrink-0">
          {sale.orderStatus}
        </Badge>
      </div>

      {/* Sale details */}
      <section>
        <h2 className="text-base font-semibold mb-3">Details</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Date"
            value={new Date(sale.saleDate).toLocaleDateString()}
          />
          <StatCard
            label="Payment"
            value={sale.paymentMethod.replace(/_/g, " ")}
          />
          <StatCard label="Created by" value={sale.createdByName ?? "—"} />
          <StatCard label="Status" value={sale.orderStatus} />
        </div>
        {sale.customerNote && (
          <p className="mt-3 text-sm text-muted-foreground border border-border rounded-lg p-3">
            {sale.customerNote}
          </p>
        )}
      </section>

      {/* Line items */}
      <section>
        <h2 className="text-base font-semibold mb-3">Items</h2>
        {sale.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items.</p>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Item</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">Qty</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">Price</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => {
                  const variantLabel = [item.variantColor, item.variantSize]
                    .filter(Boolean)
                    .join(" / ");
                  return (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">
                        <p className="font-medium">{item.productName}</p>
                        {variantLabel && (
                          <p className="text-xs text-muted-foreground">{variantLabel}</p>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">{item.qty}</td>
                      <td className="px-3 py-2 text-right">
                        {parseFloat(item.sellingPrice).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right font-medium">
                        {parseFloat(item.lineRevenue).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* COGS detail (collapsed, smaller rows) */}
      {sale.items.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3">Cost Detail</h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Item</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">Cost/pc</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">COGS</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-muted-foreground">
                      {item.productName}{" "}
                      {[item.variantColor, item.variantSize].filter(Boolean).join(" / ")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {parseFloat(item.costPerPiece).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {parseFloat(item.lineCogs).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Totals */}
      <section>
        <h2 className="text-base font-semibold mb-3">Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total revenue" value={`${totalRevenue.toFixed(2)} PKR`} />
          <StatCard label="Total COGS" value={`${totalCogs.toFixed(2)} PKR`} />
          <StatCard label="Gross profit" value={`${grossProfit.toFixed(2)} PKR`} />
          <StatCard label="Margin" value={`${marginPct.toFixed(1)}%`} />
        </div>
        {sale.orderStatus === "returned" && (
          <p className="mt-3 text-xs text-muted-foreground border border-border rounded-lg p-3">
            This sale is returned. Revenue and COGS are kept for audit but excluded from P&L reporting.
          </p>
        )}
      </section>

      {/* Status actions */}
      <StatusActions saleId={sale.id} status={sale.orderStatus} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5 truncate capitalize">{value}</p>
    </div>
  );
}
