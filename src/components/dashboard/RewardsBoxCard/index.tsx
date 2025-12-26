"use client";

import { motion } from "framer-motion";
import { AppKey } from "@/lib/dashboard/types";

export default function RewardsBoxCard({ app }: { app: AppKey }) {
  return (
    <div className="rounded-[10px] border border-white/10 bg-[#9BB4C0] p-5 h-full">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-white">Rewards & Gift Box</div>
          <div className="text-lg  font-Gordita-Bold">Open a Box</div>
          <div className="text-xs text-white mt-1">
            Weighted reward pools + rate limits to prevent abuse.
          </div>
        </div>
        <div className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
          {app}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/3 p-4 overflow-hidden relative">
        <div className="absolute inset-0 opacity-30 bg-linear-to-br from-white/10 to-transparent" />
        <motion.div
          initial={{ scale: 0.98, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              🎁
            </div>
            <div>
              <div className="text-sm  font-Gordita-Bold">Daily Gift Box</div>
              <div className="text-xs text-white">
                Unlock by completing missions & maintaining streaks.
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-white">
            Possible drops:
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>XP boosts</li>
              <li>Badges</li>
              <li>Store credits / perks</li>
              <li>Team celebration effects (real-time)</li>
            </ul>
          </div>

          <button className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
            Open Gift Box
          </button>
        </motion.div>
      </div>
    </div>
  );
}
