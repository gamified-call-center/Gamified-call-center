"use client";

import { motion } from "framer-motion";
import { AppKey, TimeRangeKey } from "@/lib/dashboard/types";
import { formatCompactNumber } from "@/lib/dashboard/format";

function appGlow(app: AppKey) {
  if (app === "ACA") return "from-cyan-500/25 via-sky-500/10 to-transparent";
  if (app === "MEDICARE") return "from-emerald-500/25 via-green-500/10 to-transparent";
  if (app === "TAXATION") return "from-amber-500/25 via-orange-500/10 to-transparent";
  return "from-fuchsia-500/25 via-violet-500/10 to-transparent";
}

export default function DashboardHeader({
  profile,
  app,
}: {
  profile: { name: string; level: number; currentXp: number; xpToNextLevel: number; streakDays: number };
  app: AppKey;
}) {
  const pct = Math.max(0, Math.min(100, Math.round((profile.currentXp / profile.xpToNextLevel) * 100)));

  return (
    <div className="bg-red-600 relative overflow-hidden rounded-[10px] border  border-white/10 bg-[#9BB4C0]">
      <div className={`absolute inset-0 bg-linear-to-r ${appGlow(app)}`} />
      <div className="relative p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              <span className="text-lg  font-Gordita-Bold">★</span>
            </div>

            <div>
              <div className="text-sm text-white">Welcome back</div>
              <div className="text-lg md:text-xl  font-Gordita-Bold leading-tight">{profile.name}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white">
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                  Level <span className="text-white/90  font-Gordita-Bold">{profile.level}</span>
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                  Streak <span className="text-white/90  font-Gordita-Bold">{profile.streakDays}</span> days
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                  XP <span className="text-white/90  font-Gordita-Bold">{formatCompactNumber(profile.currentXp)}</span> /{" "}
                  {formatCompactNumber(profile.xpToNextLevel)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
              Open Live Rooms
            </button>
            <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
              View Audit Logs
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-white">
            <span>Progress to next level</span>
            <span>{pct}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-full rounded-full bg-white/40"
            />
          </div>
          <div className="mt-2 text-[12px] text-white">
            XP is granted only after verified events + safeguards (caps/cooldowns/duplicate checks).
          </div>
        </div>
      </div>
    </div>
  );
}

function RangePicker({
  value,
  onChange,
}: {
  value: TimeRangeKey;
  onChange: (v: TimeRangeKey) => void;
}) {
  const opts: { key: TimeRangeKey; label: string }[] = [
    { key: "TODAY", label: "Today" },
    { key: "WEEK", label: "7 Days" },
    { key: "MONTH", label: "30 Days" },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-[#b6bdc0] p-1">
      <div className="flex gap-1">
        {opts.map((o) => {
          const active = o.key === value;
          return (
            <button
              key={o.key}
              onClick={() => onChange(o.key)}
              className={`rounded-xl px-3 py-2 text-sm ${
                active ? "bg-white" : "hover:bg-white/5"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

DashboardHeader.RangePicker = RangePicker;
