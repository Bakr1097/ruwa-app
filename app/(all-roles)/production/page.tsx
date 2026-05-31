import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { getProductionJobs } from "@/lib/actions/production";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function ProductionPage() {
  noStore();
  const jobs = await getProductionJobs();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-semibold">Production</h1>
        <Link href="/production/new">
          <Button size="sm">+ New Job</Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-sm">No production jobs yet.</p>
          <p className="text-sm mt-1">
            <Link href="/production/new" className="underline underline-offset-2 text-foreground">
              Create your first job
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/production/${job.id}`}>
              <Card className="p-4 space-y-2 active:opacity-75 transition-opacity">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{job.productName}</p>
                    <p className="text-xs text-muted-foreground">{job.fabricName}</p>
                  </div>
                  <Badge
                    variant={job.status === "completed" ? "success" : "warning"}
                    className="shrink-0"
                  >
                    {job.status}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    <span className="font-medium text-foreground">
                      {parseFloat(job.metersSent).toFixed(2)}
                    </span>{" "}
                    m sent
                  </span>
                  {job.assignedToName && <span>→ {job.assignedToName}</span>}
                  <span className="ml-auto">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
