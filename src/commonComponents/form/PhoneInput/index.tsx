import React, { forwardRef, useMemo } from "react";
import { Phone } from "lucide-react";
import { TextInput, TextInputProps } from "../TextInput";

function formatUSPhone(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    const a = digits.slice(0, 3);
    const b = digits.slice(3, 6);
    const c = digits.slice(6, 10);
    if (digits.length <= 3) return a;
    if (digits.length <= 6) return `(${a}) ${b}`;
    return `(${a}) ${b}-${c}`;
}

type PhoneInputProps = Omit<TextInputProps, "onChange" | "value"> & {
    value: string; // store raw or formatted, your choice
    onChange: (value: string) => void; // return digits only (recommended)
};

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
    function PhoneInput({ value, onChange, leftIcon, ...props }, ref) {
        const display = useMemo(() => formatUSPhone(value), [value]);

        return (
            <TextInput
                ref={ref}
                value={display}
                leftIcon={leftIcon ?? <Phone size={18} />}
                inputMode="tel"
                onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                    onChange(digits);
                }}
                {...props}
            />
        );
    }
);
