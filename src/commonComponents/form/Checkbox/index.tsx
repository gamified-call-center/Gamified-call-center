// src/components/ui/form/Checkbox.tsx
import { cn } from "@/Utils/common/cn";
import React from "react";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        {...props}
        className={cn(
          "h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200",
          "dark:border-slate-600 ",
          className
        )}
      />
      {label ? <span className="text-sm text-slate-700 ">{label}</span> : null}
    </label>
  );
}
