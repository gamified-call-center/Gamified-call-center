// src/components/ui/form/ControlShell.tsx
import { cn } from "@/Utils/common/cn";
import React from "react";

type ControlShellProps = {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function ControlShell({
  leftIcon,
  rightIcon,
  error,
  disabled,
  className,
  children,
}: ControlShellProps) {
  return (
    <div
      className={cn(
        "group relative flex w-full items-center gap-2 rounded-xl border bg-white px-3 py-2.5 shadow-sm transition",
        "border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200",
        " dark:border-slate-700 dark:focus-within:border-indigo-400 dark:focus-within:ring-indigo-900/40",
        disabled && "opacity-60 pointer-events-none",
        error &&
          "border-rose-300 focus-within:border-rose-500 focus-within:ring-rose-200 dark:border-rose-900/50 dark:focus-within:ring-rose-900/40",
        className
      )}
    >
      {leftIcon ? <div className="text-slate-400">{leftIcon}</div> : null}
      <div className="min-w-0 flex-1">{children}</div>
      {rightIcon ? <div className="text-slate-400">{rightIcon}</div> : null}
    </div>
  );
}
