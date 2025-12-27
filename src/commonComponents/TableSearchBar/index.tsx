import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/Utils/common/cn";

type DateRange = { from: string; to: string };

type TableToolbarProps = {
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
    widthClassName?: string;
  };
  dateRange?: {
    value: DateRange;
    onChange: (value: DateRange) => void;
    min?: string;
    max?: string;
    label?: string;
  };
  filtersSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    () => search?.widthClassName ?? "min-w-full",
    [search?.widthClassName]
  );
  const searchWidthClass = dateRange ? "md:w-[55%] w-full" : "md:w-full w-full";


  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center w-full border-[2px] border-gray-400 dark:border-gray-200 rounded-xl">
     {search ? (
  <div
    className={cn(
      "flex items-center justify-between gap-2 rounded-xl px-3 py-1 md:py-[6px] app-input",
     dateRange ? "md:w-1/2 w-full" : "w-full"

    )}
  >
    <input
      value={localSearch}
      onChange={(e) => setLocalSearch(e.target.value)}
      placeholder={search.placeholder ?? "Search..."}
      className="w-full bg-transparent text-sm outline-none app-text"
    />
  </div>
) : null}



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
