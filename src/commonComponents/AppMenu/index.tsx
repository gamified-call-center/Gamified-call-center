"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, LayoutGrid, Pill, Calculator, Rocket } from "lucide-react";
import clsx from "clsx";

type AppItem = {
  key: string;
  title: string;
  icon: any;
  href?: string;        // optional route
  disabled?: boolean;   // for “coming soon”
};

const APPS: AppItem[] = [
  { key: "aca", title: "ACA", icon: ShieldCheck, href: "/aca/dashboard" },
  { key: "medicare", title: "Medicare", icon: Pill, href: "/medicare/dashboard", },
  { key: "taxation", title: "Taxation", icon: Calculator, href: "/taxation", disabled: true },
  { key: "launchpad", title: "Launch Pad", icon: Rocket, href: "/launchpad", disabled: true },
];

export default function AppsMenu({
  onNavigate,
}: {
  onNavigate?: (href: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "h-10 w-10 rounded-full grid place-items-center transition",
          "bg-[#F3F4F6] hover:bg-[#EDEFF3] text-[#374151]"
        )}
        aria-label="Open applications"
        aria-expanded={open}
      >
        <LayoutGrid className="h-5 w-5" />
      </button>

      {open && (
        <div
          className={clsx(
            "absolute right-0 mt-3 w-85 rounded-xl bg-white shadow-xl border border-black/10 z-50",
            "p-4"
          )}
          role="menu"
        >
          <div className="text-sm  font-Gordita-Bold text-[#111827] mb-3">
            Applications
          </div>

          <div className="grid grid-cols-2 gap-3">
            {APPS.map((app) => {
              const Icon = app.icon;
              return (
                <button
                  key={app.key}
                  type="button"
                  disabled={app.disabled}
                  onClick={() => {
                    if (!app.href) return;
                    setOpen(false);
                    onNavigate?.(app.href);
                  }}
                  className={clsx(
                    "rounded-lg border border-black/10 p-4 text-left transition",
                    "flex flex-col items-center justify-center gap-2",
                    app.disabled
                      ? "opacity-60 cursor-not-allowed bg-[#F7F7F7]"
                      : "hover:bg-[#F5F7FB] bg-white"
                  )}
                  role="menuitem"
                >
                  <div
                    className={clsx(
                      "h-12 w-12 rounded-lg grid place-items-center",
                      app.disabled ? "bg-black/5" : "bg-black/5"
                    )}
                  >
                    <Icon className="h-6 w-6 text-[#111827]" />
                  </div>

                  <div className="text-sm  font-Gordita-Medium text-[#111827]">
                    {app.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
