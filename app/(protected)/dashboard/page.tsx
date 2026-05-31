import { unstable_noStore as noStore } from "next/cache";
import { getDashboardData } from "@/lib/actions/dashboard";
import { DateFilter } from "./DateFilter";

export const dynamic = "force-dynamic";

function thisMonthRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const last = new Date(y, now.getMonth() + 1, 0).getDate();
  return {
    from: `${y}-${m}-01`,
    to: `${y}-${m}-${String(last).padStart(2, "0")}`,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  noStore();

  const defaults = thisMonthRange();
  const from =
    typeof searchParams.from === "string" ? searchParams.from : defaults.from;
  const to =
    typeof searchParams.to === "string" ? searchParams.to : defaults.to;

  const data = await getDashboardData(from, to);

  const grossProfit = data.revenue - data.cogs;
  const grossMargin = data.revenue > 0 ? (grossProfit / data.revenue) * 100 : 0;
  const netProfit = grossProfit - data.operatingExpenses;
  const netMargin = data.revenue > 0 ? (netProfit / data.revenue) * 100 : 0;

  return (
    <div className="p-4 space-y-5">
      <div className="pt-2">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>

      <DateFilter from={from} to={to} />

      {/* Summary cards */}
      <section>
        <h2 className="text-base font-semibold mb-3">P&amp;L Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Revenue" value={`${data.revenue.toFixed(2)} PKR`} />
          <StatCard label="COGS" value={`${data.cogs.toFixed(2)} PKR`} />
          <StatCard
            label="Gross Profit"
            value={`${grossProfit.toFixed(2)} PKR`}
            sub={`${grossMargin.toFixed(1)}% margin`}
            highlight={grossProfit < 0}
          />
          <StatCard
            label="Op. Expenses"
            value={`${data.operatingExpenses.toFixed(2)} PKR`}
          />
          <div className="col-span-2">
            <StatCard
              label="Net Profit"
              value={`${netProfit.toFixed(2)} PKR`}
              sub={`${netMargin.toFixed(1)}% net margin`}
              highlight={netProfit < 0}
              wide
            />
          </div>
        </div>
      </section>

      {/* Per-product profitability */}
      <section>
        <h2 className="text-base font-semibold mb-3">Product Profitability</h2>
        {data.productProfit.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No sales in this period.
          </p>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                    Units
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                    Revenue
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                    COGS
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                    GP
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.productProfit.map((p) => {
                  const gp = p.revenue - p.cogs;
                  return (
                    <tr
                      key={p.productId}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-3 py-2 font-medium truncate max-w-[120px]">
                        {p.productName}
                      </td>
                      <td className="px-3 py-2 text-right">{p.unitsSold}</td>
                      <td className="px-3 py-2 text-right">
                        {p.revenue.toFixed(0)}
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {p.cogs.toFixed(0)}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-medium ${
                          gp < 0 ? "text-destructive" : ""
                        }`}
                      >
                        {gp.toFixed(0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Expenses breakdown */}
      <section>
        <h2 className="text-base font-semibold mb-3">Expenses by Category</h2>
        {data.expensesByCategory.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No expenses in this period.
          </p>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                    Total (PKR)
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.expensesByCategory.map((e) => (
                  <tr
                    key={e.category}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-3 py-2 capitalize">{e.category}</td>
                    <td className="px-3 py-2 text-right font-medium">
                      {e.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Inventory valuation */}
      <section>
        <h2 className="text-base font-semibold mb-3">Inventory</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            Current finished inventory value
          </p>
          <p className="text-lg font-semibold mt-1">
            {data.inventoryValue.toFixed(2)} PKR
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Live snapshot — not filtered by date
          </p>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
  wide,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        highlight ? "border-destructive bg-destructive/10" : "border-border bg-card"
      } ${wide ? "flex items-center justify-between" : ""}`}
    >
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`text-sm font-semibold mt-0.5 ${
            highlight ? "text-destructive" : ""
          }`}
        >
          {value}
        </p>
      </div>
      {sub && (
        <p className={`text-xs mt-1 ${highlight ? "text-destructive" : "text-muted-foreground"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
