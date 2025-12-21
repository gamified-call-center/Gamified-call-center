import React, { forwardRef } from "react";
import { TextInput, TextInputProps } from "../TextInput";

type NumberInputProps = Omit<TextInputProps, "type" | "onKeyDown"> & {
  allowDecimal?: boolean;
  allowNegative?: boolean;
};

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput({ allowDecimal, allowNegative, ...props }, ref) {
    return (
      <TextInput
        ref={ref}
        inputMode="numeric"
        type="text"
        onKeyDown={(e) => {
          const k = e.key;
          const allowed =
            k === "Backspace" ||
            k === "Tab" ||
            k === "Enter" ||
            k === "ArrowLeft" ||
            k === "ArrowRight" ||
            /^[0-9]$/.test(k) ||
            (allowDecimal && k === ".") ||
            (allowNegative && k === "-");
          if (!allowed) e.preventDefault();
        }}
        {...props}
      />
    );
  }
);
