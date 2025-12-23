"use client";

import { useState } from "react";
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
  Star,
  Target,
  Search,
  AlertCircle,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

type TrainingType = "video" | "image" | "pdf";

type TrainingItem = {
  id: number;
  title: string;
  type: TrainingType;
  src: string;
  completed?: boolean;
  viewedTime?: number;
  lastAccessed?: Date;
};

// Mock user progress
type UserProgress = {
  userId: string;
  completedChapters: number;
  totalTimeSpent: number;
  streakDays: number;
  lastActive: Date;
};

const initialData: TrainingItem[] = [
  {
    id: 1,
    title: "Chase Data Agent Training",
    type: "video",
    src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    completed: true,
    viewedTime: 2700,
    lastAccessed: new Date("2024-12-20"),
  },
  {
    id: 2,
    title: "Sherpa Walkthrough",
    type: "pdf",
    src: "/PDF/GM Project Document.pdf",
    completed: false,
    viewedTime: 1200,
    lastAccessed: new Date("2024-12-21"),
  },
  {
    id: 3,
    title: "Advanced Sales Techniques",
    type: "video",
    src: "https://www.youtube.com/embed/9bZkp7q19f0",
    completed: false,
    lastAccessed: new Date("2024-12-19"),
  },
  {
    id: 4,
    title: "Customer Service Best Practices",
    type: "pdf",
    src: "/PDF/customer-service.pdf",
    completed: true,
    viewedTime: 1500,
    lastAccessed: new Date("2024-12-18"),
  },
  {
    id: 5,
    title: "Product Demo Images",
    type: "image",
    src: "/images/product-demo.jpg",
    completed: false,
    lastAccessed: new Date("2024-12-17"),
  },
  {
    id: 6,
    title: "Compliance Guidelines 2025",
    type: "pdf",
    src: "/PDF/compliance.pdf",
    completed: false,
    lastAccessed: new Date("2024-12-16"),
  },
  {
    id: 7,
    title: "Team Collaboration Workshop",
    type: "video",
    src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    completed: true,
    viewedTime: 3000,
    lastAccessed: new Date("2024-12-15"),
  },
  {
    id: 8,
    title: "Market Analysis Report",
    type: "pdf",
    src: "/PDF/market-analysis.pdf",
    completed: false,
    lastAccessed: new Date("2024-12-14"),
  },
  {
    id: 9,
    title: "Soft Skills Development",
    type: "video",
    src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    completed: true,
    viewedTime: 3300,
    lastAccessed: new Date("2024-12-13"),
  },
  {
    id: 10,
    title: "Quarterly Performance Review",
    type: "pdf",
    src: "/PDF/performance-review.pdf",
    completed: false,
    lastAccessed: new Date("2024-12-12"),
  },
];

export default function TrainingPage() {
  const [data, setData] = useState<TrainingItem[]>(initialData);
  const [openId, setOpenId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrainingItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState<boolean>(true);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TrainingItem | null>(null);

  const [form, setForm] = useState({
    title: "",
    type: "video" as TrainingType,
    src: "",
  });

  // User progress state
  const [userProgress, setUserProgress] = useState<UserProgress>({
    userId: "user_001",
    completedChapters: 4,
    totalTimeSpent: 120,
    streakDays: 7,
    lastActive: new Date(),
  });

  // Calculate completion percentage
  const completedChapters = data.filter(item => item.completed).length;
  const totalChapters = data.length;
  const completionPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  // Check if all chapters are completed
  const allChaptersCompleted = completedChapters === totalChapters;

  // Filter data based on search
  const filteredData = data.filter(item => {
    const matchesSearch = searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCompletion = showCompleted ? true : !item.completed;

    return matchesSearch && matchesCompletion;
  });

  // Toggle chapter completion
  const toggleCompletion = (id: number) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        const newCompleted = !item.completed;
        setUserProgress(prevProgress => ({
          ...prevProgress,
          completedChapters: newCompleted ?
            prevProgress.completedChapters + 1 :
            prevProgress.completedChapters - 1,
          lastActive: new Date(),
        }));
        return { ...item, completed: newCompleted };
      }
      return item;
    }));
  };

  // Mark all as completed
  const markAllAsCompleted = () => {
    setData(prev => prev.map(item => ({ ...item, completed: true })));
    setUserProgress(prev => ({
      ...prev,
      completedChapters: totalChapters,
      lastActive: new Date(),
    }));
  };

  // Reset all progress
  const resetProgress = () => {
    setData(prev => prev.map(item => ({ ...item, completed: false })));
    setUserProgress(prev => ({
      ...prev,
      completedChapters: 0,
      lastActive: new Date(),
    }));
  };

  // Mark as completed after video view
  const markAsWatched = (id: number) => {
    setData(prev => prev.map(item => {
      if (item.id === id && item.type === "video") {
        const isCompleted = !item.completed;
        if (isCompleted) {
          setUserProgress(prevProgress => ({
            ...prevProgress,
            completedChapters: prevProgress.completedChapters + 1,
            lastActive: new Date(),
          }));
        }
        return {
          ...item,
          completed: isCompleted,
          lastAccessed: new Date()
        };
      }
      return item;
    }));
  };

  // Complete all chapters
  const handleCompleteAll = () => {
    if (allChaptersCompleted) {
      alert("🎉 Congratulations! You've completed all chapters! Your certificate will be generated shortly.");
    }
  };

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  /* ------------------ CRUD LOGIC ------------------ */

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      title: "",
      type: "video",
      src: "",
    });
    setFile(null);
    setShowModal(true);
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Upload failed");
    }

    return data.url;
  };

  const handleFileChange = async (file: File) => {
    setFile(file);

    try {
      const uploadedUrl = await uploadFile(file);
      setForm((prev) => ({ ...prev, src: uploadedUrl }));
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (item: TrainingItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      type: item.type,
      src: item.src,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || (!file && !editingItem)) return;

    try {
      let uploadedUrl = form.src;

      if (file) {
        uploadedUrl = await uploadFile(file);
      }

      const newId = editingItem ? editingItem.id : Date.now();

      const newItem: TrainingItem = {
        id: newId,
        title: form.title,
        type: form.type,
        src: uploadedUrl,
        completed: false,
        lastAccessed: new Date(),
      };

      setData((prev) => {
        if (editingItem) {
          return prev.map((item) =>
            item.id === editingItem.id ? newItem : item
          );
        } else {
          return [...prev, newItem];
        }
      });

      setShowModal(false);
      setFile(null);
      setForm({
        title: "",
        type: "video",
        src: "",
      });
      setOpenId(newId);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    setData((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 px-3 sm:px-4 md:px-6 py-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto mb-4 sm:mb-6"
      >
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg shadow-blue-100/30 p-4 sm:p-6">
          {/* Top Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-linear-to-br from-purple-400 to-pink-400 rounded-xl blur opacity-20"></div>
                <div className="relative  from-purple-500 to-pink-500 p-3 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </motion.div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">Training Portal</h1>
                  <div className="px-2 py-1 bg-linear-to-r from-purple-100 to-pink-100 rounded-lg">
                    <span className="text-xs font-semibold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      TRAINING
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Interactive learning materials and resources
                </p>
              </div>
            </div>

            {/* Breadcrumb Navigation - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
              <Link
                href="/aca/dashboard"
                className="flex items-center gap-2 text-slate-700 hover:text-purple-600 transition-colors duration-100 group"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-100" />
                <span className="text-sm font-medium group-hover:text-purple-600 transition-colors duration-100">Home</span>
              </Link>

              <ChevronRight className="w-4 h-4 text-slate-400 mx-1" />

              <div className="flex items-center gap-2 text-purple-600">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-semibold">Training</span>
              </div>
            </div>
          </div>

          {/* Progress Bar Section */}
          <div className="mt-6 sm:mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-slate-900">Learning Progress</h3>
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-bold text-purple-600">{completedChapters}</span> of{" "}
                <span className="font-bold text-slate-900">{totalChapters}</span> chapters
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="h-3 sm:h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
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
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${completionPercentage >= percent
                      ? 'bg-white shadow-lg'
                      : 'bg-slate-300'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Progress Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
              <div className="text-xs text-slate-500">
                {completionPercentage}% • {totalChapters - completedChapters} remaining
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
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{data.length}</div>
            </div>
            <div className="bg-linear-to-br from-purple-50 to-pink-50 p-3 sm:p-4 rounded-xl border border-purple-100">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Completed</div>
                <CheckCircle className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{completedChapters}</div>
            </div>
            <div className="bg-linear-to-br from-emerald-50 to-teal-50 p-3 sm:p-4 rounded-xl border border-emerald-100">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Time Spent</div>
                <Clock className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{userProgress.totalTimeSpent}m</div>
            </div>
            <div className="bg-linear-to-br from-amber-50 to-orange-50 p-3 sm:p-4 rounded-xl border border-amber-100">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Streak</div>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{userProgress.streakDays} days</div>
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
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl shadow-blue-100/50 p-4 sm:p-6 md:p-8">
          {/* Header with Controls - Mobile Responsive */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-br from-purple-500 to-pink-500 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl">
                <BookOpen className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-xl font-bold text-slate-900">Training Materials</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {filteredData.length} chapters • {completedChapters} completed
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2  h-3 w-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search chapters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-1.5 border border-slate-300 rounded-xl placeholder:text-[14px] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-100 w-full"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className={`px-3 sm:px-4 py-1.5 rounded-xl font-medium transition-all md:text-[14px] text-[12px] duration-100 flex items-center gap-2 flex-1 sm:flex-none justify-center ${showCompleted
                    ? 'bg-linear-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  {showCompleted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="hidden sm:inline">Completed</span>
                </button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openAddModal}
                  className="px-2 sm:px-6 py-1.5 rounded-xl font-medium md:text-[14px] text-[12px] bg-linear-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-200 transition-all duration-100 flex items-center gap-2 flex-1 sm:flex-none justify-center"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Add Chapter</span>
                  <span className="sm:hidden">Add</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Completion Banner - Responsive */}
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
                    <h3 className="font-bold text-emerald-900 text-sm sm:text-base">🎉 Training Completed!</h3>
                    <p className="text-xs sm:text-sm text-emerald-700">
                      All {totalChapters} chapters completed
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCompleteAll}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all duration-100 flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <Download className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span className="text-sm">Get Certificate</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          <div className="space-y-3">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => {
                const isOpen = openId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{
                      scale: 1.01,
                      y: -2,
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)"
                    }}
                    className={`group relative bg-white border rounded-xl sm:rounded-2xl transition-all duration-150 hover:border-purple-200
                      ${isOpen ? "border-purple-300 bg-linear-to-r from-purple-50/30 via-white to-white" : "border border-slate-200"}
                      ${item.completed ? "border-l-4 border-l-emerald-500" : ""}`}
                  >
                    {/* Header - Mobile Responsive */}
                    <div
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:px-6
                      ${isOpen ? "bg-linear-to-r from-purple-50/50 to-transparent" : "bg-white"}`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {/* Completion Checkbox */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleCompletion(item.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-100 ${item.completed
                            ? 'bg-linear-to-br from-emerald-500 to-teal-500'
                            : 'bg-slate-100 hover:bg-slate-200'
                            }`}
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
                              <ChevronDown className="text-purple-500 group-hover/button:text-purple-600 transition-colors duration-100" size={20} />
                            </motion.div>
                          ) : (
                            <ChevronRight className="text-purple-500 group-hover/button:text-purple-600 transition-colors duration-100" size={20} />
                          )}

                          <div className="flex items-center gap-3 sm:gap-4 flex-1">
                            {/* Chapter Number - Hidden on small mobile */}
                            <div className={`hidden xs:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-xl font-bold shadow-sm ${item.completed
                              ? 'bg-linear-to-br from-emerald-100 to-teal-100 text-emerald-700'
                              : 'bg-linear-to-br from-purple-100 to-pink-100 text-purple-700'
                              }`}>
                              {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-800 font-semibold text-base sm:text-[16px] text-[14px] truncate">
                                  {item.title}
                                </span>
                                {item.completed && (
                                  <span className="hidden sm:inline px-2 py-0.5 bg-linear-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs font-medium rounded-lg">
                                    COMPLETED
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className={`px-2 py-0.5 rounded-lg text-xs font-medium ${item.type === 'video' ? 'bg-red-50 text-red-700' :
                                  item.type === 'pdf' ? 'bg-blue-50 text-blue-700' :
                                    'bg-emerald-50 text-emerald-700'
                                  }`}>
                                  {item.type.toUpperCase()}
                                </div>
                                {item.completed && (
                                  <span className="sm:hidden px-2 py-0.5 bg-linear-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs font-medium rounded-lg">
                                    DONE
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Actions - Stack on mobile */}
                      <div className="flex gap-2 ml-0 sm:ml-4 mt-3 sm:mt-0">
                        {item.type === "video" && !item.completed && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => markAsWatched(item.id)}
                            className="px-3 py-2 rounded-lg bg-linear-to-r from-blue-50 to-cyan-50 text-blue-700 hover:shadow transition-all duration-100 text-sm font-medium flex-1 sm:flex-none"
                          >
                            <span className="hidden sm:inline">Mark as Watched</span>
                            <span className="sm:hidden">Watched</span>
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEditModal(item)}
                          className="p-2 rounded-lg bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-600 transition-all duration-100 group/edit flex-1 sm:flex-none justify-center"
                        >
                          <Pencil size={18} className="mx-auto group-hover/edit:scale-110 transition-transform duration-100" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setDeleteTarget(item)}
                          className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-all duration-100 group/delete flex-1 sm:flex-none justify-center"
                        >
                          <Trash2 size={18} className="mx-auto group-hover/delete:scale-110 transition-transform duration-100" />
                        </motion.button>
                      </div>
                    </div>

                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-3 sm:p-4 sm:px-6 border-t border-slate-100"
                      >
                        {item.type === "video" && item.viewedTime && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-slate-600">Watch Progress</span>
                              <span className="text-sm font-medium text-slate-700">
                                {Math.round((item.viewedTime / (45 * 60)) * 100)}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-linear-to-r from-blue-500 to-cyan-500"
                                style={{ width: `${Math.round((item.viewedTime / (45 * 60)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Content Display - Responsive */}
                        {item.type === "image" && (
                          <div className="relative group/image">
                            <Image
                              src={item.src}
                              alt={item.title}
                              className="w-full h-auto max-h-75 sm:max-h-100 md:max-h-125 rounded-xl border-4 border-white shadow-lg object-contain mx-auto"
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

                        {item.type === "video" && (
                          <div className="relative group/video">
                            <video
                              controls
                              className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-xl border-4 border-white shadow-lg object-cover"
                              poster="/video-poster.jpg"
                              onTimeUpdate={(e) => {
                                const video = e.currentTarget;
                                const progress = (video.currentTime / video.duration) * 100;
                                if (progress > 90 && !item.completed) {
                                  toggleCompletion(item.id);
                                }
                              }}
                            >
                              <source src={item.src} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}

                        {/* Completion Note - Responsive */}
                        {!item.completed && (
                          <div className="mt-4 p-3 bg-linear-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-amber-700">
                                {item.type === "video"
                                  ? "Watch 90% of the video to complete this chapter."
                                  : item.type === "pdf"
                                    ? "Review the entire document to complete this chapter."
                                    : "View the image content to complete this chapter."}
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              // Empty State - Responsive
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10 sm:py-16"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">No Training Materials Found</h3>
                <p className="text-sm text-slate-500 mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowCompleted(true);
                  }}
                  className="px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-200 transition-all duration-100 text-sm sm:text-base"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </div>

          {/* Summary Footer - Responsive */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-linear-to-r from-emerald-500 to-teal-500"></div>
                  <span className="text-sm text-slate-600">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-linear-to-r from-purple-500 to-pink-500"></div>
                  <span className="text-sm text-slate-600">In Progress</span>
                </div>
              </div>

              <div className="text-sm text-slate-600 text-center sm:text-right">
                <span className="font-bold text-slate-900">{userProgress.totalTimeSpent}m</span> total •
                <span className="font-bold text-slate-900 ml-2">{userProgress.streakDays} day</span> streak
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ADD/EDIT MODAL - Responsive */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-white w-full max-w-md rounded-2xl p-4 sm:p-6 shadow-2xl mx-3"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-linear-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
                  {editingItem ? <Pencil className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {editingItem ? "Edit Chapter" : "Add Chapter"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Content Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as TrainingType,
                    })
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-100"
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="image">Image</option>
                </select>
              </div>

              {/* File Upload - Responsive */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload File
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 sm:p-6 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-100">
                  <input
                    type="file"
                    accept=".pdf,image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(file);
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      Click to upload file
                    </p>
                    <p className="text-xs text-slate-400">
                      PDF, Images, Videos
                    </p>
                  </label>
                </div>

                {file && (
                  <div className="mt-3 p-3 bg-linear-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <p className="text-sm text-emerald-700 font-medium truncate">
                      Selected: {file.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 text-sm rounded-xl font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all duration-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-3 text-sm rounded-xl font-medium bg-linear-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-200 transition-all duration-100"
                >
                  {editingItem ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* DELETE CONFIRMATION MODAL - Responsive */}
      {deleteTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4"
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
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                Delete Chapter
              </h3>
            </div>

            <p className="text-sm text-slate-600 text-center mb-6">
              Delete <span className="font-semibold text-slate-900">{deleteTarget.title}</span>?
              <br />
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-3 text-sm rounded-xl font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all duration-100"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 text-sm rounded-xl font-medium bg-linear-to-r from-red-600 to-orange-600 text-white hover:shadow-lg hover:shadow-red-200 transition-all duration-100"
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