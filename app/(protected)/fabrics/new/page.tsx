"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createFabric } from "@/lib/actions/fabrics";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

export default function NewFabricPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // createFabric returns void — throw = failure, clean return = success.
      await createFabric(new FormData(e.currentTarget));
      console.log("[NewFabricPage] action succeeded, navigating");
      window.location.href = "/fabrics";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      console.error("[NewFabricPage] error:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 pt-2">
        <Link href="/fabrics" className="text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
        <h1 className="text-xl font-semibold">Add Fabric</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Fabric name *</Label>
          <Input id="name" name="name" placeholder="e.g. Black Nida" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="color">Color *</Label>
          <Input id="color" name="color" placeholder="e.g. Black" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="supplier">Supplier</Label>
          <Input id="supplier" name="supplier" placeholder="e.g. Al Rahma Textiles" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reorderThreshold">Reorder threshold (meters)</Label>
          <Input
            id="reorderThreshold"
            name="reorderThreshold"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            defaultValue="0"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={3} placeholder="Optional notes…" />
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
            {loading ? "Saving…" : "Save fabric"}
          </Button>
        </div>
      </form>
    </div>
  );
}
