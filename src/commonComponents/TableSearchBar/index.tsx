// src/components/common/TableToolbar.tsx
import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/Utils/common/cn";

type DateRange = { from: string; to: string };

type TableToolbarProps = {
  // Search
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
    widthClassName?: string; // ex: "w-72"
  };

  // Date Range (optional)
  dateRange?: {
    value: DateRange;
    onChange: (value: DateRange) => void;
    min?: string;
    max?: string;
    label?: string; // optional label text
  };

  // Optional filters block (custom JSX: selects, toggles, chips etc.)
  filtersSlot?: React.ReactNode;

  // Right action buttons block
  actionsSlot?: React.ReactNode;

  // Layout / styling
  className?: string;
};

export default function TableToolbar({
  search,
  dateRange,
  filtersSlot,
  actionsSlot,
  className,
}: TableToolbarProps) {
  // debounce search locally (so parent doesn't refetch on every keypress)
  const [localSearch, setLocalSearch] = useState(search?.value ?? "");
  useEffect(() => {
    setLocalSearch(search?.value ?? "");
  }, [search?.value]);

  const debounceMs = search?.debounceMs ?? 350;

  useEffect(() => {
    if (!search) return;
    const t = setTimeout(() => {
      if (localSearch !== search.value) search.onChange(localSearch);
    }, debounceMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch, debounceMs]);

  const searchWidth = useMemo(() => search?.widthClassName ?? "w-72", [search?.widthClassName]);

  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      {/* Left */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {search ? (
          <div className={cn("flex items-center gap-2 rounded-xl border bg-white px-3 py-2",
            " dark:border-slate-700", searchWidth)}
          >
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={search.placeholder ?? "Search..."}
              className="w-full bg-transparent text-sm outline-none text-slate-900 "
            />
            <span className="text-slate-400">⌕</span>
          </div>
        ) : null}

        {dateRange ? (
          <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2  dark:border-slate-700">
            {dateRange.label ? (
              <span className="text-xs text-slate-500 dark:text-slate-400">{dateRange.label}</span>
            ) : null}

            <input
              type="date"
              value={dateRange.value.from}
              min={dateRange.min}
              max={dateRange.max}
              onChange={(e) => dateRange.onChange({ ...dateRange.value, from: e.target.value })}
              className="bg-transparent text-sm outline-none text-slate-900 "
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={dateRange.value.to}
              min={dateRange.min}
              max={dateRange.max}
              onChange={(e) => dateRange.onChange({ ...dateRange.value, to: e.target.value })}
              className="bg-transparent text-sm outline-none text-slate-900 "
            />
          </div>
        ) : null}

        {filtersSlot ? <div className="flex flex-wrap items-center gap-2">{filtersSlot}</div> : null}
      </div>

      {/* Right */}
      {actionsSlot ? <div className="flex items-center gap-2 justify-end">{actionsSlot}</div> : null}
    </div>
  );
}
