"use client";
import { useState } from "react";
import { markSaleDelivered, markSaleReturned } from "@/lib/actions/sales";
import { Button } from "@/components/ui/Button";

export function StatusActions({
  saleId,
  status,
}: {
  saleId: string;
  status: string;
}) {
  const [loading, setLoading] = useState<"deliver" | "return" | null>(null);
  const [error, setError] = useState("");

  if (status === "returned") return null;

  const handle = async (action: "deliver" | "return") => {
    setLoading(action);
    setError("");
    try {
      if (action === "deliver") {
        await markSaleDelivered(saleId);
      } else {
        await markSaleReturned(saleId);
      }
      window.location.href = `/sales/${saleId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(null);
    }
  };

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">Actions</h2>
      <div className="flex gap-3">
        {status === "pending" && (
          <Button
            className="flex-1"
            onClick={() => handle("deliver")}
            disabled={loading !== null}
          >
            {loading === "deliver" ? "Updating…" : "Mark Delivered"}
          </Button>
        )}
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => handle("return")}
          disabled={loading !== null}
        >
          {loading === "return" ? "Updating…" : "Mark Returned"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </section>
  );
}
