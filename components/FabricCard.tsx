import Link from "next/link";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";

interface Fabric {
  id: string;
  name: string;
  color: string;
  stockMeters: string | null;
  avgCostPerMeter: string | null;
  reorderThresholdMeters: string | null;
}

export function FabricCard({ fabric }: { fabric: Fabric }) {
  const stock = parseFloat(fabric.stockMeters ?? "0");
  const threshold = parseFloat(fabric.reorderThresholdMeters ?? "0");
  const avg = parseFloat(fabric.avgCostPerMeter ?? "0");
  const isLowStock = stock <= threshold && threshold > 0;

  return (
    <Link href={`/fabrics/${fabric.id}`}>
      <Card className="p-4 flex flex-col gap-3 active:opacity-75 transition-opacity">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium truncate">{fabric.name}</p>
            <p className="text-sm text-muted-foreground">{fabric.color}</p>
          </div>
          {isLowStock && (
            <Badge variant="warning" className="shrink-0">Low Stock</Badge>
          )}
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{stock.toFixed(1)}</span> m in stock
          </span>
          <span>
            <span className="font-medium text-foreground">{avg.toFixed(2)}</span> /m avg
          </span>
        </div>
      </Card>
    </Link>
  );
}
