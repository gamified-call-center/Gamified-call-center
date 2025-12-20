"use client";

import { Boost } from "@/lib/dashboard/types";
import { timeAgo } from "@/lib/dashboard/format";

export default function BoostsPanel({ boosts }: { boosts: Boost[] }) {
  return (
    <div className="rounded-[10px] border border-white/10 bg-[#9BB4C0] p-5 h-full">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-white">Boosts</div>
          <div className="text-lg font-semibold">Active Multipliers</div>
          <div className="text-xs text-white mt-1">
            Temporary modifiers applied by the XP engine.
          </div>
        </div>
        <div className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
          Fair-play
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {boosts.map((b) => (
          <div key={b.id} className="rounded-xl border border-white/10 bg-white/3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">{b.name}</div>
                <div className="text-xs text-white mt-1">{b.description}</div>
              </div>
              <div className="text-xs rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/70">
                +{b.xpBonusPercent}%
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-white">
              <span>Expires</span>
              <span>{new Date(b.expiresAt).toLocaleString()}</span>
            </div>
            <div className="mt-1 text-[11px] text-white/45">
              Created {timeAgo(b.expiresAt)} (expiry countdown)
            </div>
          </div>
        ))}
      </div>

      <button className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
        Manage Boost Rules
      </button>
    </div>
  );
}
