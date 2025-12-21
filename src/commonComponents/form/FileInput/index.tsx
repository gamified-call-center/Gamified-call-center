// src/components/ui/form/FileInput.tsx
import React, { forwardRef } from "react";
import { Upload } from "lucide-react";
import { ControlShell } from "../ControlShell";
import { cn } from "@/Utils/common/cn";

type FileInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
  leftIcon?: React.ReactNode;
};

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  function FileInput({ error, leftIcon, disabled, className, ...props }, ref) {
    return (
      <ControlShell
        leftIcon={leftIcon ?? <Upload size={18} />}
        error={error}
        disabled={disabled}
        className={className}
      >
        <input
          ref={ref}
          type="file"
          disabled={disabled}
          {...props}
          className={cn(
            "w-full text-sm  file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200",
            "dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-slate-200 dark:hover:file:bg-slate-700"
          )}
        />
      </ControlShell>
    );
  }
);
