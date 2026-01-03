"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Users, FileText, Zap, BarChart3 } from "lucide-react";
import apiClient from "../../Utils/apiClient";
import Loader from "@/commonComponents/Loader";
import CommonSelect from "../../commonComponents/DropDown";
import toast from "react-hot-toast";

/* -------------------- Types -------------------- */

type DealsChartPoint = {
  date: string;
  deals: number;
  forms: number;
  activeAgents: number;
};

type DashboardRecent10DaysResponse = {
  timeline: Array<{
    date: string;
    deals: number;
    forms: number;
    activeAgents: number;
  }>;
  totalForms: number;
  totalDeals: number;
  avgDealsPerDay: number;
  activeAgentsCount: number;
};

type AgentOption = {
  id: string;
  name: string;
};

/* -------------------- Helpers -------------------- */

const fmt = new Intl.NumberFormat();

function safeNum(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function formatToDayMonth(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

/* -------------------- UI Subcomponents -------------------- */

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  delay: number;
  gradient: string;
};

function StatCard({
  label,
  value,
  hint,
  icon,
  bgColor,
  textColor,
  delay,
  gradient,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay }}
      whileHover={{
        y: -8,
        scale: 1.03,
        rotateX: 2,
        rotateY: 2,
        transition: { type: "spring", stiffness: 300 },
      }}
      className={`relative overflow-hidden rounded-2xl px-5 py-2 shadow-lg ${bgColor} backdrop-blur-sm`}
      style={{ background: gradient }}
    >
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: delay * 0.5 }}
        className="absolute top-2 right-2 h-2 w-2 rounded-full bg-white/30"
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div
              className={`text-xs font-semibold uppercase tracking-wider ${textColor} opacity-80`}
            >
              {label}
            </div>
            <div className={`mt-2 text-2xl font-bold ${textColor}`}>
              {value}
            </div>
            {hint && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.2 }}
                className={`mt-2 text-xs font-medium ${textColor} opacity-70`}
              >
                {hint}
              </motion.div>
            )}
          </div>

          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay }}
            className="rounded-xl bg-white/20 p-3 backdrop-blur-sm"
          >
            {icon}
          </motion.div>
        </div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeOut" }}
          className={`mt-4 h-1.5 rounded-full ${textColor} opacity-40`}
        />
      </div>
    </motion.div>
  );
}

function FancyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string | number; value?: number | string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  let deals = 0;
  let forms = 0;
  let activeAgents = 0;

  for (const item of payload) {
    const key = typeof item.dataKey === "string" ? item.dataKey : "";
    const value = safeNum(item.value);
    if (key === "deals") deals = value;
    if (key === "forms") forms = value;
    if (key === "activeAgents") activeAgents = value;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border-2 border-white bg-gradient-to-br from-white to-blue-50/80 p-5 shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-bold text-gray-800">{label}</div>
        <motion.span
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 text-xs font-bold text-white"
        >
          📊 DAILY SNAPSHOT
        </motion.span>
      </div>

      <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 text-sm font-medium text-gray-800">
        <span className="font-bold text-purple-600">deals</span>{" "}
        {fmt.format(deals)}{" "}
        <span className="font-bold text-blue-600">forms</span>{" "}
        {fmt.format(forms)}{" "}
        <span className="font-bold text-emerald-600">active agents</span>{" "}
        {fmt.format(activeAgents)}
      </div>
    </motion.div>
  );
}

/* -------------------- Main Component -------------------- */

export default function DealsChatCard() {
  const title = "✨ Deals Dashboard — Last 10 Days";

  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);

  const [selectedAgentId, setSelectedAgentId] = useState<string>("all");
  const [agents, setAgents] = useState<AgentOption[]>([]);

  const [timeline, setTimeline] = useState<DealsChartPoint[]>([]);
  const [totals, setTotals] = useState({
    totalForms: 0,
    totalDeals: 0,
    avgDealsPerDay: 0,
    peakAgents: 0,
    activeAgentsCount: 0,
  });

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);

      const r = await apiClient.get(`${apiClient.URLS.getDesignations}`);
      const designations = r?.body ?? [];

      const agentDesignation = designations.find((d: any) => {
        const name = String(d?.name ?? "").toLowerCase();
        return name === "agent";
      });

      const res = await apiClient.get(
        `${apiClient.URLS.user}/by-designation/${agentDesignation?.id}`
      );

      const body = res?.body?.data;
      const safe: AgentOption[] = Array.isArray(body)
        ? body
          .map((u: any) => {
            const id = typeof u?.id === "string" ? u.id : "";
            const first =
              typeof u?.firstName === "string" ? u.firstName.trim() : "";
            const last =
              typeof u?.lastName === "string" ? u.lastName.trim() : "";

            const name =
              [first, last].filter(Boolean).join(" ").trim() || "Unknown";

            return { id, name };
          })
          .filter((a) => a.id)
        : [];

      setAgents(safe);
    } catch {
      setAgents([]);
      toast.error("Failed to fetch agents");
    } finally {
      setLoadingAgents(false);
    }
  };

  const fetchAgentDashboard = async (agentId: string) => {
    try {
      setLoadingChart(true);

      const qs =
        agentId && agentId !== "all"
          ? `?agentId=${encodeURIComponent(agentId)}`
          : "";

      const res = await apiClient.get(
        `${apiClient.URLS.dashboard}/recent-10-days${qs}`
      );

      const body = (res?.body ?? {}) as Partial<DashboardRecent10DaysResponse>;
      const rawTimeline = Array.isArray(body.timeline) ? body.timeline : [];

      const mapped: DealsChartPoint[] = rawTimeline.map((d: any) => ({
        date: formatToDayMonth(String(d?.date ?? "")),
        deals: safeNum(d?.deals),
        forms: safeNum(d?.forms),
        activeAgents: safeNum(d?.activeAgents),
      }));

      const peakAgents = mapped.reduce(
        (m, d) => Math.max(m, safeNum(d.activeAgents)),
        0
      );

      setTimeline(mapped);
      setTotals({
        totalForms: safeNum(body.totalForms),
        totalDeals: safeNum(body.totalDeals),
        avgDealsPerDay: safeNum(body.avgDealsPerDay),
        peakAgents,
        activeAgentsCount: safeNum(body.activeAgentsCount),
      });
      toast.success("Data fetched successfully");
    } catch {
      setTimeline([]);
      setTotals({
        totalForms: 0,
        totalDeals: 0,
        avgDealsPerDay: 0,
        peakAgents: 0,
        activeAgentsCount: 0,
      });
      toast.error("Failed to fetch data");
    }
    finally {
      setLoadingChart(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchAgentDashboard("all");
  }, []);

  useEffect(() => {
    fetchAgentDashboard(selectedAgentId);
  }, [selectedAgentId]);

  const statCards = useMemo(
    () => [
      {
        label: "TOTAL FORMS",
        value: fmt.format(totals.totalForms),
        icon: <FileText className="h-6 w-6 text-blue-600" />,
        bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
        textColor: "text-blue-900",
        gradient: "linear-gradient(135deg, #eff6ff 0%, #ecfeff 100%)",
        delay: 0.1,
      },
      {
        label: "TOTAL DEALS",
        value: fmt.format(totals.totalDeals),
        icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
        bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
        textColor: "text-purple-900",
        gradient: "linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%)",
        delay: 0.2,
      },
      {
        label: "PEAK ACTIVE AGENTS",
        value: fmt.format(totals.peakAgents),
        hint: "Max in last 10 days",
        icon: <Users className="h-6 w-6 text-emerald-600" />,
        bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
        textColor: "text-emerald-900",
        gradient: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
        delay: 0.3,
      },
      {
        label: "AVG DEALS / DAY",
        value: fmt.format(totals.avgDealsPerDay),
        hint: "Days with deals",
        icon: <Zap className="h-6 w-6 text-amber-600" />,
        bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
        textColor: "text-amber-900",
        gradient: "linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%)",
        delay: 0.4,
      },
    ],
    [totals]
  );

  const loading = loadingAgents || loadingChart;
  if (loading) return <Loader />;

  const agentOptions = [
    { label: "All Agents", value: "all" },
    ...agents.map((a) => ({ label: a.name, value: a.id })),
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <div
        className="relative overflow-hidden rounded-3xl prof-surface p-6 shadow-2xl"
        style={{
          boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5)",
        }}
      >
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-10 h-32 w-32 rounded-full bg-gradient-to-r from-purple-200/30 to-pink-200/30 blur-xl"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0], rotate: [360, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 left-10 h-40 w-40 rounded-full bg-gradient-to-r from-blue-200/30 to-cyan-200/30 blur-xl"
        />

        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="relative z-10 mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-2"
              >
                <BarChart3 className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold app-text">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {title}
                  </span>
                </h2>
                <p className="mt-2 text-sm font-medium app-muted">
                  Interactive performance dashboard with animated charts and
                  real-time insights
                </p>
              </div>
            </div>
          </div>

          <div className="min-w-[240px] z-40">
            <CommonSelect
              value={selectedAgentId}
              options={agentOptions}
              onChange={(val: string) => setSelectedAgentId(val)}
              placeholder="Select an agent"
              className="mb-4 z-30"
            />
          </div>
        </motion.div>

        <div className="relative z-10 mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7, type: "spring" }}
          className="relative z-10 mb-8 rounded-3xl prof-surface p-6 shadow-2xl"
          style={{
            border: "2px solid rgba(255, 255, 255, 0.8)",
            boxShadow:
              "0 15px 50px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
          }}
        >
          <div className="relative h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={timeline}
                margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
              >
                <defs>
                  <linearGradient id="dealFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="90%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>

                  <linearGradient id="formsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                    <stop offset="90%" stopColor="#3b82f6" stopOpacity={0.2} />
                  </linearGradient>

                  <linearGradient id="agentsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="90%" stopColor="#10b981" stopOpacity={0.2} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 600 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={{ stroke: "#d1d5db" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 600 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={{ stroke: "#d1d5db" }}
                  width={40}
                />

                <Tooltip content={<FancyTooltip />} />

                <Area
                  type="monotone"
                  dataKey="deals"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#dealFill)"
                  dot={{
                    r: 5,
                    fill: "#8b5cf6",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 10,
                    fill: "#ffffff",
                    stroke: "#8b5cf6",
                    strokeWidth: 3,
                  }}
                />

                <Bar
                  dataKey="forms"
                  barSize={22}
                  radius={[8, 8, 0, 0]}
                  fill="url(#formsFill)"
                />

                <Bar
                  dataKey="activeAgents"
                  barSize={16}
                  radius={[6, 6, 0, 0]}
                  fill="url(#agentsFill)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
