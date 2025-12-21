import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { TextInput, TextInputProps } from "../TextInput";

export const PasswordInput = forwardRef<HTMLInputElement, Omit<TextInputProps, "type" | "rightIcon">>(
  function PasswordInput(props, ref) {
    const [show, setShow] = useState(false);

    return (
      <TextInput
        ref={ref}
        type={show ? "text" : "password"}
        rightIcon={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="rounded-md p-1 text-slate-400 hover: dark:hover:text-slate-200"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
        {...props}
      />
    );
  }
);
