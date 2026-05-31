"use client";
import { useState } from "react";
import Link from "next/link";
import { createProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";

interface Fabric {
  id: string;
  name: string;
  avgCostPerMeter: string | null;
}

interface Variant {
  size: string;
  color: string;
  finishedStockQty: number;
}

export function NewProductForm({ fabrics }: { fabrics: Fabric[] }) {
  const [fabricId, setFabricId] = useState("");
  const [metersPerPiece, setMetersPerPiece] = useState("");
  const [stitchingCost, setStitchingCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [variants, setVariants] = useState<Variant[]>([{ size: "", color: "", finishedStockQty: 0 }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedFabric = fabrics.find((f) => f.id === fabricId);
  const avgCostPerMeter = selectedFabric ? parseFloat(selectedFabric.avgCostPerMeter ?? "0") : null;
  const meters = parseFloat(metersPerPiece) || null;
  const stitching = parseFloat(stitchingCost) || null;
  const selling = parseFloat(sellingPrice) || null;

  const fabricCostPerPiece =
    avgCostPerMeter !== null && meters !== null ? avgCostPerMeter * meters : null;
  const totalCostPerPiece =
    fabricCostPerPiece !== null && stitching !== null ? fabricCostPerPiece + stitching : null;
  const margin =
    totalCostPerPiece !== null && selling !== null ? selling - totalCostPerPiece : null;
  const marginPct =
    margin !== null && selling !== null && selling > 0 ? (margin / selling) * 100 : null;

  const addVariant = () =>
    setVariants((v) => [...v, { size: "", color: "", finishedStockQty: 0 }]);

  const removeVariant = (i: number) =>
    setVariants((v) => v.filter((_, idx) => idx !== i));

  const updateVariant = (i: number, field: keyof Variant, value: string | number) =>
    setVariants((v) => v.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (variants.length === 0) {
      setError("At least one variant is required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("variants", JSON.stringify(variants));
      await createProduct(fd);
      window.location.href = "/products";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 pt-2">
        <Link href="/products" className="text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
        <h1 className="text-xl font-semibold">Add Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Product name *</Label>
          <Input id="name" name="name" placeholder="e.g. Classic Abaya" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Select id="category" name="category">
            <option value="">Select…</option>
            <option value="Abayas">Abayas</option>
            <option value="Cord Sets">Cord Sets</option>
            <option value="Stoles">Stoles</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={2} placeholder="Optional…" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sellingPrice">Selling price (PKR) *</Label>
          <Input
            id="sellingPrice"
            name="sellingPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 350.00"
            required
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fabricId">Fabric *</Label>
          <Select
            id="fabricId"
            name="fabricId"
            required
            value={fabricId}
            onChange={(e) => setFabricId(e.target.value)}
          >
            <option value="">Select a fabric…</option>
            {fabrics.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({parseFloat(f.avgCostPerMeter ?? "0").toFixed(2)}/m)
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="metersPerPiece">Meters per piece *</Label>
          <Input
            id="metersPerPiece"
            name="metersPerPiece"
            type="number"
            min="0.001"
            step="0.001"
            placeholder="e.g. 2.5"
            required
            value={metersPerPiece}
            onChange={(e) => setMetersPerPiece(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="stitchingCostPerPiece">Stitching cost per piece (PKR) *</Label>
          <Input
            id="stitchingCostPerPiece"
            name="stitchingCostPerPiece"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 45.00"
            required
            value={stitchingCost}
            onChange={(e) => setStitchingCost(e.target.value)}
          />
        </div>

        {/* Live cost preview */}
        {fabricCostPerPiece !== null && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fabric cost/piece</span>
              <span className="font-medium">{fabricCostPerPiece.toFixed(2)} PKR</span>
            </div>
            {totalCostPerPiece !== null && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total cost/piece</span>
                  <span className="font-medium">{totalCostPerPiece.toFixed(2)} PKR</span>
                </div>
                {margin !== null && marginPct !== null && (
                  <div className="flex justify-between border-t border-border pt-1.5">
                    <span className="text-muted-foreground">Margin</span>
                    <span
                      className={`font-semibold ${margin >= 0 ? "text-foreground" : "text-destructive"}`}
                    >
                      {margin.toFixed(2)} PKR ({marginPct.toFixed(1)}%)
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Variants */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Variants *</Label>
            <Button type="button" variant="ghost" size="sm" onClick={addVariant}>
              + Add row
            </Button>
          </div>

          {variants.map((v, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground font-normal">Size</Label>
                <Select
                  value={v.size}
                  onChange={(e) => updateVariant(i, "size", e.target.value)}
                >
                  <option value="">—</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="Free Size">Free Size</option>
                </Select>
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-muted-foreground font-normal">Color</Label>
                <Input
                  placeholder="e.g. Black"
                  value={v.color}
                  onChange={(e) => updateVariant(i, "color", e.target.value)}
                />
              </div>
              <div className="w-20 space-y-1">
                <Label className="text-xs text-muted-foreground font-normal">Qty</Label>
                <Input
                  type="number"
                  min="0"
                  value={v.finishedStockQty}
                  onChange={(e) =>
                    updateVariant(i, "finishedStockQty", parseInt(e.target.value) || 0)
                  }
                />
              </div>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="h-10 px-2 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove variant"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => { window.location.href = "/products"; }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? "Saving…" : "Save product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
