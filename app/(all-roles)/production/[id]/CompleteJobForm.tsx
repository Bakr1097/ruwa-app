"use client";
import { useState } from "react";
import { completeProductionJob } from "@/lib/actions/production";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface Variant {
  id: string;
  size: string | null;
  color: string | null;
}

export function CompleteJobForm({
  jobId,
  metersSent,
  variants,
}: {
  jobId: string;
  metersSent: number;
  variants: Variant[];
}) {
  const [leftover, setLeftover] = useState("0");
  const [pieces, setPieces] = useState<Record<string, number>>(
    Object.fromEntries(variants.map((v) => [v.id, 0]))
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const leftoverNum = parseFloat(leftover) || 0;
  const totalPieces = Object.values(pieces).reduce((s, n) => s + n, 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (leftoverNum < 0 || leftoverNum > metersSent) {
      setError(`Leftover must be between 0 and ${metersSent.toFixed(2)} m.`);
      return;
    }
    if (totalPieces <= 0) {
      setError("At least 1 piece must be produced.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("jobId", jobId);
      fd.set("leftoverMetersReturned", leftoverNum.toString());
      fd.set(
        "piecesJson",
        JSON.stringify(
          Object.entries(pieces).map(([variantId, piecesProduced]) => ({
            variantId,
            piecesProduced,
          }))
        )
      );
      await completeProductionJob(fd);
      window.location.href = "/production";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="text-base font-semibold mb-3">Complete Job</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="leftover">Leftover meters returned</Label>
          <Input
            id="leftover"
            type="number"
            min="0"
            max={metersSent}
            step="0.01"
            value={leftover}
            onChange={(e) => setLeftover(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            0 to {metersSent.toFixed(2)} m
          </p>
        </div>

        <div className="space-y-2">
          <Label>Pieces produced per variant</Label>
          {variants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No variants found.</p>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Size</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Color</th>
                    <th className="text-right px-3 py-2 font-medium text-muted-foreground">Pieces</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">{v.size || "—"}</td>
                      <td className="px-3 py-2">{v.color || "—"}</td>
                      <td className="px-3 py-2 text-right">
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          className="w-20 text-right ml-auto"
                          value={pieces[v.id] ?? 0}
                          onChange={(e) =>
                            setPieces((prev) => ({
                              ...prev,
                              [v.id]: parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Total:{" "}
            <span className="font-medium text-foreground">{totalPieces}</span>{" "}
            {totalPieces === 1 ? "piece" : "pieces"}
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Completing…" : "Mark as Complete"}
        </Button>
      </form>
    </section>
  );
}
