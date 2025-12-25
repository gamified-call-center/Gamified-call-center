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
  }, [localSearch, debounceMs]); // eslint-disable-line

  const searchWidth = useMemo(
    () => search?.widthClassName ?? "w-72",
    [search?.widthClassName]
  );

  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      {/* LEFT */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Search */}
        {search ? (
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2 border dark:border-white app-input",
              searchWidth
            )}
          >
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={search.placeholder ?? "Search..."}
              className="w-full bg-transparent text-sm outline-none app-text"
            />
            <span className="app-muted text-sm">⌕</span>
          </div>
        ) : null}

        {/* Date Range */}
        {dateRange ? (
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 border dark:border-white app-input">
            {dateRange.label ? (
              <span className="text-xs app-muted">{dateRange.label}</span>
            ) : null}

            <input
              type="date"
              value={dateRange.value.from}
              min={dateRange.min}
              max={dateRange.max}
              onChange={(e) =>
                dateRange.onChange({
                  ...dateRange.value,
                  from: e.target.value,
                })
              }
              className="bg-transparent text-sm outline-none app-text"
            />

            <span className="app-muted text-sm">to</span>

            <input
              type="date"
              value={dateRange.value.to}
              min={dateRange.min}
              max={dateRange.max}
              onChange={(e) =>
                dateRange.onChange({
                  ...dateRange.value,
                  to: e.target.value,
                })
              }
              className="bg-transparent text-sm outline-none app-text app-muted"
            />
          </div>
        ) : null}

        {/* Filters */}
        {filtersSlot ? (
          <div className="flex flex-wrap items-center gap-2">
            {filtersSlot}
          </div>
        ) : null}
      </div>

      {/* RIGHT */}
      {actionsSlot ? (
        <div className="flex items-center gap-2 justify-end">
          {actionsSlot}
        </div>
      ) : null}
    </div>
  );
}
