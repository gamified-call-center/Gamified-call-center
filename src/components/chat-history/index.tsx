"use client";

import { useEffect, useState } from "react";
import apiClient from "@/Utils/apiClient";
import toast from "react-hot-toast";
import {
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquare,
  Home,
  Calendar,
  User,
} from "lucide-react";
import clsx from "clsx";

interface ChatMessage {
  id: string;
  createdAt: string;
  message: string;
  senderName: string;
  receiverName: string;
  receiverType: "USER" | "CHANNEL";
}

export default function ChatHistory() {
  const [data, setData] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const limit = 10;

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search,
        from: fromDate || undefined,
        to: toDate || undefined,
      };

      const res = await apiClient.get(apiClient.URLS.chatHistory, params, true);
      
      if (res.status === 200) {
        setData(res.body.items || []);
        setTotal(res.body.total || 0);
        setTotalPages(res.body.totalPages || 1);
      } else {
        toast.error("Failed to load chat history");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading chat history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory();
    }, 300); // 300ms debounce for search
    return () => clearTimeout(timer);
  }, [page, search, fromDate, toDate]);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length && data.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((d) => d.id)));
    }
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm("Are you sure you want to delete selected messages?")) return;

    try {
      const res = await apiClient.post(
        apiClient.URLS.chatHistoryDelete,
        { ids: Array.from(selectedIds) },
        true
      );
      if (res.status === 200 || res.status === 201) {
        toast.success(`Deleted ${res.body.deleted} messages`);
        setSelectedIds(new Set());
        fetchHistory();
      } else {
        toast.error("Failed to delete messages");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting messages");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gradient-to-br min-h-screen">
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div className="flex items-center justify-center gap-2">
      <a
        href="/aca/dashboard"
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-white hover:to-blue-50 transition-all duration-300 group shadow-sm hover:shadow"
      >
        <Home className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors duration-300">
          Home
        </span>
      </a>

      <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />

      <div className="flex items-center gap-3 px-5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
        <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
          Chat History
        </span>
      </div>
    </div>

    {selectedIds.size > 0 && (
      <button
        onClick={handleDelete}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 text-red-700 hover:from-red-100 hover:to-red-200 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300 hover:shadow-sm"
      >
        <Trash2 className="w-4 h-4" />
        Delete Selected ({selectedIds.size})
      </button>
    )}
  </div>

  {/* Filters */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
    <div className="md:col-span-2 relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        type="text"
        placeholder="Search messages, users, or channels..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
      />
    </div>

    <div className="relative">
      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        type="date"
        value={fromDate}
        onChange={(e) => {
          setFromDate(e.target.value);
          setPage(1);
        }}
        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
      />
    </div>

    <div className="relative">
      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        type="date"
        value={toDate}
        onChange={(e) => {
          setToDate(e.target.value);
          setPage(1);
        }}
        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
      />
    </div>
  </div>

  {/* Table */}
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-700">
        <thead className="bg-gradient-to-r from-gray-100 to-blue-50/50 text-xs uppercase font-semibold text-gray-700">
          <tr>
            <th className="p-4 w-12">
              <input
                type="checkbox"
                checked={data.length > 0 && selectedIds.size === data.length}
                onChange={toggleSelectAll}
                className="rounded border-gray-400 bg-white text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-colors"
              />
            </th>
            <th className="p-4 w-48 text-blue-800">Time</th>
            <th className="p-4 min-w-[300px] text-blue-800">Message</th>
            <th className="p-4 w-56 text-blue-800">Sender</th>
            <th className="p-4 w-56 text-blue-800">Receiver</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200/60">
          {loading ? (
            <tr>
              <td colSpan={5} className="p-10 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                  <span className="text-gray-600 text-sm">Loading messages...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-10 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-gray-700 font-medium">No messages found</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {search || fromDate || toDate 
                        ? "Try adjusting your filters" 
                        : "Start a conversation to see messages here"}
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            data.map((msg, index) => (
              <tr
                key={msg.id}
                className={`transition-colors ${
                  selectedIds.has(msg.id)
                    ? "bg-gradient-to-r from-blue-50/70 to-blue-100/30"
                    : index % 2 === 0
                    ? "bg-gray-50/50"
                    : "bg-white"
                } hover:bg-blue-50/50`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(msg.id)}
                    onChange={() => toggleSelect(msg.id)}
                    className="rounded border-gray-400 bg-white text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-colors"
                  />
                </td>

                <td className="p-4">
                  <div className="font-medium text-gray-900 whitespace-nowrap text-sm bg-gray-100/50 px-3 py-1.5 rounded-lg inline-block">
                    {msg.createdAt
                      ? new Intl.DateTimeFormat("en-CA", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                          .format(new Date(msg.createdAt))
                          .replace(",", " |")
                      : "-"}
                  </div>
                </td>

                <td className="p-4">
                  <div
                    className="line-clamp-2 text-gray-800 hover:text-gray-900 cursor-pointer transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100/50"
                    title={msg.message}
                  >
                    {msg.message}
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">
                      {msg.senderName}
                    </span>
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      msg.receiverType === "CHANNEL"
                        ? "bg-gradient-to-br from-emerald-100 to-emerald-50"
                        : "bg-gradient-to-br from-purple-100 to-purple-50"
                    }`}>
                      {msg.receiverType === "CHANNEL" ? (
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <User className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      {msg.receiverType === "CHANNEL" && (
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-0.5">
                          Channel
                        </span>
                      )}
                      <span className="text-gray-800 font-medium">
                        {msg.receiverName}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50/30">
      <div className="text-sm text-gray-600">
        Page <span className="font-semibold text-gray-800">{page}</span> of{" "}
        <span className="font-semibold text-gray-800">{totalPages}</span> • Total{" "}
        <span className="font-semibold text-gray-800">{total}</span> items
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="p-2.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
        >
          <ChevronLeft className="w-4 h-4 text-gray-700" />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 3) {
              pageNum = i + 1;
            } else if (page <= 2) {
              pageNum = i + 1;
            } else if (page >= totalPages - 1) {
              pageNum = totalPages - 2 + i;
            } else {
              pageNum = page - 1 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  page === pageNum
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || loading}
          className="p-2.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
        >
          <ChevronRight className="w-4 h-4 text-gray-700" />
        </button>
      </div>
    </div>
  </div>
</div>
  );
}
