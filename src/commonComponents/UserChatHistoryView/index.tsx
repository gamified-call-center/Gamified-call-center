"use client";

import React, { useEffect, useMemo, useState } from "react";
import apiClient from "@/Utils/apiClient";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MessageSquare,
  Search,
  Hash,
  User2,
  Users,
  Calendar,
  Clock,
  Filter,
  Sparkles,
  ArrowLeft,
  MessageCircle,
  CheckCircle,
  MoreVertical,
  Download,
  Copy,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";

type ThreadKind = "dm" | "channel";

type ThreadItem = {
  id: string;
  kind: ThreadKind;
  title?: string;
  memberCount?: number;
  unreadCount?: number;
  lastMessage?: string;
  timestamp?: string;
};

type MessageItem = {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  timestamp: string;
};

const formatTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
};

const formatFullDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

const KindIcon = ({ kind }: { kind: ThreadKind }) => {
  return kind === "channel" ? (
    <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm">
      <Hash className="h-5 w-5 text-white" />
    </div>
  ) : (
    <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 shadow-sm">
      <User2 className="h-5 w-5 text-white" />
    </div>
  );
};

const MessageAvatar = ({ name, kind }: { name?: string; kind?: ThreadKind }) => {
  const bgColor = kind === "channel" 
    ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
    : "bg-gradient-to-br from-blue-500 to-purple-500";
  
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`h-8 w-8 rounded-full ${bgColor} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
      {initials || "?"}
    </div>
  );
};

export default function UserChatHistoryView({ userId }: { userId: string }) {
  const router = useRouter();

  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [activeTab, setActiveTab] = useState<ThreadKind>("dm");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedThread, setSelectedThread] = useState<ThreadItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const loadThreads = async () => {
    if (!userId) return;
    setLoadingThreads(true);
    try {
      const url = `${apiClient.URLS.chat}/threads/?userId=${encodeURIComponent(
        userId
      )}`;
      const res: any = await apiClient.get(url);

      const list: any[] = res?.body ?? [];
      const mapped: ThreadItem[] = list.map((t) => ({
        id: t.id,
        kind: t.kind,
        title: t.title ?? (t.kind === "channel" ? "Channel" : "DM"),
        memberCount: t.memberCount ?? 0,
        unreadCount: t.unreadCount ?? 0,
        lastMessage: t.lastMessage ?? "",
        timestamp: t.timestamp ?? "",
      }));

      setThreads(mapped);

      // Auto-open first thread of active tab
      const first = mapped.find((x) => x.kind === activeTab);
      if (first && !selectedThread) openThread(first);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load threads");
    } finally {
      setLoadingThreads(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    if (!userId || !threadId) return;
    setLoadingMessages(true);
    try {
      const url =
        `${apiClient.URLS.chat}/threads/${threadId}/messages` +
        `?userId=${encodeURIComponent(userId)}&limit=200`;
      const res: any = await apiClient.get(url);

      const list = (res?.body?.data ?? res?.body ?? []) as any[];
      const mapped: MessageItem[] = list.map((m) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderId,
        senderName: m.senderName ?? "Unknown",
        timestamp: m.timestamp,
      }));

      setMessages(mapped);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  const openThread = async (t: ThreadItem) => {
    setSelectedThread(t);
    setMessages([]);
    await loadMessages(t.id);
  };

  const copyThreadId = () => {
    if (selectedThread) {
      navigator.clipboard.writeText(selectedThread.id);
      toast.success("Thread ID copied to clipboard!");
    }
  };

  useEffect(() => {
    if (!userId) return;
    loadThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const filteredThreads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return threads
      .filter((t) => t.kind === activeTab)
      .filter((t) => {
        if (!q) return true;
        const hay = `${t.title ?? ""} ${t.lastMessage ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
  }, [threads, activeTab, searchQuery]);

  const totalUnread = threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);
  const totalThreads = threads.length;

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Top Navigation */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="px-4 md:px-8 py-1">
          <div className="flex flex-col lg:flex-row md:items-center justify-between gap-2">
            {/* Left section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/chat-history")}
                className="group flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-100 hover:border-blue-200 transition-all duration-200 hover:shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                <span className="text-sm font-medium text-blue-700 group-hover:text-blue-800">
                  Back to Dashboard
                </span>
              </button>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>

                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Chat History Inspector
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-gray-600">
                      User ID:
                    </span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                      {userId}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                      Admin View
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right stats */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-4">
                <div className="text-center px-3 py-1 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                  <div className="text-sm font-semibold text-blue-700">
                    {totalThreads}
                  </div>
                  <div className="text-xs text-blue-600">Total Threads</div>
                </div>
                <div className="text-center px-3 py-1 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
                  <div className="text-sm font-semibold text-purple-700">
                    {totalUnread}
                  </div>
                  <div className="text-xs text-purple-600">Unread</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-4 md:px-4 pb-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Tabs */}
            <div className="flex flex-1 items-center gap-2 bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-1 rounded-2xl border border-gray-200">
              <button
                onClick={() => setActiveTab("dm")}
                className={`px-4 py-1 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === "dm"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <User2 className="w-4 h-4" />
                  Direct Messages
                </div>
              </button>

              <button
                onClick={() => setActiveTab("channel")}
                className={`flex-1 px-4 py-1 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === "channel"
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Channels
                </div>
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search threads..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 placeholder-gray-400"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Filter className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-156px)] flex flex-col md:flex-row overflow-hidden">
        {/* Threads Sidebar */}
        <div className="w-full md:w-96 border-r border-gray-100 bg-white/60 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                {activeTab === "dm" ? "Direct Messages" : "Channels"}
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {filteredThreads.length} found
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingThreads ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-600 mb-2">
                  No threads found
                </h3>
                <p className="text-sm text-gray-500">
                  Try changing your search or filters
                </p>
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isActive = selectedThread?.id === t.id;
                const isChannel = t.kind === "channel";

                return (
                  <button
                    key={t.id}
                    onClick={() => openThread(t)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 border ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200 shadow-sm"
                        : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <KindIcon kind={t.kind} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {t.title}
                          </h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTime(t.timestamp)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 truncate mt-1">
                          {t.lastMessage || "No messages yet"}
                        </p>

                        <div className="flex items-center gap-2 mt-3">
                          {isChannel && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Users className="w-3 h-3" />
                              {t.memberCount || 0}
                            </span>
                          )}

                          {t.unreadCount && t.unreadCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              <MessageCircle className="w-3 h-3" />
                              {t.unreadCount} unread
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <CheckCircle className="w-3 h-3" />
                              Read
                            </span>
                          )}

                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              isChannel
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {t.kind.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Messages Panel */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50/50">
          {!selectedThread ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Select a Conversation
                </h3>
                <p className="text-gray-500">
                  Choose a thread from the sidebar to view the complete chat
                  history and details.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 p-4 py-2 ">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-1">
                    <KindIcon kind={selectedThread.kind} />
                    <div>
                      <div className="flex items-center gap-1">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {selectedThread.title}
                        </h2>
                        {selectedThread.unreadCount &&
                          selectedThread.unreadCount > 0 && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {selectedThread.unreadCount} NEW
                            </span>
                          )}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {selectedThread.timestamp
                            ? formatFullDate(selectedThread.timestamp)
                            : "No date"}
                        </div>
                        {selectedThread.kind === "channel" && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            {selectedThread.memberCount || 0} members
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyThreadId}
                      className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                      title="Copy Thread ID"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span>View-only mode • Thread ID: {selectedThread.id}</span>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:text-blue-800 hover:from-blue-100 hover:to-blue-200 border border-blue-200 transition-all duration-200">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Export</span>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {loadingMessages ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex gap-3 animate-pulse"
                        style={{
                          flexDirection: i % 2 === 0 ? "row-reverse" : "row",
                        }}
                      >
                        <div className="h-10 w-10 rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div
                            className={`h-4 w-24 rounded ${
                              i % 2 === 0
                                ? "bg-blue-200 ml-auto"
                                : "bg-gray-200"
                            }`}
                          />
                          <div
                            className={`h-20 rounded-xl ${
                              i % 2 === 0
                                ? "bg-gradient-to-r from-blue-50 to-blue-100"
                                : "bg-gradient-to-r from-gray-100 to-gray-50"
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-4">
                      <MessageCircle className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-600 mb-2">
                      No messages yet
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                      This thread doesn't contain any messages. Start a
                      conversation to see messages here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className="flex items-start gap-3 group hover:bg-gray-50/50 p-3 rounded-2xl transition-colors"
                      >
                        <MessageAvatar
                          name={message.senderName}
                          kind={selectedThread.kind}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {message.senderName}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700">
                                {selectedThread.kind === "channel"
                                  ? "Channel Member"
                                  : "Direct"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {formatTime(message.timestamp)}
                              </span>
                              <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity">
                                <Copy className="w-3 h-3 text-gray-400" />
                              </button>
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl px-4 py-1 shadow-sm">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            Message ID: {message.id}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 border-t border-gray-100 bg-white/90 backdrop-blur-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {messages.length} messages • Read-only access
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Last updated: {formatTime(new Date().toISOString())}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}