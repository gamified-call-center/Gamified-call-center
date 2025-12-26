"use client";

import { LiveActivityItem } from "@/lib/dashboard/types";
import { timeAgo } from "@/lib/dashboard/format";

function iconFor(t: LiveActivityItem["type"]) {
  if (t === "DEAL_CLOSED") return "💰";
  if (t === "LEVEL_UP") return "⬆️";
  if (t === "BADGE_UNLOCKED") return "🏅";
  if (t === "MISSION_COMPLETED") return "✅";
  if (t === "XP_GRANTED") return "✨";
  if (t === "CALL_ANSWERED") return "📞";
  return "🔔";
}

export default function LiveActivityFeed({ items }: { items: LiveActivityItem[] }) {
  return (
    <div className="rounded-[10px] border border-white/10 bg-[#9BB4C0] p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-white">Real-time Feed</div>
          <div className="text-lg  font-Gordita-Bold">Live Activity</div>
          <div className="text-xs text-white mt-1">
            This is where WebSocket events will stream (deal celebrations, level-ups, badge unlocks, leaderboard updates).
          </div>
        </div>
        <div className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
          WebSocket rooms
        </div>
      </div>

      <div className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 overflow-hidden">
        {items.map((i) => (
          <div key={i.id} className="bg-white/2 px-4 py-3 hover:bg-[#9BB4C0] transition">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                {iconFor(i.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm  font-Gordita-Bold truncate">
                    {i.title}{" "}
                    {i.actorName ? <span className="text-white font-normal">• {i.actorName}</span> : null}
                  </div>
                  <div className="text-xs text-white">{timeAgo(i.createdAt)}</div>
                </div>
                {i.subtitle && <div className="text-xs text-white mt-1">{i.subtitle}</div>}
                <div className="mt-2 flex items-center gap-2 text-[11px] text-white/50">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">{i.type}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">{i.app}</span>
                  {typeof i.amount === "number" && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      Amount: {i.amount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
