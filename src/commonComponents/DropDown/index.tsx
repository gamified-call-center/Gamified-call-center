"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Check } from "lucide-react";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type SelectOption = {
  value: string;
  label: string;
};

type CommonSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  minWidth?: number | string;
  disabled?: boolean;
  className?: string;
  labelText?: string; // optional: "Select Agent"
};

type MenuPos = {
  top: number;
  left: number;
  width: number;
};

export default function CommonSelect({
  value,
  onChange,
  options,
  placeholder = "Select option",
  minWidth = 240,
  disabled = false,
  className = "",
  labelText = "Select Agent",
}: CommonSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  useEffect(() => setMounted(true), []);

  const close = () => setIsOpen(false);

  const handleSelect = (val: string) => {
    onChange(val);
    close();
  };

  const updateMenuPosition = () => {
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const gap = 8;

    setMenuPos({
      top: rect.bottom + gap,
      left: rect.left,
      width: rect.width,
    });
  };

  // Position menu whenever it opens
  useLayoutEffect(() => {
    if (!isOpen) return;
    updateMenuPosition();
  }, [isOpen, value, options.length]);

  // Reposition on scroll/resize while open (scroll can happen on parents too)
  useEffect(() => {
    if (!isOpen) return;

    const onReflow = () => updateMenuPosition();

    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true); // capture scroll from nested containers

    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [isOpen]);

  // Close on outside click / escape
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      // If click is inside the button/container, ignore
      if (containerRef.current?.contains(target)) return;
      close();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ minWidth }}>
      {/* Trigger */}
      <motion.button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((v) => !v);
        }}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        className={`
          relative z-10 w-full rounded-xl border-2 transition-all duration-200
          ${disabled
            ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-70"
            : "bg-white border-blue-100 hover:border-blue-300 hover:shadow-lg cursor-pointer"
          }
          ${isOpen ? "border-blue-400 shadow-lg ring-2 ring-blue-100" : ""}
          shadow-md
        `}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className={`
                flex items-center justify-center w-8 h-8 rounded-lg
                ${disabled ? "bg-gray-200" : "bg-gradient-to-br from-blue-50 to-indigo-50"}
              `}
            >
              <Sparkles className={`w-4 h-4 ${disabled ? "text-gray-400" : "text-blue-500"}`} />
            </div>

            <div className="text-left">
              <div className={`text-xs font-medium ${disabled ? "text-gray-400" : "text-gray-500"}`}>
                {labelText}
              </div>
              <div className={`font-semibold ${selectedOption ? "text-gray-900" : "text-gray-400"}`}>
                {selectedOption?.label || placeholder}
              </div>
            </div>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className={disabled ? "text-gray-400" : "text-blue-500"}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>

        {!disabled && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-400 to-indigo-400 rounded-b-xl"
            initial={false}
            animate={isOpen ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.button>

      {/* Menu in Portal (escapes overflow-hidden parents) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && !disabled && menuPos && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0"
                  style={{ zIndex: 9998 }}
                  onClick={close}
                />

                {/* Dropdown */}
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="fixed"
                  style={{
                    top: menuPos.top,
                    left: menuPos.left,
                    width: menuPos.width,
                    zIndex: 9999,
                  }}
                >
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          Available Agents
                        </span>
                        <span className="ml-auto text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                          {options.length} options
                        </span>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="max-h-60 overflow-y-auto py-1">
                      {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.06)" }}
                            className={`
                              relative w-full px-4 py-3 text-left flex items-center justify-between
                              transition-colors duration-150
                              ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}
                              ${isSelected ? "font-medium" : "font-normal"}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`
                                  w-2 h-2 rounded-full
                                  ${isSelected
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                                    : "bg-gray-300"
                                  }
                                `}
                              />
                              <span className={isSelected ? "text-blue-700" : "text-gray-700"}>
                                {option.label}
                              </span>
                            </div>

                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-blue-500"
                              >
                                <Check className="w-4 h-4" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    {value && (
                      <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
                        <button
                          type="button"
                          onClick={() => handleSelect("")}
                          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Clear selection
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
