// component/dashboard/chat/index.tsx
"use client";

import React, { useMemo, useState } from "react";
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
import { Sparkles, TrendingUp, Users, FileText, ChevronDown, Zap, Target, BarChart3 } from "lucide-react";

// -------------------- Types --------------------

export type DealsChartPoint = {
  date: string;
  deals: number;
  forms: number;
  activeAgents: number;
};

export type DealsChatCardProps = {
  title?: string;
  data?: DealsChartPoint[];
  agents?: string[];
  defaultAgent?: string;
  onAgentChange?: (agent: string) => void;
};

// -------------------- Static data --------------------

const DEFAULT_DATA: DealsChartPoint[] = [
  { date: "20-Dec", deals: 90, forms: 52, activeAgents: 8 },
  { date: "21-Dec", deals: 58, forms: 25, activeAgents: 4 },
  { date: "22-Dec", deals: 215, forms: 72, activeAgents: 14 },
  { date: "23-Dec", deals: 78, forms: 45, activeAgents: 9 },
  { date: "24-Dec", deals: 0, forms: 0, activeAgents: 0 },
  { date: "25-Dec", deals: 0, forms: 0, activeAgents: 0 },
  { date: "26-Dec", deals: 108, forms: 54, activeAgents: 7 },
  { date: "27-Dec", deals: 132, forms: 60, activeAgents: 11 },
  { date: "28-Dec", deals: 4, forms: 2, activeAgents: 1 },
  { date: "29-Dec", deals: 0, forms: 0, activeAgents: 0 },
];

// -------------------- Helpers --------------------

const fmt = new Intl.NumberFormat();

function safeNum(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

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

function StatCard({ label, value, hint, icon, bgColor, textColor, delay, gradient }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay 
      }}
      whileHover={{ 
        y: -8,
        scale: 1.03,
        rotateX: 2,
        rotateY: 2,
        transition: { type: "spring", stiffness: 300 }
      }}
      className={`relative overflow-hidden rounded-2xl p-5 shadow-lg ${bgColor} backdrop-blur-sm`}
      style={{
        background: gradient,
      }}
    >
      {/* Floating particles */}
      <motion.div
        animate={{ 
          x: [0, 20, 0],
          y: [0, -10, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, delay: delay * 0.5 }}
        className="absolute top-2 right-2 h-2 w-2 rounded-full bg-white/30"
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className={`text-xs font-semibold uppercase tracking-wider ${textColor} opacity-80`}>
              {label}
            </div>
            <div className={`mt-2 text-3xl font-bold ${textColor}`}>
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
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: delay }}
            className="rounded-xl bg-white/20 p-3 backdrop-blur-sm"
          >
            {icon}
          </motion.div>
        </div>
        
        {/* Animated progress bar */}
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

// Enhanced Tooltip Component
function FancyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    value?: number | string;
  }>;
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
        <span className="font-bold text-purple-600">deals</span> {fmt.format(deals)}{" "}
        <span className="font-bold text-blue-600">forms</span> {fmt.format(forms)}{" "}
        <span className="font-bold text-emerald-600">active agents</span>{" "}
        {fmt.format(activeAgents)}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <motion.div 
          whileHover={{ scale: 1.08, rotateY: 10 }}
          className="rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 p-3 shadow-lg"
        >
          <div className="text-xs font-bold text-purple-700">Deals</div>
          <div className="mt-1 text-lg font-black text-purple-900">{fmt.format(deals)}</div>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.08, rotateY: 10 }}
          className="rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 p-3 shadow-lg"
        >
          <div className="text-xs font-bold text-blue-700">Forms</div>
          <div className="mt-1 text-lg font-black text-blue-900">{fmt.format(forms)}</div>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.08, rotateY: 10 }}
          className="rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 p-3 shadow-lg"
        >
          <div className="text-xs font-bold text-emerald-700">Active Agents</div>
          <div className="mt-1 text-lg font-black text-emerald-900">{fmt.format(activeAgents)}</div>
        </motion.div>
      </div>
      
      {/* Mini sparkles */}
      <div className="mt-3 flex justify-center gap-1">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            className="h-1 w-1 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
          />
        ))}
      </div>
    </motion.div>
  );
}

// -------------------- Main Component --------------------

export default function DealsChatCard({
  title = "✨ Deals Dashboard — Last 10 Days",
  data = DEFAULT_DATA,
  agents = ["All Agents", "Jacob Smith", "Aarav Patel", "Neha Sharma"],
  defaultAgent = "All Agents",
  onAgentChange,
}: DealsChatCardProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>(defaultAgent);
  const [isHovered, setIsHovered] = useState(false);

  const totals = useMemo(() => {
    const totalForms = data.reduce((s, d) => s + d.forms, 0);
    const totalDeals = data.reduce((s, d) => s + d.deals, 0);
    const peakAgents = data.reduce((m, d) => Math.max(m, d.activeAgents), 0);
    const daysWithDeals = data.filter((d) => d.deals > 0).length || 1;
    const avgDealsPerDay = Math.round(totalDeals / daysWithDeals);
    return { totalForms, totalDeals, peakAgents, avgDealsPerDay };
  }, [data]);

  const handleAgentChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const next = e.target.value;
    setSelectedAgent(next);
    onAgentChange?.(next);
  };

  const statCards = [
    {
      label: "TOTAL FORMS",
      value: fmt.format(totals.totalForms),
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      textColor: "text-blue-900",
      gradient: "linear-gradient(135deg, #eff6ff 0%, #ecfeff 100%)",
      delay: 0.1
    },
    {
      label: "TOTAL DEALS",
      value: fmt.format(totals.totalDeals),
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      textColor: "text-purple-900",
      gradient: "linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%)",
      delay: 0.2
    },
    {
      label: "PEAK ACTIVE AGENTS",
      value: fmt.format(totals.peakAgents),
      hint: "Max in last 10 days",
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
      textColor: "text-emerald-900",
      gradient: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
      delay: 0.3
    },
    {
      label: "AVG DEALS / DAY",
      value: fmt.format(totals.avgDealsPerDay),
      hint: "Days with deals",
      icon: <Zap className="h-6 w-6 text-amber-600" />,
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      textColor: "text-amber-900",
      gradient: "linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%)",
      delay: 0.4
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <div 
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-blue-50/50 p-6 shadow-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5)"
        }}
      >
        {/* Animated floating shapes */}
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-10 h-32 w-32 rounded-full bg-gradient-to-r from-purple-200/30 to-pink-200/30 blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -40, 0],
            y: [0, 40, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 left-10 h-40 w-40 rounded-full bg-gradient-to-r from-blue-200/30 to-cyan-200/30 blur-xl"
        />

        {/* Header */}
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="relative z-10 mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-2"
              >
                <BarChart3 className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {title}
                  </span>
                </h2>
                <p className="mt-2 text-sm font-medium text-gray-600">
                  Interactive performance dashboard with animated charts and real-time insights
                </p>
              </div>
            </div>
          </div>

          {/* Agent dropdown */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <select
              value={selectedAgent}
              onChange={handleAgentChange}
              className="h-12 min-w-[240px] appearance-none rounded-2xl border-2 border-blue-200 bg-white px-5 pr-12 text-sm font-bold text-gray-800 shadow-lg outline-none transition-all hover:border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            >
              {agents.map((a) => (
                <option key={a} value={a} className="py-2">
                  {a}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <motion.div
                animate={{ y: [0, 2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ChevronDown className="h-5 w-5 text-blue-500" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <div className="relative z-10 mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {/* Chart Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7, type: "spring" }}
          className="relative z-10 mb-8 rounded-3xl bg-gradient-to-br from-white to-blue-50/50 p-6 shadow-2xl"
          style={{
            border: "2px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 15px 50px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)"
          }}
        >
          {/* Chart background sparkles */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -20, 0],
                  opacity: [0.2, 0.8, 0.2]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  delay: i * 0.4,
                  ease: "easeInOut"
                }}
                className="absolute h-1 w-1 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          <div className="relative h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
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

                {/* Deals (area with glow) */}
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
                    strokeWidth: 2 
                  }}
                  activeDot={{ 
                    r: 10, 
                    fill: "#ffffff", 
                    stroke: "#8b5cf6", 
                    strokeWidth: 3 
                  }}
                />

                {/* Forms (bar) */}
                <Bar
                  dataKey="forms"
                  barSize={22}
                  radius={[8, 8, 0, 0]}
                  fill="url(#formsFill)"
                />

                {/* Active Agents (bar) */}
                <Bar
                  dataKey="activeAgents"
                  barSize={16}
                  radius={[6, 6, 0, 0]}
                  fill="url(#agentsFill)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <motion.span 
              whileHover={{ scale: 1.1, y: -3 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-100 to-purple-50 px-5 py-2.5 text-sm font-bold text-purple-900 shadow-lg"
            >
              <motion.span 
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
              />
              Deals
            </motion.span>
            <motion.span 
              whileHover={{ scale: 1.1, y: -3 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 px-5 py-2.5 text-sm font-bold text-blue-900 shadow-lg"
            >
              <motion.span 
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
              />
              Forms
            </motion.span>
            <motion.span 
              whileHover={{ scale: 1.1, y: -3 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-900 shadow-lg"
            >
              <motion.span 
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
              />
              Active Agents
            </motion.span>
          </div>
        </motion.div>

        
      </div>
    </motion.section>
  );
}