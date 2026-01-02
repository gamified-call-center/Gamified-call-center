// component/dashboard/deals-summary-by-date/index.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, Calendar as CalendarIcon } from "lucide-react";
import apiClient from "../../Utils/apiClient";
import { SpinnerLoader } from "./spinner";
import DateRangePickerPopover from "@/commonComponents/TwoPointerCalender";
import SimpleFromToPicker from "@/commonComponents/TwoPointerCalender";
import toast from "react-hot-toast";

/* ----------------------------- Types ----------------------------- */

type DayPoint = {
  date: string;
  forms: number;
  deals: number;
};

type AgentRow = {
  agentId: string;
  agentName: string;
  data: DayPoint[];
};

type DateRange = {
  from: Date;
  to: Date;
};

type DraftRange = {
  from: Date | null;
  to: Date | null;
};

/* ----------------------------- Helpers ----------------------------- */

const fmt2 = new Intl.NumberFormat(undefined, { minimumFractionDigits: 0 });

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

function eachDayInclusive(from: Date, to: Date) {
  const out: Date[] = [];
  const cur = startOfDay(from);
  const end = startOfDay(to);
  while (cur.getTime() <= end.getTime()) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function parseISOishToLocalDate(dateStr: string) {
  return startOfDay(new Date(dateStr));
}

function safeNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function todayRangeDefault(): DateRange {
  const to = startOfDay(new Date());
  const from = new Date(to);
  from.setDate(from.getDate() - 12);
  return { from, to };
}

function formatDayMonth(d: Date) {
  const day = pad2(d.getDate());
  const mon = d.toLocaleString("en-GB", { month: "short" });
  return `${day}-${mon}`;
}

const fmtRange = new Intl.DateTimeFormat(undefined, {
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
});

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

/* ---------------------- Component ---------------------- */

export default function DealsSummaryByDate() {
  const initial = todayRangeDefault();

  const [draftRange, setDraftRange] = useState<DraftRange>({
    from: initial.from,
    to: initial.to,
  });

  const [appliedRange, setAppliedRange] = useState<DateRange>({
    from: initial.from,
    to: initial.to,
  });

  const [rows, setRows] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [openCal, setOpenCal] = useState(false);
  const calWrapRef = useRef<HTMLDivElement | null>(null);

  const hasTwoPointers = !!draftRange.from && !!draftRange.to;

  const fromISO = toISODateOnly(appliedRange.from);
  const toISO = toISODateOnly(appliedRange.to);

  const days = useMemo(() => {
    return eachDayInclusive(appliedRange.from, appliedRange.to);
  }, [appliedRange]);

  const fetchData = async (from: string, to: string) => {
    setLoading(true);
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.dashboard}/deals-summary?from=${from}&to=${to}`
      );

      const body = res?.body;

      const safe: AgentRow[] = Array.isArray(body)
        ? body.map((r: any) => ({
            agentId: typeof r?.agentId === "string" ? r.agentId : "",
            agentName:
              typeof r?.agentName === "string" ? r.agentName : "Unknown",
            data: Array.isArray(r?.data)
              ? r.data.map((p: any) => ({
                  date: typeof p?.date === "string" ? p.date : "",
                  forms: safeNum(p?.forms),
                  deals: safeNum(p?.deals),
                }))
              : [],
          }))
        : [];

      setRows(safe);
      toast.success("Deals summary fetched");
    } catch {
      setRows([]);
      toast.error("Failed to fetch deals summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(fromISO, toISO);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromISO, toISO]);

  const dayKeyList = useMemo(() => days.map((d) => toISODateOnly(d)), [days]);

  const tableMatrix = useMemo(() => {
    const map: Record<
      string,
      Record<string, { forms: number; deals: number }>
    > = {};

    for (const r of rows) {
      const perDay: Record<string, { forms: number; deals: number }> = {};
      for (const p of r.data || []) {
        const k = toISODateOnly(parseISOishToLocalDate(p.date));
        perDay[k] = { forms: safeNum(p.forms), deals: safeNum(p.deals) };
      }
      map[r.agentId || r.agentName] = perDay;
    }

    return map;
  }, [rows]);

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
  };

  const downloadPdf = async () => {
    const title = `Deals Summary By Date (${fromISO} to ${toISO})`;

    const flatHeaders: string[] = ["Agent Name"];
    for (const d of days) {
      const lab = formatDayMonth(d);
      flatHeaders.push(`${lab} Forms`);
      flatHeaders.push(`${lab} Deals`);
    }

    const bodyRows: (string | number)[][] = rows.map((r) => {
      const key = r.agentId || r.agentName;
      const perDay = tableMatrix[key] || {};
      const row: (string | number)[] = [r.agentName];

      for (const dk of dayKeyList) {
        const v = perDay[dk] || { forms: 0, deals: 0 };
        row.push(clampInt(v.forms));
        row.push(clampInt(v.deals));
      }
      return row;
    });

    try {
      const jsPDFMod: any = await import("jspdf");
      const autoTableMod: any = await import("jspdf-autotable");

      const jsPDF = jsPDFMod.default ?? jsPDFMod.jsPDF ?? jsPDFMod;
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      doc.setFontSize(12);
      doc.text(title, 40, 40);

      const autoTable = autoTableMod.default ?? autoTableMod;
      autoTable(doc, {
        head: [flatHeaders],
        body: bodyRows,
        startY: 60,
        styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
        headStyles: { fontSize: 8 },
        columnStyles: { 0: { cellWidth: 160 } },
        margin: { left: 40, right: 40 },
      });

      doc.save(`deals-summary-${fromISO}-to-${toISO}.pdf`);
    } catch {
      window.print();
    }
  };

  const showTable = hasTwoPointers;

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
              <h2 className="text-base font-semibold">Deals Summary By Date</h2>
              <div className="mt-1 text-sm text-slate-500">
                Forms and deals per agent for each day in the selected range.
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
              <button
                type="button"
                onClick={downloadPdf}
                disabled={!showTable}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm transition ${
                  showTable
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Download className="h-4 w-4" />
                <span>Excel</span>
              </button>
            </div>
          </div>

          {!showTable ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <div className="text-sm font-semibold text-slate-800">
                Select both From and To dates to view the table.
              </div>
              <div className="mt-2 text-xs text-slate-500">
                The table will render only after the second pointer is selected.
              </div>
            </div>
          ) : (
            <div className="mt-5 min-w-0">
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-[980px] w-full border-separate border-spacing-0">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th
                        rowSpan={2}
                        className="sticky left-0 z-20 w-[150px] min-w-[150px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold text-slate-700"
                      >
                        Agent Name
                      </th>
                      {days.map((d) => (
                        <th
                          key={toISODateOnly(d)}
                          colSpan={2}
                          className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-center text-xs font-semibold text-slate-700"
                        >
                          {formatDayMonth(d)}
                        </th>
                      ))}
                    </tr>

                    <tr>
                      {days.map((d) => {
                        const dk = toISODateOnly(d);
                        return (
                          <React.Fragment
                            key={`${dk}-pair`}
                          >
                            <th className="border-b border-slate-200 bg-white px-3 py-2 text-center text-[11px] font-semibold text-slate-500">
                              Forms
                            </th>
                            <th className="border-b border-slate-200 bg-white px-3 py-2 text-center text-[11px] font-semibold text-slate-500">
                              Deals
                            </th>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={1 + days.length * 2}
                          className="px-4 py-10 text-center text-sm font-semibold text-slate-600"
                        >
                          Loading…
                        </td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={1 + days.length * 2}
                          className="px-4 py-10 text-center text-sm font-semibold text-slate-600"
                        >
                          No data for selected range.
                        </td>
                      </tr>
                    ) : (
                      rows.map((r) => {
                        const key = r.agentId || r.agentName;
                        const perDay = tableMatrix[key] || {};

                        return (
                          <tr key={key} className="hover:bg-slate-50/60">
                            <td className="sticky left-0 z-10 border-b border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900">
                              {r.agentName}
                            </td>

                            {days.map((d) => {
                              const dk = toISODateOnly(d);
                              const v = perDay[dk] || { forms: 0, deals: 0 };
                              return (
                                <React.Fragment key={`${key}-${dk}-pair`}>
                                  <td className="border-b border-slate-200 px-3 py-3 text-center text-sm font-semibold text-slate-900">
                                    {fmt2.format(clampInt(v.forms))}
                                  </td>
                                  <td className="border-b border-slate-200 px-3 py-3 text-center text-sm font-semibold text-slate-900">
                                    {fmt2.format(clampInt(v.deals))}
                                  </td>
                                </React.Fragment>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 text-xs text-slate-500">
                Tip: Scroll horizontally on smaller screens to view all dates.
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.section>
  );
}
