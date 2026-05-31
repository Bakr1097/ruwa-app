import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { getProducts } from "@/lib/actions/products";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  noStore();
  const productList = await getProducts();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link href="/products/new">
          <Button size="sm">+ Add product</Button>
        </Link>
      </div>

      {productList.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-sm">No products yet.</p>
          <p className="text-sm mt-1">
            <Link href="/products/new" className="underline underline-offset-2 text-foreground">
              Add your first product
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {productList.map((p) => {
            const selling = parseFloat(p.sellingPrice);
            const fabricCost = parseFloat(p.metersPerPiece) * parseFloat(p.fabricAvgCost ?? "0");
            const costPerPiece = fabricCost + parseFloat(p.stitchingCostPerPiece);
            const margin = selling - costPerPiece;
            const marginPct = selling > 0 ? (margin / selling) * 100 : 0;

            return (
              <Link key={p.id} href={`/products/${p.id}`}>
                <Card className="p-4 space-y-2 active:opacity-75 transition-opacity">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      {p.category && (
                        <p className="text-xs text-muted-foreground">{p.category}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{p.fabricName}</p>
                      <p className="text-xs text-muted-foreground">
                        In stock:{" "}
                        <span className="font-medium text-foreground">{p.totalStock} pcs</span>
                      </p>
                    </div>
                    <Badge variant={p.status === "active" ? "success" : "muted"} className="shrink-0">
                      {p.status}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      <span className="font-medium text-foreground">{selling.toFixed(2)}</span> sell
                    </span>
                    <span>
                      <span className="font-medium text-foreground">{costPerPiece.toFixed(2)}</span> cost
                    </span>
                    <span>
                      <span className={`font-medium ${marginPct >= 0 ? "text-foreground" : "text-destructive"}`}>
                        {marginPct.toFixed(1)}%
                      </span>{" "}
                      margin
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
