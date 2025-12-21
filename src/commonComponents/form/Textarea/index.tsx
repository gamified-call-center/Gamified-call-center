// src/components/ui/form/Textarea.tsx
import React, { forwardRef } from "react";
import { ControlShell } from "../ControlShell";
import { cn } from "@/Utils/common/cn";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  containerClassName?: string;
  textareaClassName?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { leftIcon, rightIcon, error, containerClassName, textareaClassName, disabled, ...props },
    ref
  ) {
    return (
      <ControlShell
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        error={error}
        disabled={disabled}
        className={containerClassName}
      >
        <textarea
          ref={ref}
          disabled={disabled}
          {...props}
          className={cn(
            "min-h-24 w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400",
            " dark:placeholder:text-slate-500",
            textareaClassName
          )}
        />
      </ControlShell>
    );
  }
);
