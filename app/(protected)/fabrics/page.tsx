import { unstable_noStore as noStore } from "next/cache";
import { db } from "@/lib/db";
import { fabrics } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { FabricCard } from "@/components/FabricCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FabricsPage() {
  // Belt-and-suspenders: opt this render out of all Next.js caching layers
  noStore();

  const renderTime = new Date().toISOString();
  console.log("[FabricsPage] rendering at", renderTime);

  const fabricList = await db
    .select()
    .from(fabrics)
    .where(eq(fabrics.status, "active"))
    .orderBy(asc(fabrics.name));

  console.log("[FabricsPage] fetched", fabricList.length, "fabrics");

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-semibold">Fabrics</h1>
          {/* Temporary debug stamp — remove once confirmed working */}
          <p className="text-xs text-muted-foreground font-mono">rendered {renderTime}</p>
        </div>
        <Link href="/fabrics/new">
          <Button size="sm">+ Add fabric</Button>
        </Link>
      </div>

      {fabricList.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-sm">No fabrics yet.</p>
          <p className="text-sm mt-1">
            <Link href="/fabrics/new" className="underline underline-offset-2 text-foreground">
              Add your first fabric
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fabricList.map((fabric) => (
            <FabricCard key={fabric.id} fabric={fabric} />
          ))}
        </div>
      )}
    </div>
  );
}
