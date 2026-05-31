"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function toDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getThisWeek() {
  const now = new Date();
  const day = now.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysFromMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: toDateStr(monday), to: toDateStr(sunday) };
}

function getThisMonth() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: toDateStr(first), to: toDateStr(last) };
}

function getThisYear() {
  const year = new Date().getFullYear();
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

export function DateFilter({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);

  const navigate = (f: string, t: string) => {
    router.push(`/dashboard?from=${f}&to=${t}`);
  };

  const applyCustom = () => {
    if (customFrom && customTo && customFrom <= customTo) {
      navigate(customFrom, customTo);
    }
  };

  const week = getThisWeek();
  const month = getThisMonth();
  const year = getThisYear();

  const isPreset = (f: string, t: string) => from === f && to === t;

  return (
    <div className="space-y-3">
      {/* Preset buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={isPreset(week.from, week.to) ? "default" : "secondary"}
          onClick={() => navigate(week.from, week.to)}
          className="flex-1"
        >
          This Week
        </Button>
        <Button
          size="sm"
          variant={isPreset(month.from, month.to) ? "default" : "secondary"}
          onClick={() => navigate(month.from, month.to)}
          className="flex-1"
        >
          This Month
        </Button>
        <Button
          size="sm"
          variant={isPreset(year.from, year.to) ? "default" : "secondary"}
          onClick={() => navigate(year.from, year.to)}
          className="flex-1"
        >
          This Year
        </Button>
      </div>

      {/* Custom range */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 space-y-1">
          <p className="text-xs text-muted-foreground">From</p>
          <Input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-xs text-muted-foreground">To</p>
          <Input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
          />
        </div>
        <Button size="sm" variant="secondary" onClick={applyCustom}>
          Apply
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing: {from} → {to}
      </p>
    </div>
  );
}
