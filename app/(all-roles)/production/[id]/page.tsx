import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductionJobById } from "@/lib/actions/production";
import { Badge } from "@/components/ui/Badge";
import { CompleteJobForm } from "./CompleteJobForm";

export const dynamic = "force-dynamic";

export default async function ProductionJobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  noStore();
  const job = await getProductionJobById(params.id);
  if (!job) notFound();

  const metersSent = parseFloat(job.metersSent);

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-3 pt-2">
        <Link href="/production" className="text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
        <h1 className="text-xl font-semibold truncate">Job — {job.productName}</h1>
        <Badge
          variant={job.status === "completed" ? "success" : "warning"}
          className="shrink-0"
        >
          {job.status}
        </Badge>
      </div>

      {/* Job details */}
      <section>
        <h2 className="text-base font-semibold mb-3">Details</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Product" value={job.productName} />
          <StatCard label="Fabric" value={job.fabricName} />
          <StatCard label="Meters sent" value={`${metersSent.toFixed(2)} m`} />
          <StatCard label="Assigned to" value={job.assignedToName ?? "—"} />
          <StatCard label="Created" value={new Date(job.createdAt).toLocaleDateString()} />
          {job.completedAt && (
            <StatCard
              label="Completed"
              value={new Date(job.completedAt).toLocaleDateString()}
            />
          )}
        </div>
        {job.notes && (
          <p className="mt-3 text-sm text-muted-foreground border border-border rounded-lg p-3">
            {job.notes}
          </p>
        )}
      </section>

      {job.status === "pending" && (
        <CompleteJobForm jobId={job.id} metersSent={metersSent} variants={job.variants} />
      )}

      {job.status === "completed" && (
        <section>
          <h2 className="text-base font-semibold mb-3">Completion Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Fabric consumed"
              value={`${parseFloat(job.fabricConsumedMeters ?? "0").toFixed(2)} m`}
            />
            <StatCard
              label="Leftover returned"
              value={`${parseFloat(job.leftoverMetersReturned ?? "0").toFixed(2)} m`}
            />
            <StatCard
              label="Avg fabric cost used"
              value={`${parseFloat(job.fabricAvgCostAtCompletion ?? "0").toFixed(2)} PKR/m`}
            />
            <StatCard
              label="Cost per piece"
              value={`${parseFloat(job.costPerPiece ?? "0").toFixed(2)} PKR`}
            />
          </div>

          {job.outputs.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                Pieces produced
              </h3>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Size
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Color
                      </th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                        Pieces
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.outputs.map((output) => {
                      const variant = job.variants.find((v) => v.id === output.variantId);
                      return (
                        <tr
                          key={output.variantId}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-3 py-2">{variant?.size || "—"}</td>
                          <td className="px-3 py-2">{variant?.color || "—"}</td>
                          <td className="px-3 py-2 text-right font-medium">
                            {output.piecesProduced}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}
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
