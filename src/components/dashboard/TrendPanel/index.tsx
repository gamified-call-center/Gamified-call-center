"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";
import { AppKey, TimeRangeKey, TrendPoint } from "@/lib/dashboard/types";

function appTitle(app: AppKey) {
  if (app === "ACA") return "ACA Performance";
  if (app === "MEDICARE") return "Medicare Performance";
  if (app === "TAXATION") return "Taxation Performance";
  return "Launch Pad Performance";
}

export default function TrendPanel({
  trend,
  range,
  app,
}: {
  trend: TrendPoint[];
  range: TimeRangeKey;
  app: AppKey;
}) {
  return (
    <div className="rounded-[10px] border border-white/10 bg-[#9BB4C0] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-white">Trends</div>
          <div className="text-lg  font-Gordita-Bold">{appTitle(app)} • {rangeLabel(range)}</div>
          <div className="text-xs text-white mt-1">
            Calls & deals are derived from verified events; XP follows the XP engine safeguards.
          </div>
        </div>

        <div className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
          Real-time ready
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/3 p-4">
          <div className="text-sm  font-Gordita-Bold">Calls / Deals</div>
          <div className="mt-3 h-55">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="dateLabel" tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "rgba(15,18,32,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.8)" }}
                />
                <Area type="monotone" dataKey="calls" stroke="rgba(255,255,255,0.65)" fill="rgba(255,255,255,0.10)" />
                <Area type="monotone" dataKey="deals" stroke="rgba(255,255,255,0.45)" fill="rgba(255,255,255,0.06)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/3 p-4">
          <div className="text-sm  font-Gordita-Bold">XP Velocity</div>
          <div className="mt-3 h-55">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="dateLabel" tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "rgba(15,18,32,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.8)" }}
                />
                <Line type="monotone" dataKey="xp" stroke="rgba(255,255,255,0.75)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-white mt-2">
            Use this to detect performance spikes and tune missions/rewards fairly.
          </div>
        </div>
      </div>
    </div>
  );
}

function rangeLabel(r: TimeRangeKey) {
  if (r === "TODAY") return "Today";
  if (r === "WEEK") return "Last 7 days";
  return "Last 30 days";
}
