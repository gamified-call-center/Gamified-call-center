"use client";

import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;

  onFocus?: () => void;
  onBlur?: () => void;
  onResetPage?: () => void;

  className?: string;
  inputClassName?: string;
  iconClassName?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  onFocus,
  onBlur,
  onResetPage,
  className = "",
  inputClassName = "",
  iconClassName = "",
}: SearchBarProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <Search
        className={[
          "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10",
          "text-gray-500",
          iconClassName,
        ].join(" ")}
      />

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          onResetPage?.();
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        className={[
          "w-full pl-12 pr-4 py-1 bg-white/80 backdrop-blur-sm",
          "border-2 border-gray-200/60 rounded-xl outline-none",
          "focus:ring-3 focus:ring-blue-500/20 placeholder:text-[14px] focus:border-blue-400/60",
          "shadow-sm hover:shadow transition-all duration-300",
          "text-gray-800 placeholder-gray-400",
          inputClassName,
        ].join(" ")}
      />
    </div>
  );
}
