// component/dashboard/deals-portfolio/index.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector,
} from "recharts";

import apiClient from "../../Utils/apiClient";

/* ----------------------------- Types ----------------------------- */

type AgentDealsRow = {
  agentId: string;
  agentName: string;
  deals: number;
};

type DealsPortfolioResponse = {
  from: string;
  to: string;
  totalDeals: number;
  agents: AgentDealsRow[];
};

type Slice = {
  key: string;
  name: string;
  value: number;
  pct: number;
  isOthers?: boolean;
};

type TooltipValue = number;
type TooltipName = string;

/* ----------------------------- Helpers ----------------------------- */

const fmt = new Intl.NumberFormat();

function clampInt(n: number): number {
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

function toISODateInput(v: string): string {
  return v;
}

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/* ----------------------------- Palette (Light only) ----------------------------- */

const PALETTE_LIGHT = [
  "#2563EB",
  "#06B6D4",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#A855F7",
  "#EC4899",
  "#14B8A6",
  "#84CC16",
  "#F97316",
  "#64748B",
];

function pickColor(i: number) {
  return PALETTE_LIGHT[i % PALETTE_LIGHT.length];
}

/* ----------------------------- Tooltip ----------------------------- */

function SliceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as Slice | undefined;
  if (!p) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-xl backdrop-blur">
      <div className="text-xs font-semibold">{p.name}</div>
      <div className="mt-1 text-sm">
        <span className="font-semibold">Deals:</span> {fmt.format(p.value)}
      </div>
      <div className="mt-0.5 text-xs opacity-70">{p.pct.toFixed(1)}%</div>
    </div>
  );
}

/* ----------------------------- Center Label ----------------------------- */

function CenterLabel({
  color,
  title,
  value,
  subtitle,
}: {
  color: string;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="text-xs font-medium text-slate-600">{title}</div>
        <div className="mt-1 flex items-center justify-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-2xl font-semibold tracking-tight text-slate-950">
            {value}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500">{subtitle}</div>
      </div>
    </div>
  );
}

/* ----------------------------- Static preview data ----------------------------- */

const STATIC_PORTFOLIO: DealsPortfolioResponse = {
  from: "2025-12-01",
  to: "2025-12-29",
  totalDeals: 3669,
  agents: [
    { agentId: "a1", agentName: "Ivan Ballin", deals: 533 },
    { agentId: "a2", agentName: "Alex IDefalco", deals: 430 },
    { agentId: "a3", agentName: "4Jacob ISmith", deals: 377 },
    { agentId: "a4", agentName: "Tizano Brown", deals: 377 },
    { agentId: "a5", agentName: "Anna Mann", deals: 262 },
    { agentId: "a6", agentName: "Neha Sharma", deals: 248 },
    { agentId: "a7", agentName: "Aarav Patel", deals: 231 },
    { agentId: "a8", agentName: "Jacob Smith", deals: 215 },
    { agentId: "a9", agentName: "Sofia Khan", deals: 198 },
    { agentId: "a10", agentName: "Rohan Mehta", deals: 189 },
  ],
};

/* ----------------------------- Component ----------------------------- */

export default function DealsPortfolioCard() {
  const [from, setFrom] = useState<string>(daysAgoISO(28));
  const [to, setTo] = useState<string>(todayISO());

  const [portfolio, setPortfolio] = useState<DealsPortfolioResponse>(
    STATIC_PORTFOLIO
  );

  const [activeKey, setActiveKey] = useState<string | null>(null);

  const fetchPortfolio = async (nextFrom: string, nextTo: string) => {
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.dashboard}/deals-portfolio?from=${nextFrom}&to=${nextTo}`
      );

      const body = res?.body;

      if (Array.isArray(body)) {
        const agents: AgentDealsRow[] = body.map((r: any) => ({
          agentId: typeof r?.agentId === "string" ? r.agentId : "",
          agentName: typeof r?.agentName === "string" ? r.agentName : "Unknown",
          deals:
            typeof r?.totalDeals === "number" && Number.isFinite(r.totalDeals)
              ? r.totalDeals
              : 0,
        }));

        const totalDeals = agents.reduce((s, a) => s + clampInt(a.deals), 0);

        const safe: DealsPortfolioResponse = {
          from: nextFrom,
          to: nextTo,
          totalDeals,
          agents,
        };

        setPortfolio(safe);
        return;
      }

      setPortfolio(STATIC_PORTFOLIO);
    } catch {
      setPortfolio(STATIC_PORTFOLIO);
    }
  };

  useEffect(() => {
    setFrom(STATIC_PORTFOLIO.from);
    setTo(STATIC_PORTFOLIO.to);
    setPortfolio(STATIC_PORTFOLIO);
    // Uncomment this later when DB has data:
    // fetchPortfolio(from, to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slices = useMemo(() => {
    const total = clampInt(portfolio.totalDeals);
    const sorted = [...(portfolio.agents || [])].sort(
      (a, b) => b.deals - a.deals
    );

    const top10 = sorted.slice(0, 10);
    const top10Sum = top10.reduce((s, r) => s + clampInt(r.deals), 0);
    const others = Math.max(0, total - top10Sum);

    return [
      ...top10.map((r, i) => ({
        key: r.agentId || `${r.agentName}-${i}`,
        name: r.agentName,
        value: clampInt(r.deals),
        pct: total > 0 ? (clampInt(r.deals) / total) * 100 : 0,
      })),
      {
        key: "others",
        name: "Others",
        value: clampInt(others),
        pct: total > 0 ? (others / total) * 100 : 0,
        isOthers: true,
      },
    ] satisfies Slice[];
  }, [portfolio]);

  const topFive = useMemo(() => {
    return [...(portfolio.agents || [])]
      .sort((a, b) => b.deals - a.deals)
      .slice(0, 5);
  }, [portfolio.agents]);

  const totalDeals = clampInt(portfolio.totalDeals);

  const activeSlice =
    activeKey === null
      ? null
      : slices.find((s) => s.key === activeKey) ?? null;

  const centerTitle = activeSlice ? activeSlice.name : "Total Deals";
  const centerValue = activeSlice
    ? fmt.format(activeSlice.value)
    : fmt.format(totalDeals);

  const centerSubtitle = activeSlice
    ? `${activeSlice.pct.toFixed(1)}% of total`
    : `${fmt.format(Math.max(0, slices.length - 1))} agents + Others`;

  const activeIndex = activeKey
    ? Math.max(0, slices.findIndex((s) => s.key === activeKey))
    : -1;

  const centerColor = activeSlice && activeIndex >= 0 ? pickColor(activeIndex) : "#0F172A";

  const handleApplyDates = () => {
    fetchPortfolio(from, to);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-white text-slate-900 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]"
      >
        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Deals Portfolio</h2>
              <div className="mt-1 text-sm text-slate-500">
                Top 10 agents + Others (hover a segment to inspect).
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                <span className="text-xs font-medium opacity-80">From</span>
                <input
                  type="date"
                  value={toISODateInput(from)}
                  onChange={(e) => setFrom(e.target.value)}
                  className="bg-transparent text-xs outline-none text-slate-900"
                />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                <span className="text-xs font-medium opacity-80">To</span>
                <input
                  type="date"
                  value={toISODateInput(to)}
                  onChange={(e) => setTo(e.target.value)}
                  className="bg-transparent text-xs outline-none text-slate-900"
                />
              </div>

              <button
                onClick={handleApplyDates}
                className="rounded-2xl border border-slate-200 bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-[320px,1fr]">
            <div className="relative rounded-[22px] border border-transparent">
              <div className="relative h-[280px] w-full">
                <CenterLabel
                  color={centerColor}
                  title={centerTitle}
                  value={centerValue}
                  subtitle={centerSubtitle}
                />

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip<TooltipValue, TooltipName>
                      content={<SliceTooltip />}
                    />
                    <Pie
                      data={slices}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={92}
                      outerRadius={120}
                      paddingAngle={2}
                      cornerRadius={8}
                      stroke="#ffffff"
                      strokeWidth={2}
                      onMouseLeave={() => setActiveKey(null)}
                      onMouseEnter={(d: any) => {
                        const key = (d?.payload?.key ?? d?.key) as
                          | string
                          | undefined;
                        setActiveKey(key ?? null);
                      }}
                      activeShape={(props: any) => {
                        const key = props?.payload?.key as string | undefined;
                        const isActive = !!key && key === activeKey;

                        if (!isActive) return <Sector {...props} />;

                        return (
                          <Sector
                            {...props}
                            outerRadius={(props.outerRadius as number) + 6}
                          />
                        );
                      }}
                    >
                      {slices.map((s, i) => (
                        <Cell
                          key={s.key}
                          fill={pickColor(i)}
                          opacity={
                            activeKey === null || activeKey === s.key ? 1 : 0.35
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Hover changes center + tooltip
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700">
                  {fmt.format(totalDeals)} total
                </span>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Top Agents</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Showing top 5 by deals
                  </div>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  Period: {portfolio.from} → {portfolio.to}
                </div>
              </div>

              <div className="mt-4 divide-y border-slate-200">
                {topFive.map((r, idx) => {
                  const color = pickColor(idx);
                  return (
                    <motion.div
                      key={r.agentId || `${r.agentName}-${idx}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * idx, duration: 0.25 }}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <div className="text-sm font-medium">{r.agentName}</div>
                      </div>
                      <div className="text-sm font-semibold">
                        #{fmt.format(clampInt(r.deals))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-4 text-xs text-slate-500">
                Note: Donut shows <span className="font-semibold">Top 10</span> +{" "}
                <span className="font-semibold">Others</span>. This list shows{" "}
                <span className="font-semibold">Top 5</span>.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
