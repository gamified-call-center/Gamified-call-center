"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  Trophy,
  Crown,
  Zap,
  Home,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import apiClient from "../../Utils/apiClient"; // adjust if needed
import toast from "react-hot-toast";

type FilterMode = "period" | "single" | "range";
type Period = "today" | "yesterday" | "last_week" | "last_month";

interface LeaderboardRow {
  rank: number;
  agentName: string;
  dealCount: number;
}
interface LeaderboardMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  period?: string;
}
interface LeaderboardResponse {
  data: LeaderboardRow[];
  meta: LeaderboardMeta;
}

interface AgentViewModel {
  id: number;
  name: string;
  dealsClosed: number;
  color: string;
}

const AgentPerformanceLeaderboard = () => {
  // UI state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLive, setIsLive] = useState(true);

  // New: filter mode
  const [filterMode, setFilterMode] = useState<FilterMode>("period");

  // Period
  const [period, setPeriod] = useState<Period>("today");

  // Single date (YYYY-MM-DD)
  const [singleDate, setSingleDate] = useState<string>("");

  // Range (YYYY-MM-DD)
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  // Pagination
  const LIMIT = 10;
  const [page, setPage] = useState<number>(1);

  // Data
  const [agents, setAgents] = useState<AgentViewModel[]>([]);

  const [meta, setMeta] = useState<LeaderboardMeta>({
    page: 1,
    limit: LIMIT,
    total: 0,
    totalPages: 1,
    period: "today",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const periodOptions: { label: string; value: Period }[] = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last Week", value: "last_week" },
    { label: "Last Month", value: "last_month" },
  ];

  const filterModeOptions: { label: string; value: FilterMode }[] = [
    { label: "Period", value: "period" },
    { label: "From – To", value: "range" },
    { label: "Single Date", value: "single" },
  ];

  // Label shown on the main dropdown button
  const selectedLabel = useMemo(() => {
    if (filterMode === "period") {
      const found = periodOptions.find((p) => p.value === period);
      return found?.label || "Period";
    }
    if (filterMode === "single") {
      return singleDate ? singleDate : "Single Date";
    }
    // range
    if (from && to) return `${from} → ${to}`;
    if (from && !to) return `${from} → ...`;
    if (!from && to) return `... → ${to}`;
    return "From – To";
  }, [filterMode, period, singleDate, from, to]);

  const colorPalette = [
    "from-purple-400 to-pink-400",
    "from-blue-400 to-cyan-400",
    "from-emerald-400 to-teal-400",
    "from-orange-400 to-amber-400",
    "from-rose-400 to-pink-400",
    "from-indigo-400 to-violet-400",
    "from-green-400 to-emerald-400",
  ];

  const getPastelGradient = (index: number) => {
    const gradients = [
      "from-blue-100 to-cyan-100",
      "from-emerald-100 to-teal-100",
      "from-violet-100 to-purple-100",
      "from-amber-100 to-orange-100",
      "from-rose-100 to-pink-100",
      "from-sky-100 to-blue-100",
      "from-lime-100 to-emerald-100",
    ];
    return gradients[index % gradients.length];
  };

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
      case 2:
        return <Crown className="w-4 h-4 text-slate-400 fill-slate-400" />;
      case 3:
        return <Crown className="w-4 h-4 text-amber-700 fill-amber-700" />;
      default:
        return null;
    }
  };

  // ✅ Build query params based on selected filter mode
  const buildParams = () => {
    // const params: Record<string, any> = {
    //   page,
    //   limit: LIMIT,
    // };
    const params: any = {};

    if (filterMode === "period") {
      params.period = period; // e.g. today/last_week
      // no from/to
    }

    if (filterMode === "single") {
      // "single date" is represented by from=to=selectedDate (works with your API signature)
      if (singleDate) {
        params.date = singleDate;
      }
    }

    if (filterMode === "range") {
      if (from) params.from = from;
      if (to) params.to = to;
    }

    return params;
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const params = buildParams();
      // params = { date: "2022-02-22" }
      const queryString = new URLSearchParams(params).toString();
      const url = `${apiClient.URLS.leaderboard}?${queryString}`;
      const res = await apiClient.get(url);
      const payload: LeaderboardResponse = res.body;
      const rows = payload?.data ?? [];
      const m = payload?.meta ?? { page, limit: LIMIT, total: 0, totalPages: 1 };

      const mapped: AgentViewModel[] = rows.map((r, idx) => ({
        id: r.rank,
        name: r.agentName,
        dealsClosed: r.dealCount,
        color: colorPalette[idx % colorPalette.length],
      }));

      setAgents(mapped);
      setMeta({
        page: m.page ?? page,
        limit: m.limit ?? LIMIT,
        total: m.total ?? rows.length,
        totalPages: m.totalPages ?? 1,
        period: m.period ?? undefined,
      });
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      toast.error(err?.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };
  ;

  // Refetch when filter inputs change
  // useEffect(() => {
  //   const controller = new AbortController();
  //   fetchLeaderboard(controller.signal);
  //   return () => controller.abort();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [filterMode, period, singleDate, from, to, page]);

  // Poll if live
  useEffect(() => {
    console.log("Polling leaderboard data...");
    // if (!isLive) return;
    // const t = setInterval(() => {
    // const controller = new AbortController();
    fetchLeaderboard();
    // }, 3000);
    // return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode, period, singleDate, from, to, page]);

  // Stats
  const avgDeals = useMemo(() => {
    if (!agents.length) return 0;
    const sum = agents.reduce((acc, a) => acc + (a.dealsClosed || 0), 0);
    return Math.round(sum / agents.length);
  }, [agents]);

  const topScore = useMemo(() => {
    if (!agents.length) return 0;
    return Math.max(...agents.map((a) => a.dealsClosed || 0));
  }, [agents]);

  const toProgressPercent = (dealCount: number) => {
    // if (!topScore) return 0;
    return Math.min(100, Math.round((dealCount / 100) * 100));
  };

  // Pagination
  const canPrev = meta.page > 1;
  const canNext = meta.page < meta.totalPages;

  // When user changes mode, reset relevant fields + page
  const setMode = (mode: FilterMode) => {
    setFilterMode(mode);
    setPage(1);
    setIsDropdownOpen(false);

    if (mode === "period") {
      setSingleDate("");
      setFrom("");
      setTo("");
    }
    if (mode === "single") {
      setFrom("");
      setTo("");
      // keep period untouched but unused
    }
    if (mode === "range") {
      setSingleDate("");
      // keep period untouched but unused
    }
  };

  return (
    <div className="min-h-screen app-card p-4 md:p-6">
      {/* Top Navigation (unchanged) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto mb-6"
      >
        <div className="app-surface rounded-2xl shadow-lg shadow-blue-100/30 p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-cyan-400 rounded-xl blur opacity-20"></div>
                <div className="relative bg-linear-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </motion.div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-md md:text-xl  font-bold app-text">
                    Live Leaderboard
                  </h1>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping bg-red-400 rounded-full opacity-75"></div>
                      <Zap className="relative w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-xs  font-bold bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                      LIVE
                    </span>
                  </motion.div>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Real-time performance tracking of top agents
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 app-card px-4 py-3 rounded-xl border border-slate-200">
              <Link
                href="/aca/dashboard"
                className="flex items-center gap-2 app-text hover:text-blue-600 transition-colors duration-200 group"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm  font-medium group-hover:text-blue-600 transition-colors duration-200">
                  Home
                </span>
              </Link>
              <ChevronRight className="w-4 h-4 app-muted mx-1" />
              <div className="flex items-center gap-2 text-blue-600">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm  font-bold">Leaderboard</span>
              </div>
            </div>
          </div>

          {/* Stats row (unchanged styling) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-linear-to-br from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-100">
              <div className="text-xs text-slate-500 uppercase tracking-wider  font-medium">
                Total Agents
              </div>
              <div className="text-lg  font-bold text-slate-900 mt-1">
                {meta.total ?? agents.length}
              </div>
            </div>
            <div className="bg-linear-to-br from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-100">
              <div className="text-xs text-slate-500 uppercase tracking-wider  font-medium">
                Avg. Performance
              </div>
              <div className="text-lg  font-bold text-slate-900 mt-1">
                {avgDeals}
              </div>
            </div>
            <div className="bg-linear-to-br from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-100">
              <div className="text-xs text-slate-500 uppercase tracking-wider  font-medium">
                Top Score
              </div>
              <div className="text-lg  font-bold text-slate-900 mt-1">
                {topScore}
              </div>
            </div>
            <div className="bg-linear-to-br from-violet-50 to-purple-50 p-3 rounded-xl border border-violet-100">
              <div className="text-xs text-slate-500 uppercase tracking-wider  font-medium">
                Active Updates
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                    }`}
                ></div>
                <div className="text-sm  font-bold text-slate-900">
                  {isLive ? "Enabled" : "Paused"}
                </div>
              </div>
            </div>
          </div>

          {errorMsg ? (
            <div className="mt-4 text-sm text-red-600">{errorMsg}</div>
          ) : null}
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-7xl mx-auto"
      >
        <div className="app-card rounded-4xl shadow-2xl shadow-blue-100/50 p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-br from-blue-500 to-cyan-500 p-2.5 rounded-2xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-md md:text-xl  font-bold app-text">
                  Top Performers
                </h2>
                <p className="text-sm app-muted mt-1">
                  Real-time ranking based on closed deals
                </p>
              </div>
            </div>

            {/* ✅ Single Dropdown Button (same styling) */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-200 group"
              >
                <Calendar className="w-4 h-4 text-slate-500 group-hover:text-blue-500 transition-colors duration-200" />
                <span className=" font-medium text-slate-700 group-hover:text-blue-600 transition-colors duration-200">
                  {selectedLabel}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden"
                  >
                    {/* ✅ Mode selector (3 options) */}
                    <div className="px-4 py-3 text-xs  font-bold  uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                      Filter Mode
                    </div>

                    {filterModeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setMode(opt.value)}
                        className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-150 flex items-center gap-2 ${opt.value === filterMode
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-700"
                          }`}
                      >
                        {opt.value === filterMode && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        )}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ✅ Mode-specific inputs (same style family) */}
          {filterMode === "period" ? (
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative w-full md:w-80">
                <select
                  value={period}
                  onChange={(e) => {
                    setPeriod(e.target.value as Period);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 transition-all duration-200"
                >
                  {periodOptions.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}

          {filterMode === "single" ? (
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <input
                value={singleDate}
                onChange={(e) => {
                  setSingleDate(e.target.value);
                  setPage(1);
                }}
                type="date"
                className="px-4 py-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 transition-all duration-200 w-full md:w-80"
              />
            </div>
          ) : null}

          {filterMode === "range" ? (
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <input
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
                type="date"
                className="px-4 py-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 transition-all duration-200 w-full md:w-80"
              />
              <input
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
                type="date"
                className="px-4 py-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 transition-all duration-200 w-full md:w-80"
              />
            </div>
          ) : null}

          {/* List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading…</div>
            ) : agents.length > 0 ? (
              agents.map((agent, index) => {
                const isTopThree = index < 3;
                const progressPercentage = toProgressPercent(agent.dealsClosed);

                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{
                      scale: 1.01,
                      y: -2,
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05)",
                    }}
                    className={`group p-6 relative bg-white md:px-4 md:py-2  rounded-2xl border transition-all duration-300 hover:border-blue-200 ${isTopThree ? "border-2" : "border border-slate-200"
                      } ${isTopThree
                        ? index === 0
                          ? "border-yellow-300 bg-linear-to-r from-yellow-50/30 via-white to-white"
                          : index === 1
                            ? "border-slate-300 bg-linear-to-r from-slate-50/30 via-white to-white"
                            : "border-amber-300 bg-linear-to-r from-amber-50/30 via-white to-white"
                        : ""
                      }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {isTopThree && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                delay: index * 0.2,
                                type: "spring",
                              }}
                              className="absolute -top-2 -right-2 z-10"
                            >
                              {getMedalIcon(index + 1)}
                            </motion.div>
                          )}
                          <div
                            className={`w-10 h-10 flex items-center justify-center rounded-xl  font-bold ${isTopThree
                              ? index === 0
                                ? "bg-linear-to-br from-yellow-100 to-amber-100 text-yellow-700 shadow-sm"
                                : index === 1
                                  ? "bg-linear-to-br from-slate-100 to-gray-100 text-slate-700 shadow-sm"
                                  : "bg-linear-to-br from-amber-100 to-orange-100 text-amber-700 shadow-sm"
                              : "bg-slate-100 text-slate-500"
                              }`}
                          >
                            {agent.id}
                          </div>
                        </div>

                        <div className="relative">
                          <div
                            className={`w-12 h-12 rounded-2xl bg-linear-to-br ${getPastelGradient(
                              index
                            )} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300`}
                          >
                            <span className="text-2xl  font-bold text-slate-800">
                              {agent.name.charAt(0)}
                            </span>
                          </div>
                          {isTopThree && (
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg"
                            >
                              <Trophy
                                className={`w-4 h-4 ${index === 0
                                  ? "text-yellow-500"
                                  : index === 1
                                    ? "text-slate-400"
                                    : "text-amber-600"
                                  }`}
                              />
                            </motion.div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                          <div className="min-w-35">
                            <h3 className=" font-bold text-slate-900 truncate text-lg">
                              {agent.name}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                              <span className="inline-block w-2 h-2 bg-slate-300 rounded-full"></span>
                              {100 - agent.dealsClosed} deals to go
                            </p>
                          </div>

                          <div className="flex-1">
                            <div className="relative">
                              <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPercentage}%` }}
                                  transition={{
                                    duration: 1.5,
                                    delay: index * 0.2,
                                    ease: "easeOut",
                                  }}
                                  className={`h-full rounded-full bg-linear-to-r ${agent.color} shadow-sm`}
                                />
                              </div>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.2 + 1 }}
                                className="absolute -top-6 right-0 px-2 py-1 bg-white rounded-lg shadow-sm border border-slate-200"
                              >
                                <span className="text-xs  font-bold text-slate-700">
                                  {progressPercentage}%
                                </span>
                              </motion.div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <div className="px-4 py-2.5 rounded-full text-sm  font-bold shadow-sm bg-linear-to-r from-slate-50 to-gray-50 text-slate-800 border border-slate-200">
                              {agent.dealsClosed} Deals
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 -z-10 rounded-2xl bg-linear-to-r from-blue-100/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6">
                  <Trophy className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl  font-bold app-text mb-2">
                  No Data Available
                </h3>
                <p className="app-muted mb-6">
                  Select a different filter to view performance data
                </p>
                <button
                  onClick={() => {
                    setFilterMode("period");
                    setPeriod("today");
                    setSingleDate("");
                    setFrom("");
                    setTo("");
                    setPage(1);
                  }}
                  className="px-6 py-3 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-xl  font-medium hover:shadow-lg hover:shadow-blue-200 transition-all duration-200"
                >
                  Reset to Today
                </button>
              </motion.div>
            )}
          </div>

          {/* Footer Controls (unchanged styling) */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-linear-to-r from-emerald-400 to-teal-400 shadow"></div>
                <span className="text-sm app-text">Progress Bar</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-3 h-3 text-yellow-500" />
                <span className="text-sm app-text">Top 3 Ranking</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              

              <div className="text-sm app-text">
                Last updated: Just now
              </div>
            </div>
          </div>

          {/* Pagination (same styling family) */}
          <div className="mt-6 flex items-center justify-between">
            <button
              disabled={!canPrev || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`px-6 py-2.5 rounded-xl  font-medium transition-all duration-200 ${canPrev && !loading
                ? "bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                }`}
            >
              Prev
            </button>

            <div className="text-sm app-text">
              Page <span className=" font-bold">{meta.page}</span> of{" "}
              <span className=" font-bold">{meta.totalPages}</span>
            </div>

            <button
              disabled={!canNext || loading}
              onClick={() => setPage((p) => p + 1)}
              className={`px-6 py-2.5 rounded-xl  font-medium transition-all duration-200 ${canNext && !loading
                ? "bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                }`}
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AgentPerformanceLeaderboard;
