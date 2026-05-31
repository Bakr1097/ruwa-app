"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { logPurchase } from "@/lib/actions/purchases";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function LogPurchasePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("fabricId", params.id);
      await logPurchase(formData);
      window.location.href = `/fabrics/${params.id}`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 pt-2">
        <Link
          href={`/fabrics/${params.id}`}
          className="text-muted-foreground hover:text-foreground"
        >
          ← Back
        </Link>
        <h1 className="text-xl font-semibold">Log Purchase</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="meters">Meters purchased *</Label>
          <Input
            id="meters"
            name="meters"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 20"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="costPerMeter">Cost per meter *</Label>
          <Input
            id="costPerMeter"
            name="costPerMeter"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 25.00"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="purchaseDate">Purchase date *</Label>
          <Input
            id="purchaseDate"
            name="purchaseDate"
            type="date"
            defaultValue={today}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="supplier">Supplier</Label>
          <Input
            id="supplier"
            name="supplier"
            placeholder="e.g. Al Rahma Textiles"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="note">Note</Label>
          <Input id="note" name="note" placeholder="Optional note…" />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? "Saving…" : "Log purchase"}
          </Button>
        </div>
      </form>
    </div>
  );
}
