// src/components/ui/form/MultiSelect.tsx
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { ControlShell } from "../ControlShell";
import { cn } from "@/Utils/common/cn";
import type { SelectOption } from "../SingleSelect";

type DropdownPlacement = "auto" | "top" | "bottom";

type MultiSelectProps = {
  values: string[];
  onChange: (values: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  leftIcon?: React.ReactNode;
  placement?: DropdownPlacement;
};

export function MultiSelect({
  values,
  onChange,
  options,
  placeholder = "Select options",
  disabled,
  error,
  leftIcon,
  placement = "auto",
}: MultiSelectProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  // only used when placement="auto"
  const [autoDir, setAutoDir] = useState<"top" | "bottom">("bottom");

  const selectedOptions = useMemo(
    () => options.filter((o) => values.includes(o.value)),
    [options, values]
  );

  // final direction (NO derived-state effect needed)
  const dir: "top" | "bottom" = placement === "auto" ? autoDir : placement;

  // close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // measure dropdown placement ONLY when open && placement === "auto"
  useLayoutEffect(() => {
    if (!open) return;
    if (placement !== "auto") return;

    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      const nextDir: "top" | "bottom" =
        spaceBelow < 280 && spaceAbove > spaceBelow ? "top" : "bottom";

      // update only if changed (prevents render churn)
      setAutoDir((prev) => (prev === nextDir ? prev : nextDir));
    };

    // measure now
    measure();

    // keep it correct on resize/scroll while open
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, placement]);

  function toggle(val: string) {
    if (values.includes(val)) onChange(values.filter((v) => v !== val));
    else onChange([...values, val]);
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((s) => !s)}
        className="w-full text-left"
      >
        <ControlShell
          leftIcon={leftIcon}
          rightIcon={
            <ChevronDown size={18} className={cn("transition", open && "rotate-180")} />
          }
          error={error}
          disabled={disabled}
        >
          <div className="flex flex-wrap items-center gap-2">
            {selectedOptions.length === 0 ? (
              <span className="text-sm text-slate-400">{placeholder}</span>
            ) : (
              selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs",
                    "border-slate-200 bg-slate-50 text-black",
                    "dark:border-slate-100 dark:bg-slate-100 "
                  )}
                >
                  <span className="max-w-[140px] truncate">{opt.label}</span>

                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange(values.filter((v) => v !== opt.value));
                    }}
                    className="rounded p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <X size={14} />
                  </span>
                </span>
              ))
            )}
          </div>
        </ControlShell>
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-lg",
            " dark:border-slate-700",
            dir === "top" && "bottom-full mb-2 mt-0"
          )}
        >
          <div className="max-h-72 overflow-auto p-1">
            {options.map((opt) => {
              const active = values.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => toggle(opt.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm",
                    "hover:bg-slate-100 dark:hover:bg-slate-800",
                    opt.disabled && "opacity-50 pointer-events-none",
                    active &&
                    "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {active ? <span className="text-xs">Selected</span> : null}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 border-t p-2 dark:border-slate-700">
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
              onClick={() => onChange([])}
            >
              Clear
            </button>
            <button
              type="button"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
              onClick={() => setOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
