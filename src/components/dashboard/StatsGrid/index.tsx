"use client";

import { motion } from "framer-motion";
import { StatKpi } from "@/lib/dashboard/types";

export default function StatGrid({ items }: { items: StatKpi[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((k, idx) => (
        <motion.div
          key={k.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="rounded-xl border border-white/10 bg-[#9BB4C0] p-4"
        >
          <div className="text-sm text-white">{k.label}</div>
          <div className="mt-2 text-2xl  font-Gordita-Bold tracking-tight">{k.value}</div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="text-xs text-white">{k.hint}</div>
            {k.deltaLabel && (
              <div className="text-xs rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/70">
                {k.deltaLabel}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
