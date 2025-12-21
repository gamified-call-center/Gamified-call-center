"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type DropdownPosition = "top" | "bottom" | "left" | "right";

type DropdownProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: DropdownPosition;
  width?: string;
};

export default function Dropdown({
  trigger,
  children,
  position = "bottom",
  width = "w-48",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const positionClasses: Record<DropdownPosition, string> = {
    bottom: "top-full mt-2 left-0",
    top: "bottom-full mb-2 left-0",
    left: "right-full mr-2 top-0",
    right: "left-full ml-2 top-0",
  };

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={`absolute z-50 ${positionClasses[position]} ${width}
                      rounded-lg bg-white shadow-lg border border-slate-200
                      animate-in fade-in zoom-in-95`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
