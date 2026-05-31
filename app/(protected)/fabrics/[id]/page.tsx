import { db } from "@/lib/db";
import { fabrics, fabricPurchases } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FabricDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [fabric] = await db
    .select()
    .from(fabrics)
    .where(eq(fabrics.id, params.id))
    .limit(1);

  if (!fabric) notFound();

  const purchases = await db
    .select()
    .from(fabricPurchases)
    .where(eq(fabricPurchases.fabricId, params.id))
    .orderBy(desc(fabricPurchases.purchaseDate));

  const stock = parseFloat(fabric.stockMeters ?? "0");
  const threshold = parseFloat(fabric.reorderThresholdMeters ?? "0");
  const avg = parseFloat(fabric.avgCostPerMeter ?? "0");
  const isLowStock = stock <= threshold && threshold > 0;

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-3 pt-2">
        <Link href="/fabrics" className="text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
        <h1 className="text-xl font-semibold truncate">{fabric.name}</h1>
      </div>

      {/* Fabric stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="In stock" value={`${stock.toFixed(1)} m`} highlight={isLowStock} />
        <StatCard label="Avg cost/m" value={`${avg.toFixed(2)}`} />
        <StatCard label="Color" value={fabric.color} />
        <StatCard label="Reorder at" value={`${threshold.toFixed(1)} m`} />
      </div>

      {isLowStock && (
        <Badge variant="warning" className="text-sm px-3 py-1">
          Low Stock — below reorder threshold
        </Badge>
      )}

      {fabric.supplier && (
        <p className="text-sm text-muted-foreground">Supplier: {fabric.supplier}</p>
      )}
      {fabric.notes && (
        <p className="text-sm text-muted-foreground">{fabric.notes}</p>
      )}

      <Link href={`/fabrics/${fabric.id}/purchase`} className="block">
        <Button className="w-full">+ Log purchase</Button>
      </Link>

      {/* Purchase history */}
      <section>
        <h2 className="text-base font-semibold mb-3">Purchase history</h2>
        {purchases.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No purchases yet.</p>
        ) : (
          <div className="space-y-3">
            {purchases.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-border p-3 space-y-1 text-sm"
              >
                <div className="flex justify-between font-medium">
                  <span>{parseFloat(p.meters).toFixed(1)} m</span>
                  <span>{p.purchaseDate}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{parseFloat(p.costPerMeter).toFixed(2)} /m</span>
                  <span>Total: {parseFloat(p.totalCost).toFixed(2)}</span>
                </div>
                {(p.supplier || p.note) && (
                  <p className="text-muted-foreground">
                    {[p.supplier, p.note].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-warning bg-warning/10" : "border-border bg-card"}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-base font-semibold mt-0.5 ${highlight ? "text-warning" : ""}`}>{value}</p>
    </div>
  );
}
