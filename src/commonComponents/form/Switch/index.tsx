// src/components/ui/form/Switch.tsx
import { cn } from "@/Utils/common/cn";
import React from "react";

type SwitchProps = {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
};

export function Switch({ checked, onChange, disabled, label }: SwitchProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      {label ? <span className="text-sm text-slate-700 ">{label}</span> : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full transition",
          checked ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700",
          disabled && "opacity-60 pointer-events-none"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition",
            checked ? "left-5" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}
