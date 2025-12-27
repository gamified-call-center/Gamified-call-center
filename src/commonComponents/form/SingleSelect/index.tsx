// src/components/ui/form/SingleSelect.tsx
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { ControlShell } from "../ControlShell";
import { cn } from "@/Utils/common/cn";

export type SelectOption = { label: string; value: string; disabled?: boolean };

type DropdownPlacement = "auto" | "top" | "bottom";

type SingleSelectProps = {
  value?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  leftIcon?: React.ReactNode;
  placement?: DropdownPlacement;

  // upgrades
  searchable?: boolean;
  searchPlaceholder?: string;
  noResultsText?: string;
};

export function SingleSelect({
  value,
  onChange,
  options,
  placeholder = "Select",
  disabled,
  error,
  leftIcon,
  placement = "auto",
  searchable = false,
  searchPlaceholder = "Search...",
  noResultsText = "No results",
}: SingleSelectProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);

  // only for placement="auto"
  const [autoDir, setAutoDir] = useState<"top" | "bottom">("bottom");

  // keyboard highlight index
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // optional search
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  // derived final dropdown direction
  const dir: "top" | "bottom" = placement === "auto" ? autoDir : placement;

  const filteredOptions = useMemo(() => {
    if (!searchable) return options;
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  // close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // measure auto placement only when open + placement auto
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

      setAutoDir((prev) => (prev === nextDir ? prev : nextDir));
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, placement]);

  // reset keyboard/search states when opening/closing
  useEffect(() => {
    if (!open) {
      setActiveIndex(-1);
      setQuery("");
      return;
    }

    // when opened, start highlight at selected item if possible
    const idx = filteredOptions.findIndex((o) => o.value === value && !o.disabled);
    setActiveIndex(idx >= 0 ? idx : firstEnabledIndex(filteredOptions));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // keyboard handling (Escape / Arrow / Enter)
  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;

    if (e.key === "Escape") {
      setOpen(false);
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      // if closed, open
      if (!open) {
        e.preventDefault();
        setOpen(true);
        return;
      }

      // if open, select active
      e.preventDefault();
      const opt = filteredOptions[activeIndex];
      if (opt && !opt.disabled) {
        onChange(opt.value);
        setOpen(false);
      }
      return;
    }

    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => nextEnabledIndex(filteredOptions, prev, +1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => nextEnabledIndex(filteredOptions, prev, -1));
      return;
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((s) => !s)}
        onKeyDown={onKeyDown}
        className="w-full text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <ControlShell
          leftIcon={leftIcon}
          rightIcon={<ChevronDown size={18} className={cn("transition", open && "rotate-180")} />}
          error={error}
          disabled={disabled}
        >
          <div className={cn("text-sm", selected ? "app-text " : "app-muted")}>
            {selected?.label ?? placeholder}
          </div>
        </ControlShell>
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-[999] mt-2 w-full overflow-hidden rounded-xl border app-surface shadow-lg",
            " dark:border-slate-700",
            dir === "top" && "bottom-full mb-2 mt-0"
          )}
          role="listbox"
        >
          {searchable && (
            <div className="border-b p-2 dark:border-slate-700">
              <div className="flex items-center gap-2 rounded-lg border px-2 py-1.5 dark:border-slate-700">
                <Search size={16} className="app-text" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-sm outline-none app-text placeholder:app-muted "
                  onKeyDown={(e) => {
                    // keep arrow nav working even inside search input
                    if (e.key === "ArrowDown" || e.key === "ArrowUp") onKeyDown(e as any);
                    if (e.key === "Escape") setOpen(false);
                  }}
                />
              </div>
            </div>
          )}

          <div className="max-h-72 overflow-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm app-text z-[999]
">{noResultsText}</div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isActive = idx === activeIndex;

                return (
                  <button
  key={opt.value}
  type="button"
  disabled={opt.disabled}
  onMouseEnter={() => setActiveIndex(idx)}
  onClick={() => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
  }}
  className={cn(
    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm",
    "hover:app-surface",
    opt.disabled && "opacity-50 pointer-events-none",
    isActive && "app-card",
    isSelected && "app-surface text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
  )}
  role="option"
  aria-selected={isSelected}
>
  <span className="truncate app-text">{opt.label}</span>
</button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Helpers */
function firstEnabledIndex(opts: SelectOption[]) {
  return opts.findIndex((o) => !o.disabled);
}

function nextEnabledIndex(opts: SelectOption[], current: number, step: 1 | -1) {
  if (opts.length === 0) return -1;

  let i = current;
  for (let tries = 0; tries < opts.length; tries++) {
    i = i + step;
    if (i >= opts.length) i = 0;
    if (i < 0) i = opts.length - 1;
    if (!opts[i]?.disabled) return i;
  }
  return current;
}
