"use client";

import { LeaderboardEntry } from "@/lib/dashboard/types";
import { formatCompactNumber } from "@/lib/dashboard/format";

export default function LeaderboardPanel({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="rounded-[10px] border border-white/10 bg-[#9BB4C0] p-5 h-full">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-white">Leaderboard</div>
          <div className="text-lg font-semibold">Top Agents</div>
          <div className="text-xs text-white mt-1">
            Rankings can be Daily/Weekly/Monthly/All-time (Redis sorted sets).
          </div>
        </div>
        <div className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
          Redis-ready
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {entries.slice(0, 5).map((e) => (
          <div key={e.id} className="rounded-xl border border-white/10 bg-white/3 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-sm font-semibold">
                  #{e.rank}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{e.name}</div>
                  <div className="text-xs text-white">
                    Level {e.level} • Deals {e.deals} • +{e.improvementPct}% improvement
                  </div>
                </div>
              </div>
              <div className="text-xs rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/70">
                {formatCompactNumber(e.totalXp)} XP
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
        View Full Leaderboards
      </button>
    </div>
  );
}
