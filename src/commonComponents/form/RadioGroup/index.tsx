// src/components/ui/form/RadioGroup.tsx
import { cn } from "@/Utils/common/cn";
import React from "react";

type RadioOption = { label: string; value: string; hint?: string };

type RadioGroupProps = {
  value?: string;
  onChange: (v: string) => void;
  options: RadioOption[];
  name: string;
};

export function RadioGroup({ value, onChange, options, name }: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-xl border p-3",
            "border-slate-200 bg-white hover:bg-slate-50",
            "dark:border-slate-700  dark:hover:bg-slate-800",
            value === opt.value && "border-indigo-300 bg-indigo-50 dark:bg-indigo-950/20 dark:border-indigo-700/50"
          )}
        >
          <input
            type="radio"
            name={name}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-200"
          />
          <div>
            <div className="text-sm  font-Gordita-Medium text-slate-800 ">{opt.label}</div>
            {opt.hint ? <div className="text-xs text-slate-500 dark:text-slate-400">{opt.hint}</div> : null}
          </div>
        </label>
      ))}
    </div>
  );
}
