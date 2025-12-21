// src/components/ui/form/DateInput.tsx
import React, { forwardRef } from "react";
import { Calendar } from "lucide-react";
import { TextInput, TextInputProps } from "../TextInput";

export const DateInput = forwardRef<HTMLInputElement, Omit<TextInputProps, "type">>(
  function DateInput(props, ref) {
    return <TextInput ref={ref} type="date" leftIcon={<Calendar size={18} />} {...props} />;
  }
);
