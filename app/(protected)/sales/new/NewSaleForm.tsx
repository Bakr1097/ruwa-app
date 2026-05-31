"use client";
import { useState } from "react";
import Link from "next/link";
import { createSale } from "@/lib/actions/sales";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

interface Product {
  id: string;
  name: string;
  sellingPrice: string;
}

interface Variant {
  id: string;
  productId: string;
  size: string | null;
  color: string | null;
  finishedStockQty: number;
  avgFinishedCost: string;
}

interface LineItem {
  key: number;
  productId: string;
  variantId: string;
  qty: number;
}

const PAYMENT_METHODS = [
  { value: "COD", label: "Cash on Delivery (COD)" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "easypaisa", label: "Easypaisa" },
];

export function NewSaleForm({
  products,
  variants,
}: {
  products: Product[];
  variants: Variant[];
}) {
  const [lines, setLines] = useState<LineItem[]>([{ key: 0, productId: "", variantId: "", qty: 1 }]);
  const [nextKey, setNextKey] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const variantsForProduct = (productId: string) =>
    variants.filter((v) => v.productId === productId);

  const getVariant = (variantId: string) => variants.find((v) => v.id === variantId);
  const getProduct = (productId: string) => products.find((p) => p.id === productId);

  const updateLine = (
    i: number,
    field: "productId" | "variantId" | "qty",
    value: string | number
  ) => {
    setLines((prev) =>
      prev.map((line, idx) => {
        if (idx !== i) return line;
        if (field === "productId") return { ...line, productId: value as string, variantId: "", qty: 1 };
        if (field === "variantId") return { ...line, variantId: value as string, qty: 1 };
        return { ...line, qty: value as number };
      })
    );
  };

  const addLine = () => {
    setLines((prev) => [...prev, { key: nextKey, productId: "", variantId: "", qty: 1 }]);
    setNextKey((k) => k + 1);
  };

  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));

  // Per-line validation errors
  const lineErrors = lines.map((line) => {
    if (!line.variantId) return null;
    const variant = getVariant(line.variantId);
    if (!variant) return null;
    if (line.qty < 1) return "Qty must be at least 1.";
    if (line.qty > variant.finishedStockQty)
      return `Only ${variant.finishedStockQty} in stock.`;
    return null;
  });

  const hasLineErrors = lineErrors.some((e) => e !== null);

  const totalRevenue = lines.reduce((sum, line) => {
    if (!line.variantId || !line.productId) return sum;
    const product = getProduct(line.productId);
    if (!product) return sum;
    return sum + line.qty * parseFloat(product.sellingPrice);
  }, 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (hasLineErrors) {
      setError("Fix the errors in the line items above.");
      return;
    }
    const validLines = lines.filter((l) => l.variantId && l.qty > 0);
    if (!validLines.length) {
      setError("Add at least one item.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set(
        "linesJson",
        JSON.stringify(validLines.map((l) => ({ variantId: l.variantId, qty: l.qty })))
      );
      await createSale(fd);
      window.location.href = "/sales";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 pt-2">
        <Link href="/sales" className="text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
        <h1 className="text-xl font-semibold">New Sale</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Line items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Items *</Label>
            <Button type="button" variant="ghost" size="sm" onClick={addLine}>
              + Add item
            </Button>
          </div>

          {lines.map((line, i) => {
            const productVariantsForLine = variantsForProduct(line.productId);
            const selectedVariant = getVariant(line.variantId);
            const selectedProduct = getProduct(line.productId);
            const lineError = lineErrors[i];

            return (
              <div
                key={line.key}
                className="rounded-lg border border-border p-3 space-y-3"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-normal">Product</Label>
                    <Select
                      value={line.productId}
                      onChange={(e) => updateLine(i, "productId", e.target.value)}
                    >
                      <option value="">Select product…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(i)}
                      className="mt-6 h-10 px-2 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {line.productId && (
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-normal">Variant</Label>
                      <Select
                        value={line.variantId}
                        onChange={(e) => updateLine(i, "variantId", e.target.value)}
                      >
                        <option value="">Select variant…</option>
                        {productVariantsForLine.map((v) => {
                          const label = [v.color, v.size].filter(Boolean).join(" / ") || "Default";
                          const outOfStock = v.finishedStockQty === 0;
                          return (
                            <option key={v.id} value={v.id} disabled={outOfStock}>
                              {label}
                              {outOfStock ? " (Out of stock)" : ""}
                            </option>
                          );
                        })}
                      </Select>
                    </div>
                    <div className="w-24 space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-normal">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        max={selectedVariant?.finishedStockQty ?? 1}
                        value={line.qty}
                        onChange={(e) =>
                          updateLine(i, "qty", parseInt(e.target.value) || 1)
                        }
                      />
                    </div>
                  </div>
                )}

                {selectedVariant && selectedProduct && (
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>
                      Stock:{" "}
                      <span
                        className={`font-medium ${selectedVariant.finishedStockQty === 0 ? "text-destructive" : "text-foreground"}`}
                      >
                        {selectedVariant.finishedStockQty}
                      </span>
                    </span>
                    <span>
                      Price:{" "}
                      <span className="font-medium text-foreground">
                        {parseFloat(selectedProduct.sellingPrice).toFixed(2)} PKR
                      </span>
                    </span>
                  </div>
                )}

                {lineError && <p className="text-xs text-destructive">{lineError}</p>}
              </div>
            );
          })}
        </div>

        {/* Live revenue preview */}
        {totalRevenue > 0 && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total revenue</span>
              <span className="font-semibold">{totalRevenue.toFixed(2)} PKR</span>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="paymentMethod">Payment method *</Label>
          <Select id="paymentMethod" name="paymentMethod" required>
            <option value="">Select…</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="customerNote">Customer note</Label>
          <Textarea id="customerNote" name="customerNote" rows={2} placeholder="Optional…" />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => { window.location.href = "/sales"; }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={loading || hasLineErrors}>
            {loading ? "Saving…" : "Record sale"}
          </Button>
        </div>
      </form>
    </div>
  );
}
