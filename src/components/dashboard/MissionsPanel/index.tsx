"use client";

import { Mission } from "@/lib/dashboard/types";

export default function MissionsPanel({ missions }: { missions: Mission[] }) {
  const active = missions.filter((m) => m.status === "ACTIVE");
  const done = missions.filter((m) => m.status === "COMPLETED");

  return (
    <div className="rounded-[10px] border border-white/10 bg-[#9BB4C0] p-5 h-full">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-white">Missions Engine</div>
          <div className="text-lg font-semibold">Daily Missions</div>
          <div className="text-xs text-white mt-1">
            Time-bound progress, auto-reward on completion.
          </div>
        </div>
        <div className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
          Cron-generated
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {active.map((m) => (
          <MissionRow key={m.id} mission={m} />
        ))}
      </div>

      {done.length > 0 && (
        <div className="mt-5">
          <div className="text-xs uppercase tracking-wide text-white/50 mb-2">
            Completed
          </div>
          <div className="space-y-2">
            {done.slice(0, 2).map((m) => (
              <div key={m.id} className="rounded-xl border border-white/10 bg-white/3 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold">{m.title}</div>
                  <div className="text-xs rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/70">
                    +{m.xpReward} XP
                  </div>
                </div>
                <div className="text-xs text-white mt-1">{m.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MissionRow({ mission }: { mission: Mission }) {
  const pct = Math.max(0, Math.min(100, Math.round((mission.progress / mission.target) * 100)));

  return (
    <div className="rounded-xl border border-white/10 bg-white/3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold leading-tight">{mission.title}</div>
          <div className="text-xs text-white mt-1">{mission.description}</div>
        </div>
        <div className="text-xs rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/70">
          +{mission.xpReward} XP
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-white">
          <span>{mission.progress}/{mission.target}</span>
          <span>{pct}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-white/35 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 text-[11px] text-white/50">
          Ends {new Date(mission.endsAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
