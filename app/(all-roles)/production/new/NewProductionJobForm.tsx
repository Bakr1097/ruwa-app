"use client";
import { useState } from "react";
import Link from "next/link";
import { createProductionJob } from "@/lib/actions/production";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

interface Product {
  id: string;
  name: string;
  fabricId: string;
  fabricName: string;
  fabricStockMeters: string | null;
  stitchingCostPerPiece: string;
}

interface WorkshopUser {
  id: string;
  fullName: string | null;
  email: string;
}

export function NewProductionJobForm({
  products,
  workshopUsers,
  preselectedProductId,
}: {
  products: Product[];
  workshopUsers: WorkshopUser[];
  preselectedProductId: string;
}) {
  const [productId, setProductId] = useState(preselectedProductId);
  const [metersSent, setMetersSent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedProduct = products.find((p) => p.id === productId);
  const stock = selectedProduct ? parseFloat(selectedProduct.fabricStockMeters ?? "0") : null;
  const meters = parseFloat(metersSent) || null;
  const stockError =
    stock !== null && meters !== null && meters > stock
      ? `Not enough fabric. Available: ${stock.toFixed(2)} m.`
      : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (stockError) {
      setError(stockError);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createProductionJob(new FormData(e.currentTarget));
      window.location.href = "/production";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 pt-2">
        <Link href="/production" className="text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
        <h1 className="text-xl font-semibold">New Production Job</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="productId">Product *</Label>
          <Select
            id="productId"
            name="productId"
            required
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Select a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>

        {selectedProduct && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fabric</span>
              <span className="font-medium">{selectedProduct.fabricName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available stock</span>
              <span
                className={`font-medium ${stock !== null && stock <= 0 ? "text-destructive" : ""}`}
              >
                {stock !== null ? `${stock.toFixed(2)} m` : "—"}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="metersSent">Meters sent *</Label>
          <Input
            id="metersSent"
            name="metersSent"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 50.00"
            required
            value={metersSent}
            onChange={(e) => setMetersSent(e.target.value)}
          />
          {stockError && <p className="text-xs text-destructive">{stockError}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="assignedTo">Assign to (optional)</Label>
          <Select id="assignedTo" name="assignedTo">
            <option value="">— Unassigned —</option>
            {workshopUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName ?? u.email}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={3} placeholder="Optional…" />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => { window.location.href = "/production"; }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={loading || !!stockError}>
            {loading ? "Saving…" : "Create job"}
          </Button>
        </div>
      </form>
    </div>
  );
}
