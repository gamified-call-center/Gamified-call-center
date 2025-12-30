"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  X,
  Home,
  BookOpen,
  GraduationCap,
  CheckCircle,
  Clock,
  Award,
  Target,
  Search,
  AlertCircle,
  Eye,
  EyeOff,
  Download,
  Loader,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import apiClient from "../../Utils/apiClient"; // ✅ CHANGE THIS PATH
import { useAuthStore } from "../../store/user";
import toast from "react-hot-toast";

type TrainingType = "video" | "image" | "pdf";

type TrainingItem = {
  id: string | number;
  title: string;
  type: TrainingType;
  src: string;
  completed?: boolean;
  viewedTime?: number;
  lastAccessed?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

// Mock user progress
type UserProgress = {
  userId: string;
  completedChapters: number;
  totalTimeSpent: number;
  streakDays: number;
  lastActive: Date;
};

/** ---------------- RBAC ---------------- */
type Role = "ceo" | "manager" | "agent_lead" | "agent" | string;

/** ---------------- Normalizers ---------------- */
const normalizeTrainingItem = (item: any): TrainingItem => ({
  ...item,
  lastAccessed: item?.lastAccessed ? new Date(item.lastAccessed) : undefined,
  createdAt: item?.createdAt ? new Date(item.createdAt) : item?.createdAt,
  updatedAt: item?.updatedAt ? new Date(item.updatedAt) : item?.updatedAt,
});

export default function TrainingPage() {
  const user = useAuthStore((st) => st.user);
  const isAdmin = user?.systemRole === "ADMIN";

  const [data, setData] = useState<TrainingItem[]>([]);
  const [openId, setOpenId] = useState<string | number | null>(null);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TrainingItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<TrainingItem | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    type: "video" as TrainingType,
    src: "",
  });

  // User progress state (UI-only; backend can supply later if needed)
  const [userProgress, setUserProgress] = useState<UserProgress>({
    userId: "user_001",
    completedChapters: 0,
    totalTimeSpent: 120,
    streakDays: 7,
    lastActive: new Date(),
  });

  /** ---------------- API wrappers ---------------- */
  const fetchChapters = async () => {
    try {
      const res = await apiClient.get(apiClient.URLS.training, {}, true);
      if (res.status === 200) {
        toast.success("Chapters fetched");
        return res.body;
      }
    } catch (e) {
      toast.error("Failed to fetch chapters");
    }
  };

  const createChapter = async (payload: {
    title: string;
    type: TrainingType;
    src: string;
  }) => {
    try {
      const res = await apiClient.post(apiClient.URLS.training, payload, true);

      if (res.status === 201 || res.status === 200) {
        toast.success("Chapter created");
        return res.body;
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to create chapter");
      throw e;
    }
  };

  const updateChapter = async (
    id: TrainingItem["id"],
    payload: { title: string; type: TrainingType; src: string }
  ) => {
    try {
      const res = await apiClient.put(
        `${apiClient.URLS.training}/${id}`,
        payload,
        true
      );

      if (res.status === 200) {
        toast.success("Chapter updated");
        return res.body;
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to update chapter");
      throw e;
    }
  };

  const deleteChapterApi = async (id: TrainingItem["id"]) => {
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.training}/${id}`,
        {},
        true
      );

      if (res.status === 200) {
        toast.success("Chapter deleted");
        return res.body;
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete chapter");
      throw e;
    }
  };

  const updateProgress = async (
    id: TrainingItem["id"],
    payload: { completed?: boolean; viewedTime?: number; lastAccessed?: string }
  ) => {
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.training}/${id}/progress`,
        payload,
        true
      );

      if (res.status === 200) {
        toast.success(
          payload.completed ? "Marked as completed" : "Marked as incomplete"
        );
        return res.body;
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to update progress");
      throw e;
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const body = await fetchChapters();
        const items = Array.isArray(body.data) ? body.data : body?.data ?? [];
        const normalized = items.map(normalizeTrainingItem);
        setData(normalized);
        const completedCount = normalized.filter(
          (i: TrainingItem) => i.completed
        ).length;

        setUserProgress((p) => ({
          ...p,
          completedChapters: completedCount,
          lastActive: new Date(),
        }));
      } catch (e: any) {
        setError(e?.message || "Failed to load training data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /** ---------------- Derived values ---------------- */
  const completedChapters = useMemo(
    () => data.filter((item) => item.completed).length,
    [data]
  );
  const totalChapters = data.length;
  const completionPercentage =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;
  const allChaptersCompleted = completedChapters === totalChapters;

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCompletion = showCompleted ? true : !item.completed;
      return matchesSearch && matchesCompletion;
    });
  }, [data, searchQuery, showCompleted]);

  /** ---------------- Actions ---------------- */
  const toggle = (id: string | number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const toggleCompletion = async (id: TrainingItem["id"]) => {
    if (isAdmin) return;

    const current = data.find((x) => x.id === id);
    if (!current) return;

    const nextCompleted = !current.completed;

    // optimistic update
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: nextCompleted } : item
      )
    );

    try {
      await updateProgress(id, {
        completed: nextCompleted,
        lastAccessed: new Date().toISOString(),
      });

      setUserProgress((prevProgress) => ({
        ...prevProgress,
        completedChapters: nextCompleted
          ? prevProgress.completedChapters + 1
          : Math.max(0, prevProgress.completedChapters - 1),
        lastActive: new Date(),
      }));
    } catch (e: any) {
      // rollback
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, completed: current.completed } : item
        )
      );
      setError(e?.body?.error || e?.message || "Failed to update progress");
    }
  };

  const markAllAsCompleted = async () => {
    // Optional: Could call backend in bulk later. For now, local.
    setData((prev) => prev.map((item) => ({ ...item, completed: true })));
    setUserProgress((prev) => ({
      ...prev,
      completedChapters: totalChapters,
      lastActive: new Date(),
    }));
  };

  const resetProgress = async () => {
    // Optional: Could call backend in bulk later. For now, local.
    setData((prev) => prev.map((item) => ({ ...item, completed: false })));
    setUserProgress((prev) => ({
      ...prev,
      completedChapters: 0,
      lastActive: new Date(),
    }));
  };

  const markAsWatched = async (id: TrainingItem["id"]) => {
    // if (!canUpdateProgress(role)) return;

    const current = data.find((x) => x.id === id);
    if (!current) return;
    if (current.completed) return;

    // optimistic
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, completed: true, lastAccessed: new Date() }
          : item
      )
    );

    try {
      await updateProgress(id, {
        completed: true,
        lastAccessed: new Date().toISOString(),
      });

      setUserProgress((prevProgress) => ({
        ...prevProgress,
        completedChapters: prevProgress.completedChapters + 1,
        lastActive: new Date(),
      }));
    } catch (e: any) {
      setError(e?.body?.error || e?.message || "Failed to mark as watched");
    }
  };

  const handleCompleteAll = () => {
    if (allChaptersCompleted) {
      alert(
        "🎉 Congratulations! You've completed all chapters! Your certificate will be generated shortly."
      );
    }
  };

  /** ---------------- CRUD modal ---------------- */
  const openAddModal = () => {
    if (!isAdmin) return;

    setEditingItem(null);
    setForm({
      title: "",
      type: "video",
      src: "",
    });
    setShowModal(true);
  };


  const openEditModal = (item: TrainingItem) => {
    if (!isAdmin) return;

    setEditingItem(item);
    setForm({
      title: item.title,
      type: item.type,
      src: item.src,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    if (!form.title) return;

    try {
      setError(null);

      const src = form.src;

      if (!src) {
        setError("Please Enter the URL(src) before saving.");
        return;
      }

      const payload = { title: form.title, type: form.type, src };

      if (editingItem) {
        const updated = normalizeTrainingItem(
          await updateChapter(editingItem.id, payload)
        );
        setData((prev) =>
          prev.map((it) => (it.id === editingItem.id ? updated : it))
        );
        setOpenId(updated.id as any);
      } else {
        const created = normalizeTrainingItem(await createChapter(payload));
        setData((prev) => [...prev, created]);
        setOpenId(created.id as any);
      }

      setShowModal(false);
      setEditingItem(null);
      setForm({ title: "", type: "video", src: "" });
    } catch (e: any) {
      setError(e?.body?.error || e?.message || "Failed to save chapter");
    }
  };

  const confirmDelete = async () => {
    if (!isAdmin) return;
    if (!deleteTarget) return;

    const target = deleteTarget;
    setDeleteTarget(null);

    // optimistic remove
    setData((prev) => prev.filter((it) => it.id !== target.id));

    try {
      await deleteChapterApi(target.id);
    } catch (e: any) {
      // rollback
      setData((prev) => [...prev, target]);
      setError(e?.body?.error || e?.message || "Failed to delete chapter");
    }
  };

  if (loading)
    return (
      <div className="h-full w-full">
        <Loader />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 px-3 sm:px-4 md:px-6 py-4">
      {error && (
        <div className="max-w-7xl mx-auto mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto mb-4 sm:mb-6"
      >
        <div className="app-card rounded-xl sm:rounded-2xl shadow-lg shadow-blue-100/30 p-4 sm:p-6">
          {/* Top Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-purple-400 to-pink-400 rounded-xl blur opacity-20"></div>
                <div className="relative bg-linear-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </motion.div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl md:text-2xl  font-bold app-text">
                    Training Portal
                  </h1>
                  <div className="px-2 py-1 bg-linear-to-r from-purple-100 to-pink-100 rounded-lg">
                    <span className="text-xs  font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      TRAINING
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:label-text app-text mt-1">
                  Interactive learning materials and resources
                </p>
              </div>
            </div>

            {/* Breadcrumb Navigation - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-2 app-card px-4 py-3 rounded-xl border app-border">
              <Link
                href="/aca/dashboard"
                className="flex items-center gap-2 app-text hover:text-purple-600 transition-colors duration-100 group"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-100" />
                <span className="label-text  font-medium group-hover:text-purple-600 transition-colors duration-100">
                  Home
                </span>
              </Link>

              <ChevronRight className="w-4 h-4 app-text mx-1" />

              <div className="flex items-center gap-2 text-purple-600">
                <BookOpen className="w-4 h-4" />
                <span className="label-text  font-bold">Training</span>
              </div>
            </div>
          </div>

          {/* Progress Bar Section */}
          <div className="mt-6 sm:mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className=" font-bold app-text">
                  Learning Progress
                </h3>
              </div>
              <div className="label-text app-text">
                <span className=" font-bold text-purple-600">
                  {completedChapters}
                </span>{" "}
                of{" "}
                <span className=" font-bold app-text">
                  {totalChapters}
                </span>{" "}
                chapters
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="h-3 sm:h-4 app-card rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-linear-to-r from-purple-500 via-pink-500 to-orange-500 shadow-lg"
                />
              </div>

              {/* Progress Indicators */}
              <div className="absolute top-0 left-0 w-full h-3 sm:h-4 flex items-center justify-between px-2">
                {[0, 25, 50, 75, 100].map((percent) => (
                  <div
                    key={percent}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                      completionPercentage >= percent
                        ? "bg-white shadow-lg"
                        : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Progress Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
              <div className="text-xs app-text">
                {completionPercentage}% • {totalChapters - completedChapters}{" "}
                remaining
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={markAllAsCompleted}
                  className="text-xs px-3 py-1 bg-linear-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-lg hover:shadow transition-all duration-100"
                >
                  Mark All
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetProgress}
                  className="text-xs px-3 py-1 bg-linear-to-r from-slate-50 to-gray-50 text-slate-700 rounded-lg hover:shadow transition-all duration-100"
                >
                  Reset
                </motion.button>
              </div>
            </div>
          </div>

          {/* Training Stats Row - Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-6">
            <div className="bg-linear-to-br from-blue-50 to-cyan-50 p-3 sm:p-4 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Total</div>
                <BookOpen className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl sm:text-2xl  font-bold text-slate-900 mt-1 sm:mt-2">
                {data.length}
              </div>
            </div>
            <div className="bg-linear-to-br from-purple-50 to-pink-50 p-3 sm:p-4 rounded-xl border border-purple-100">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Completed</div>
                <CheckCircle className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-xl sm:text-2xl  font-bold text-slate-900 mt-1 sm:mt-2">
                {completedChapters}
              </div>
            </div>
            <div className="bg-linear-to-br from-emerald-50 to-teal-50 p-3 sm:p-4 rounded-xl border border-emerald-100">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Time Spent</div>
                <Clock className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl sm:text-2xl  font-bold text-slate-900 mt-1 sm:mt-2">
                {userProgress.totalTimeSpent}m
              </div>
            </div>
            <div className="bg-linear-to-br from-amber-50 to-orange-50 p-3 sm:p-4 rounded-xl border border-amber-100">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Streak</div>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl sm:text-2xl  font-bold text-slate-900 mt-1 sm:mt-2">
                {userProgress.streakDays} days
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-7xl mx-auto"
      >
        <div className="app-card rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl shadow-blue-100/50 p-4 sm:p-6 md:p-8">
          {/* Header with Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-br from-purple-500 to-pink-500 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl">
                <BookOpen className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl  font-bold app-text">
                  Training Materials
                </h2>
                <p className="text-xs sm:label-text app-text mt-1">
                  {filteredData.length} chapters • {completedChapters} completed
                </p>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2  h-3 w-3 app-muted" />
                <input
                  type="text"
                  placeholder="Search chapters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-1.5 border app-border rounded-xl placeholder:text-[14px] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-100 w-full"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className={`px-3 sm:px-4 py-2.5 rounded-xl font-medium transition-all duration-100 flex items-center gap-2 flex-1 sm:flex-none justify-center ${
                    showCompleted
                      ? "bg-linear-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {showCompleted ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Completed</span>
                </button>

                {isAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openAddModal}
                    className="px-4 sm:px-6 py-2.5 rounded-xl  font-medium bg-linear-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-200 transition-all duration-100 flex items-center gap-2 flex-1 sm:flex-none justify-center"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add Chapter</span>
                    <span className="sm:hidden">Add</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Completion Banner */}
          {allChaptersCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 sm:mb-6 p-3 sm:p-4 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl sm:rounded-2xl"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-linear-to-br from-emerald-500 to-teal-500 p-2 sm:p-3 rounded-xl">
                    <Award className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className=" font-bold text-emerald-900 label-text sm:text-base">
                      🎉 Training Completed!
                    </h3>
                    <p className="text-xs sm:label-text text-emerald-700">
                      All {totalChapters} chapters completed
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCompleteAll}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl  font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all duration-100 flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <Download className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span className="label-text">Get Certificate</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Training Materials List */}
          <div className="space-y-3">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => {
                const isOpen = openId === item.id;

                return (
                  <motion.div
                    key={String(item.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{
                      scale: 1.01,
                      y: -2,
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                    }}
                    className={`group relative bg-white border rounded-xl sm:rounded-2xl transition-all duration-150 hover:border-purple-200
                      ${
                        isOpen
                          ? "border-purple-300 bg-linear-to-r from-purple-50/30 via-white to-white"
                          : "border border-slate-200"
                      }
                      ${
                        item.completed ? "border-l-4 border-l-emerald-500" : ""
                      }`}
                  >
                    {/* Header */}
                    <div
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 sm:px-6
                      ${
                        isOpen
                          ? "bg-linear-to-r from-purple-50/50 to-transparent"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {/* Completion Checkbox */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleCompletion(item.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-100 ${
                            item.completed
                              ? "bg-linear-to-br from-emerald-500 to-teal-500"
                              : "bg-slate-100 hover:bg-slate-200"
                          }`}
                          title={
                            !isAdmin ? "Toggle completion" : "Login required"
                          }
                        >
                          {item.completed && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring" }}
                            >
                              <CheckCircle className="w-5 h-5 text-white" />
                            </motion.div>
                          )}
                        </motion.button>

                        <button
                          onClick={() => toggle(item.id)}
                          className="flex items-center gap-3 text-left flex-1 group/button"
                        >
                          {isOpen ? (
                            <motion.div
                              animate={{ rotate: 180 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown
                                className="text-purple-500 group-hover/button:text-purple-600 transition-colors duration-100"
                                size={20}
                              />
                            </motion.div>
                          ) : (
                            <ChevronRight
                              className="text-purple-500 group-hover/button:text-purple-600 transition-colors duration-100"
                              size={20}
                            />
                          )}

                          <div className="flex items-center gap-3 sm:gap-4 flex-1">
                            <div
                              className={`hidden xs:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-xl font-bold shadow-sm ${
                                item.completed
                                  ? "bg-linear-to-br from-emerald-100 to-teal-100 text-emerald-700"
                                  : "bg-linear-to-br from-purple-100 to-pink-100 text-purple-700"
                              }`}
                            >
                              {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-800  font-bold text-base sm:text-[16px] text-[14px] truncate">
                                  {item.title}
                                </span>
                                {item.completed && (
                                  <span className="hidden sm:inline px-2 py-0.5 bg-linear-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs  font-medium rounded-lg">
                                    COMPLETED
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div
                                  className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                                    item.type === "video"
                                      ? "bg-red-50 text-red-700"
                                      : item.type === "pdf"
                                      ? "bg-blue-50 text-blue-700"
                                      : "bg-emerald-50 text-emerald-700"
                                  }`}
                                >
                                  {item.type.toUpperCase()}
                                </div>
                                {item.completed && (
                                  <span className="sm:hidden px-2 py-0.5 bg-linear-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs  font-medium rounded-lg">
                                    DONE
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-0 sm:ml-4 mt-3 sm:mt-0">
                        {item.type === "video" && !item.completed && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => markAsWatched(item.id)}
                            className="px-3 py-2 rounded-lg bg-linear-to-r from-blue-50 to-cyan-50 text-blue-700 hover:shadow transition-all duration-100 label-text  font-medium flex-1 sm:flex-none"
                          >
                            <span className="hidden sm:inline">
                              Mark as Watched
                            </span>
                            <span className="sm:hidden">Watched</span>
                          </motion.button>
                        )}

                        {/* ✅ CEO only edit/delete */}
                        {isAdmin && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-lg bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-600 transition-all duration-100 group/edit flex-1 sm:flex-none justify-center"
                          >
                            <Pencil
                              size={18}
                              className="mx-auto group-hover/edit:scale-110 transition-transform duration-100"
                            />
                          </motion.button>
                        )}
                        {isAdmin && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setDeleteTarget(item)}
                            className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-all duration-100 group/delete flex-1 sm:flex-none justify-center"
                          >
                            <Trash2
                              size={18}
                              className="mx-auto group-hover/delete:scale-110 transition-transform duration-100"
                            />
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-3 sm:p-4 sm:px-6 border-t border-slate-100"
                      >
                        {item.type === "video" && (
                          <div className="relative group/video">
                            <iframe
                              src={item.src}
                              className="w-full h-75 sm:h-100 md:h-125 rounded-xl border-4 border-white shadow-lg"
                              title={item.title || "Video"}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          </div>
                        )}

                        {item.type === "image" && (
                          <div className="relative group/image">
                            <iframe
                              src={item.src}
                              className="w-full h-75 sm:h-100 md:h-125 rounded-xl border-4 border-white shadow-lg"
                              title={item.title || "image"}
                              allowFullScreen
                            />
                          </div>
                        )}

                        {item.type === "pdf" && (
                          <div className="relative group/pdf">
                            <iframe
                              src={item.src}
                              className="w-full h-75 sm:h-100 md:h-125 rounded-xl border-4 border-white shadow-lg"
                              title={item.title}
                            />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10 sm:py-16"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 app-muted" />
                </div>
                <h3 className="text-lg sm:text-xl  font-bold app-text mb-2">
                  No Training Materials Found
                </h3>
                <p className="label-text app-muted mb-6">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowCompleted(true);
                  }}
                  className="px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-xl  font-medium hover:shadow-lg hover:shadow-purple-200 transition-all duration-100 label-text sm:text-base"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </div>

          {/* Summary Footer */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t app-border">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-linear-to-r from-emerald-500 to-teal-500"></div>
                  <span className="label-text app-text">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-linear-to-r from-purple-500 to-pink-500"></div>
                  <span className="label-text app-text">In Progress</span>
                </div>
              </div>

              <div className="label-text app-text text-center sm:text-right">
                <span className=" font-bold app-text">
                  {userProgress.totalTimeSpent}m
                </span>{" "}
                total •
                <span className=" font-bold app-text ml-2">
                  {userProgress.streakDays} day
                </span>{" "}
                streak
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 app-surface flex items-center justify-center z-50 p-3 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25 }}
            className="app-card w-full max-w-md rounded-2xl p-4 sm:p-6 shadow-2xl mx-3"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-linear-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
                  {editingItem ? (
                    <Pencil className="w-5 h-5 text-white" />
                  ) : (
                    <Plus className="w-5 h-5 text-white" />
                  )}
                </div>
                <h3 className="text-lg sm:text-xl  font-bold text-slate-900">
                  {editingItem ? "Edit Chapter" : "Add Chapter"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-100"
              >
                <X className="w-5 h-5 app-text" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block label-text  font-medium app-text mb-2">
                  Chapter Title
                </label>
                <input
                  placeholder="Enter chapter title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-100"
                />
              </div>

              <div>
                <label className="block label-text  font-medium text-slate-700 mb-2">
                  Content Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as TrainingType })
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-100"
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="image">Image</option>
                </select>
              </div>

              <div>
                <label className="block label-text  font-medium text-slate-700 mb-2">
                  Enter URL
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 sm:p-6 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-100">
                  <input
                    placeholder="Enter URL"
                    value={form.src}
                    onChange={(e) => setForm({ ...form, src: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-100"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 label-text rounded-xl  font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all duration-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-3 label-text rounded-xl  font-medium bg-linear-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-200 transition-all duration-100"
                >
                  {editingItem ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 app-card flex items-center justify-center z-50 p-3 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-white w-full max-w-sm rounded-2xl p-4 sm:p-6 shadow-2xl mx-3"
          >
            <div className="text-center mb-4">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-linear-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                <Trash2 className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" />
              </div>
              <h3 className="text-lg sm:text-xl  font-bold text-slate-900 mb-2">
                Delete Chapter
              </h3>
            </div>

            <p className="label-text text-slate-600 text-center mb-6">
              Delete{" "}
              <span className=" font-bold text-slate-900">
                {deleteTarget.title}
              </span>
              ?
              <br />
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-3 label-text rounded-xl  font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all duration-100"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 label-text rounded-xl  font-medium bg-linear-to-r from-red-600 to-orange-600 text-white hover:shadow-lg hover:shadow-red-200 transition-all duration-100"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
