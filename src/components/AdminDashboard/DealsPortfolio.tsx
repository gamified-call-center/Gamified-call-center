// component/dashboard/deals-portfolio/index.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector,
} from "recharts";

import apiClient from "../../Utils/apiClient";
import { SpinnerLoader } from "./spinner";
import SimpleFromToPicker from "@/commonComponents/TwoPointerCalender";
import toast from "react-hot-toast";

/* ----------------------------- Types ----------------------------- */

type DealsPortfolioApiRow = {
  agentId: string;
  agentName: string;
  totalDeals: number;
  totalForms: number;
};

type AgentDealsRow = {
  agentId: string;
  agentName: string;
  deals: number;
};

type DealsPortfolioResponse = {
  from: string;
  to: string;
  totalDeals: number;
  totalForms: number;
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

type DateRange = {
  from: Date;
  to: Date;
};

type DraftRange = {
  from: Date | null;
  to: Date | null;
};

/* ----------------------------- Helpers ----------------------------- */

const fmt = new Intl.NumberFormat();
const fmtRange = new Intl.DateTimeFormat(undefined, {
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
});

function clampInt(n: number): number {
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODateOnly(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function todayRangeDefault(): DateRange {
  const to = startOfDay(new Date());
  const from = new Date(to);
  from.setDate(from.getDate() - 28);
  return { from, to };
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

/* ---------------------- Range Calendar (Popover content) ---------------------- */

function RangeCalendar({
  value,
  onChange,
}: {
  value: DraftRange;
  onChange: (next: DraftRange) => void;
}) {
  const base = value.to ?? value.from ?? startOfDay(new Date());

  const [cursor, setCursor] = useState<Date>(() => {
    const c = new Date(base);
    c.setDate(1);
    return c;
  });

  const [picking, setPicking] = useState<"from" | "to">(() =>
    value.from ? "to" : "from"
  );

  useEffect(() => {
    const b = value.to ?? value.from;
    if (!b) return;
    const c = new Date(b);
    c.setDate(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCursor(c);
  }, [value.from, value.to]);

  const monthLabel = useMemo(() => {
    return cursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [cursor]);

  const grid = useMemo(() => {
    const first = new Date(cursor);
    first.setDate(1);
    const startWeekday = first.getDay();
    const start = new Date(first);
    start.setDate(first.getDate() - startWeekday);

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return { days };
  }, [cursor]);

  const rangeMinMax = useMemo(() => {
    const a = value.from ? startOfDay(value.from).getTime() : null;
    const b = value.to ? startOfDay(value.to).getTime() : null;
    if (a === null || b === null) return null;
    return { min: Math.min(a, b), max: Math.max(a, b) };
  }, [value.from, value.to]);

  const inRange = (d: Date) => {
    if (!rangeMinMax) return false;
    const t = startOfDay(d).getTime();
    return t >= rangeMinMax.min && t <= rangeMinMax.max;
  };

  const isStart = (d: Date) => (value.from ? isSameDay(d, value.from) : false);
  const isEnd = (d: Date) => (value.to ? isSameDay(d, value.to) : false);

  const handlePick = (d: Date) => {
    const day = startOfDay(d);

    if (picking === "from") {
      onChange({ from: day, to: null });
      setPicking("to");
      return;
    }

    const from = value.from ? startOfDay(value.from) : day;
    const to = day;

    if (to.getTime() < from.getTime()) {
      onChange({ from: to, to: from });
    } else {
      onChange({ from, to });
    }
    setPicking("from");
  };

  return (
    <div className="w-[320px] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            const prev = new Date(cursor);
            prev.setMonth(prev.getMonth() - 1);
            setCursor(prev);
          }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          ←
        </button>

        <div className="text-sm font-semibold text-slate-900">{monthLabel}</div>

        <button
          type="button"
          onClick={() => {
            const next = new Date(cursor);
            next.setMonth(next.getMonth() + 1);
            setCursor(next);
          }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          →
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {grid.days.map((d, idx) => {
          const isThisMonth = d.getMonth() === cursor.getMonth();
          const range = inRange(d);
          const start = isStart(d);
          const end = isEnd(d);

          const baseCls =
            "h-9 w-full rounded-xl text-xs font-semibold transition";
          const cls = range
            ? start || end
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-900"
            : "bg-white text-slate-700 hover:bg-slate-50";

          const dim = isThisMonth ? "" : "opacity-40";

          return (
            <button
              key={`${d.toISOString()}-${idx}`}
              type="button"
              onClick={() => handlePick(d)}
              className={`${baseCls} ${cls} ${dim}`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1">
          <div className="text-[10px] font-semibold text-slate-500">From</div>
          <div className="text-xs font-semibold text-slate-900">
            {value.from ? toISODateOnly(value.from) : "—"}
          </div>
        </div>
        <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1">
          <div className="text-[10px] font-semibold text-slate-500">To</div>
          <div className="text-xs font-semibold text-slate-900">
            {value.to ? toISODateOnly(value.to) : "—"}
          </div>
        </div>
      </div>

      <div className="mt-3 text-[11px] font-medium text-slate-500">
        Pick <span className="font-semibold text-slate-700">From</span> then{" "}
        <span className="font-semibold text-slate-700">To</span>
      </div>
    </div>
  );
}

/* ----------------------------- Component ----------------------------- */

export default function DealsPortfolioCard() {
  const initial = todayRangeDefault();

  const [loading, setLoading] = useState(false);

  const [draftRange, setDraftRange] = useState<DraftRange>({
    from: initial.from,
    to: initial.to,
  });

  const [appliedRange, setAppliedRange] = useState<DateRange>({
    from: initial.from,
    to: initial.to,
  });

  const [portfolio, setPortfolio] = useState<DealsPortfolioResponse>({
    from: toISODateOnly(initial.from),
    to: toISODateOnly(initial.to),
    totalDeals: 0,
    totalForms: 0,
    agents: [],
  });

  const [activeKey, setActiveKey] = useState<string | null>(null);

  const [openCal, setOpenCal] = useState(false);
  const calWrapRef = useRef<HTMLDivElement | null>(null);

  const hasTwoPointers = !!draftRange.from && !!draftRange.to;

  const fromISO = toISODateOnly(appliedRange.from);
  const toISO = toISODateOnly(appliedRange.to);

  const fetchPortfolio = async (nextFrom: string, nextTo: string) => {
    try {
      setLoading(true);
      const res = await apiClient.get(
        `${apiClient.URLS.dashboard}/deals-portfolio?from=${nextFrom}&to=${nextTo}`
      );

      const body = res?.body;

      const rows: DealsPortfolioApiRow[] = Array.isArray(body)
        ? body.map((r: any) => ({
            agentId: typeof r?.agentId === "string" ? r.agentId : "",
            agentName:
              typeof r?.agentName === "string" ? r.agentName : "Unknown",
            totalDeals:
              typeof r?.totalDeals === "number" && Number.isFinite(r.totalDeals)
                ? r.totalDeals
                : 0,
            totalForms:
              typeof r?.totalForms === "number" && Number.isFinite(r.totalForms)
                ? r.totalForms
                : 0,
          }))
        : [];

      const totalDeals = rows.reduce((s, r) => s + clampInt(r.totalDeals), 0);
      const totalForms = rows.reduce((s, r) => s + clampInt(r.totalForms), 0);

      const safe: DealsPortfolioResponse = {
        from: nextFrom,
        to: nextTo,
        totalDeals,
        totalForms,
        agents: rows.map((r) => ({
          agentId: r.agentId,
          agentName: r.agentName,
          deals: clampInt(r.totalDeals),
        })),
      };

      setLoading(false);

      setPortfolio(safe);
      toast.success("Deals Portfolio updated");
    } catch {
      setPortfolio((p) => p);
      setLoading(false);
      toast.error("Failed to update Deals Portfolio");
    }
  };

  useEffect(() => {
    fetchPortfolio(fromISO, toISO);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!openCal) return;
      const el = calWrapRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpenCal(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenCal(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [openCal]);

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
    ] as Slice[];
  }, [portfolio]);

  const topFive = useMemo(() => {
    return [...(portfolio.agents || [])]
      .sort((a, b) => b.deals - a.deals)
      .slice(0, 5);
  }, [portfolio.agents]);

  const totalDeals = clampInt(portfolio.totalDeals);

  const activeSlice = useMemo(() => {
    if (!activeKey) return null;
    return slices.find((s) => s.key === activeKey) ?? null;
  }, [activeKey, slices]);

  const centerTitle = activeSlice ? activeSlice.name : "Total Deals";
  const centerValue = activeSlice
    ? fmt.format(activeSlice.value)
    : fmt.format(totalDeals);

  const centerSubtitle = activeSlice
    ? `${activeSlice.pct.toFixed(1)}% of total`
    : `${fmt.format(Math.max(0, slices.length - 1))} agents + Others`;

  const centerColor = (() => {
    if (!activeSlice) return "#0F172A";
    const idx = slices.findIndex((s) => s.key === activeSlice.key);
    return idx >= 0 ? pickColor(idx) : "#0F172A";
  })();

  const rangeLabel = hasTwoPointers
    ? `${fmtRange.format(draftRange.from!)} to ${fmtRange.format(
        draftRange.to!
      )}`
    : draftRange.from
    ? `${fmtRange.format(draftRange.from)} to —`
    : "Select date range";

  const applyRange = () => {
    if (!draftRange.from || !draftRange.to) return;
    const a = startOfDay(draftRange.from);
    const b = startOfDay(draftRange.to);
    const from = a.getTime() <= b.getTime() ? a : b;
    const to = a.getTime() <= b.getTime() ? b : a;
    setAppliedRange({ from, to });
    setOpenCal(false);
    fetchPortfolio(toISODateOnly(from), toISODateOnly(to));
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
              <SimpleFromToPicker
                value={draftRange}
                onChange={setDraftRange}
                canApply={hasTwoPointers}
                onApply={applyRange}
                label="Select date range"
              />
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
                Note: Donut shows <span className="font-semibold">Top 10</span>{" "}
                + <span className="font-semibold">Others</span>. This list shows{" "}
                <span className="font-semibold">Top 5</span>.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
