"use client";

import { motion } from "framer-motion";
import { AppKey } from "@/lib/dashboard/types";

const APPS: { key: AppKey; label: string; sub: string }[] = [
  { key: "ACA", label: "ACA", sub: "Affordable Care Act" },
  { key: "MEDICARE", label: "Medicare", sub: "Health coverage" },
  { key: "TAXATION", label: "Taxation", sub: "Tax ops" },
  { key: "LAUNCHPAD", label: "Launch Pad", sub: "Internal tools" },
];

export default function AppSwitcher({
  value,
  onChange,
}: {
  value: AppKey;
  onChange: (v: AppKey) => void;
}) {
  return (
    <div className="relative rounded-xl border border-white/10 bg-[#9BB4C0] p-1">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
        {APPS.map((a) => {
          const active = a.key === value;
          return (
            <button
              key={a.key}
              onClick={() => onChange(a.key)}
              className="relative rounded-xl px-3 py-2 text-left outline-none"
            >
              {active && (
                <motion.div
                  layoutId="app-pill"
                  className="absolute inset-0 rounded-xl bg-white/10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className="relative z-10">
                <div className="text-sm font-semibold">{a.label}</div>
                <div className="text-[11px] text-white leading-4">{a.sub}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
