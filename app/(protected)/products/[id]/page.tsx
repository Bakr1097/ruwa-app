import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById } from "@/lib/actions/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  noStore();
  const product = await getProductById(params.id);
  if (!product) notFound();

  const selling = parseFloat(product.sellingPrice);
  const fabricAvg = parseFloat(product.fabricAvgCost ?? "0");
  const meters = parseFloat(product.metersPerPiece);
  const stitching = parseFloat(product.stitchingCostPerPiece);
  const fabricCostPerPiece = fabricAvg * meters;
  const totalCostPerPiece = fabricCostPerPiece + stitching;
  const margin = selling - totalCostPerPiece;
  const marginPct = selling > 0 ? (margin / selling) * 100 : 0;

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-3 pt-2">
        <Link href="/products" className="text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
        <h1 className="text-xl font-semibold truncate">{product.name}</h1>
        <Badge variant={product.status === "active" ? "success" : "muted"} className="shrink-0">
          {product.status}
        </Badge>
      </div>

      {product.category && (
        <p className="text-sm text-muted-foreground -mt-3">{product.category}</p>
      )}
      {product.description && (
        <p className="text-sm text-muted-foreground">{product.description}</p>
      )}

      {/* Recipe & Costs */}
      <section>
        <h2 className="text-base font-semibold mb-3">Recipe &amp; Costs</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Fabric" value={product.fabricName} />
          <StatCard label="Meters / piece" value={`${meters.toFixed(3)} m`} />
          <StatCard label="Fabric cost / piece" value={`${fabricCostPerPiece.toFixed(2)} PKR`} />
          <StatCard label="Stitching / piece" value={`${stitching.toFixed(2)} PKR`} />
          <StatCard label="Total cost / piece" value={`${totalCostPerPiece.toFixed(2)} PKR`} />
          <StatCard label="Selling price" value={`${selling.toFixed(2)} PKR`} />
        </div>
        <div
          className={`mt-3 rounded-lg border p-3 ${
            margin >= 0 ? "border-border bg-card" : "border-destructive bg-destructive/10"
          }`}
        >
          <p className="text-xs text-muted-foreground">Margin</p>
          <p className={`text-base font-semibold mt-0.5 ${margin < 0 ? "text-destructive" : ""}`}>
            {margin.toFixed(2)} PKR ({marginPct.toFixed(1)}%)
          </p>
        </div>
      </section>

      {/* Variants */}
      <section>
        <h2 className="text-base font-semibold mb-3">Variants</h2>
        {product.variants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No variants.</p>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Size</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Color</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">Stock</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">Avg Cost</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((v) => (
                  <tr key={v.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2">{v.size || "—"}</td>
                    <td className="px-3 py-2">{v.color || "—"}</td>
                    <td className="px-3 py-2 text-right font-medium">{v.finishedStockQty}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {parseFloat(v.avgFinishedCost ?? "0").toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Link href={`/production/new?product=${product.id}`} className="block">
        <Button className="w-full">+ New Production Job</Button>
      </Link>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5 truncate">{value}</p>
    </div>
  );
}
