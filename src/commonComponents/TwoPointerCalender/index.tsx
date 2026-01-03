"use client";

import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

type DraftRange = {
  from: Date | null;
  to: Date | null;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODateOnly(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function fromISODateOnly(s: string) {
  // interpret as local date
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export default function SimpleFromToPicker({
  value,
  onChange,
  onApply,
  canApply,
  label,
}: {
  value: DraftRange;
  onChange: (next: DraftRange) => void;
  onApply: () => void;
  canApply: boolean;
  label?: string;
}) {
  const fromVal = value.from ? toISODateOnly(value.from) : "";
  const toVal = value.to ? toISODateOnly(value.to) : "";

  return (
    <div className="flex flex-wrap items-end gap-2">
      {label ? (
        <div className="w-full text-xs font-semibold app-muted">{label}</div>
      ) : null}

      <div className="flex items-center gap-2 rounded-xl border app-border bg-white px-3 py-2 shadow-sm">
        <CalendarIcon className="h-4 w-4 text-slate-600" />
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-slate-500">From</span>
          <input
            type="date"
            value={fromVal}
            onChange={(e) => onChange({ from: e.target.value ? fromISODateOnly(e.target.value) : null, to: value.to })}
            className="text-xs font-semibold text-slate-800 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-slate-500">To</span>
          <input
            type="date"
            value={toVal}
            min={fromVal || undefined} // prevents choosing before from
            onChange={(e) => onChange({ from: value.from, to: e.target.value ? fromISODateOnly(e.target.value) : null })}
            className="text-xs font-semibold text-slate-800 outline-none"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={!canApply}
        onClick={onApply}
        className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
          canApply
            ? "border-slate-200 bg-slate-900 text-white hover:bg-slate-800"
            : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        Apply
      </button>
    </div>
  );
}
