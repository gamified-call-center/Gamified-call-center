// src/components/ui/form/Field.tsx
import { cn } from "@/Utils/common/cn";
import React from "react";

type FieldProps = {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  sublabel?: string;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
};

export function Field({
  label,
  required,
  hint,
  error,
  sublabel,
  className,
  labelClassName,
  children,
}: FieldProps) {
  return (
    <div className={cn("w-full", className)}>
      {(label || sublabel) && (
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {label && (
              <label
                className={cn("block text-sm  font-Gordita-Medium app-border", labelClassName)}
              >
                {label} {required ? <span className="text-rose-500">*</span> : null}
              </label>
            )}

            {sublabel ? (
              <p className="mt-0.5 text-xs app-muted">{sublabel}</p>
            ) : null}
          </div>
        </div>
      )}

      {children}

      {hint && !error ? (
        <p className="mt-1.5 text-xs app-muted">{hint}</p>
      ) : null}

      {error ? <p className="mt-1.5 text-xs text-rose-500">{error}</p> : null}
    </div>
  );
}

