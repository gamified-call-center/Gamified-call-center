"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MessageSquare,
  Users,
  MoreVertical,
  Pin,
  BellOff,
  Lock,
  Phone,
  Video,
  Send,
  Smile,
  Paperclip,
  Menu,
  X,
  CheckCheck,
} from "lucide-react";

/** =========================
 * Types
 * ========================= */
type PresenceStatus = "online" | "away" | "offline";

interface ChatUser {
  id: string;
  name: string;
  status: PresenceStatus;
  lastSeen?: string;
  unreadCount?: number;
  lastMessage?: string;
  timestamp?: string;
  isPinned?: boolean;
  isMuted?: boolean;
  avatarColor: string; // tailwind bg-* class
}

interface Channel {
  id: string;
  name: string;
  memberCount: number;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  isPrivate?: boolean;
  isPinned?: boolean;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isOwn: boolean;
}

/** =========================
 * Mock Data
 * ========================= */
const DIRECT_MESSAGES: ChatUser[] = [
  {
    id: "1",
    name: "Anna Mann",
    status: "online",
    unreadCount: 2,
    lastMessage: "Can you review the policy document?",
    timestamp: "10:30 AM",
    avatarColor: "bg-pink-500",
  },
  {
    id: "2",
    name: "Andre Triplett",
    status: "online",
    lastMessage: "Thanks for the update!",
    timestamp: "09:15 AM",
    isPinned: true,
    avatarColor: "bg-blue-500",
  },
  {
    id: "3",
    name: "Luigi Chafloque",
    status: "away",
    lastMessage: "Meeting at 3 PM",
    timestamp: "Yesterday",
    avatarColor: "bg-green-500",
  },
  {
    id: "4",
    name: "Ivan Ballin",
    status: "online",
    unreadCount: 1,
    lastMessage: "Premium calculation sent",
    timestamp: "10:22 AM",
    avatarColor: "bg-purple-500",
  },
  {
    id: "5",
    name: "Oluvaseun Cyriloye",
    status: "offline",
    lastMessage: "Will send by EOD",
    timestamp: "Tuesday",
    avatarColor: "bg-yellow-500",
  },
  {
    id: "6",
    name: "Shira Mitzmann",
    status: "online",
    lastMessage: "Approved ✅",
    timestamp: "10:00 AM",
    isMuted: true,
    avatarColor: "bg-red-500",
  },
  {
    id: "7",
    name: "Joseph Defalco",
    status: "away",
    lastMessage: "Need your signature",
    timestamp: "Monday",
    avatarColor: "bg-indigo-500",
  },
  {
    id: "8",
    name: "Norma Titcomb",
    status: "online",
    unreadCount: 5,
    lastMessage: "Urgent: Client waiting",
    timestamp: "10:45 AM",
    isPinned: true,
    avatarColor: "bg-teal-500",
  },
  {
    id: "9",
    name: "Krystal Arthur-Vining",
    status: "offline",
    lastMessage: "Documents received",
    timestamp: "Sunday",
    avatarColor: "bg-orange-500",
  },
  {
    id: "10",
    name: "Alex Defalco",
    status: "online",
    lastMessage: "Call me when free",
    timestamp: "10:20 AM",
    avatarColor: "bg-cyan-500",
  },
  {
    id: "11",
    name: "Monika Sylvester",
    status: "away",
    lastMessage: "See attached file",
    timestamp: "Yesterday",
    avatarColor: "bg-purple-500",
  },
];

const CHANNELS: Channel[] = [
  {
    id: "c1",
    name: "Team Alpha",
    memberCount: 12,
    lastMessage: "Anna: Deadline extended",
    timestamp: "10:25 AM",
    unreadCount: 3,
  },
  {
    id: "c2",
    name: "Client Updates",
    memberCount: 8,
    lastMessage: "New case assigned",
    timestamp: "09:45 AM",
    isPrivate: true,
  },
  {
    id: "c3",
    name: "Policy Reviews",
    memberCount: 15,
    lastMessage: "5 policies pending",
    timestamp: "Yesterday",
    isPinned: true,
  },
  {
    id: "c4",
    name: "Sales Team",
    memberCount: 20,
    lastMessage: "Monthly target achieved! 🎉",
    timestamp: "10:10 AM",
    unreadCount: 12,
  },
  {
    id: "c5",
    name: "Support",
    memberCount: 6,
    lastMessage: "System maintenance at 2 AM",
    timestamp: "Monday",
  },
  {
    id: "c6",
    name: "Managers",
    memberCount: 5,
    lastMessage: "Budget meeting tomorrow",
    timestamp: "Tuesday",
    isPrivate: true,
    isPinned: true,
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    content: "Hey there! How's the project going?",
    senderId: "1",
    senderName: "Anna Mann",
    timestamp: "10:25 AM",
    isOwn: false,
  },
  {
    id: "m2",
    content: "Going well! Just finished the policy review.",
    senderId: "me",
    senderName: "You",
    timestamp: "10:27 AM",
    isOwn: true,
  },
  {
    id: "m3",
    content: "Great! Can you send me the updated document?",
    senderId: "1",
    senderName: "Anna Mann",
    timestamp: "10:28 AM",
    isOwn: false,
  },
  {
    id: "m4",
    content: "Sure, I'll send it in the next 30 minutes.",
    senderId: "me",
    senderName: "You",
    timestamp: "10:30 AM",
    isOwn: true,
  },
  {
    id: "m5",
    content: "Perfect, thanks!",
    senderId: "1",
    senderName: "Anna Mann",
    timestamp: "10:30 AM",
    isOwn: false,
  },
];

/** =========================
 * Helpers
 * ========================= */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}

function getStatusColor(status: PresenceStatus) {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    case "offline":
    default:
      return "bg-gray-400";
  }
}

function getStatusText(status: PresenceStatus) {
  switch (status) {
    case "online":
      return "Online";
    case "away":
      return "Away";
    case "offline":
    default:
      return "Offline";
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

/** =========================
 * Component
 * ========================= */
export default function ChatPanel() {
  const isMobile = useIsMobile(768);

  const [activeTab, setActiveTab] = useState<"chats" | "channels">("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(
    DIRECT_MESSAGES[0]
  );
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const filteredUsers = useMemo(
    () =>
      DIRECT_MESSAGES.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const filteredChannels = useMemo(
    () =>
      CHANNELS.filter((channel) =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  // Auto close drawer when switching to desktop
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isMobile) setIsMobileSidebarOpen(false);
  }, [isMobile]);

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const activeTitle = selectedChat
    ? selectedChat.name
    : selectedChannel
      ? selectedChannel.name
      : "";

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    if (!selectedChat && !selectedChannel) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const msg: Message = {
      id: String(Date.now()),
      content: newMessage.trim(),
      senderId: "me",
      senderName: "You",
      timestamp: time,
      isOwn: true,
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100dvh-0px)] overflow-hidden bg-gray-50">
      {/* MOBILE: top-left burger */}
      {isMobile && (
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-200"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
      )}

      <div className="flex h-full">
        {/* ========================= Sidebar ========================= */}
        {/* Desktop: in-flow */}
        {!isMobile && (
          <div className="w-80 md:w-96 shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
            <SidebarContent
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearchFocused={isSearchFocused}
              setIsSearchFocused={setIsSearchFocused}
              filteredUsers={filteredUsers}
              filteredChannels={filteredChannels}
              selectedChat={selectedChat}
              selectedChannel={selectedChannel}
              onSelectChat={(u) => {
                setSelectedChat(u);
                setSelectedChannel(null);
              }}
              onSelectChannel={(c) => {
                setSelectedChannel(c);
                setSelectedChat(null);
              }}
            />
          </div>
        )}

        {/* Mobile: overlay drawer */}
        {isMobile && (
          <AnimatePresence>
            {isMobileSidebarOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 z-40 bg-black/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileSidebarOpen(false)}
                />

                {/* Drawer */}
                <motion.div
                  className="fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 flex flex-col shadow-2xl"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                >
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-800">
                          Chat History
                        </p>
                        <p className="text-xs text-gray-500">
                          Connect with your team
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                      aria-label="Close sidebar"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <SidebarContent
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isSearchFocused={isSearchFocused}
                    setIsSearchFocused={setIsSearchFocused}
                    filteredUsers={filteredUsers}
                    filteredChannels={filteredChannels}
                    selectedChat={selectedChat}
                    selectedChannel={selectedChannel}
                    onSelectChat={(u) => {
                      setSelectedChat(u);
                      setSelectedChannel(null);
                      setIsMobileSidebarOpen(false);
                    }}
                    onSelectChannel={(c) => {
                      setSelectedChannel(c);
                      setSelectedChat(null);
                      setIsMobileSidebarOpen(false);
                    }}
                    showProfileFooter={true}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        )}

        {/* ========================= Chat Window ========================= */}
        <div className="flex-1 min-w-0 flex flex-col h-full">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
            {(selectedChat || selectedChannel) ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedChat ? (
                    <div className="relative shrink-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white ${selectedChat.avatarColor}`}
                      >
                        <span className="text-base font-semibold">
                          {initials(selectedChat.name)}
                        </span>
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                          selectedChat.status
                        )}`}
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="text-base md:text-lg font-bold text-gray-900 truncate">
                      {activeTitle}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500 truncate">
                      {selectedChat
                        ? getStatusText(selectedChat.status)
                        : `${selectedChannel?.memberCount ?? 0} members`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                  {selectedChat && (
                    <>
                      <IconBtn label="Call">
                        <Phone className="w-5 h-5 text-gray-700" />
                      </IconBtn>
                      <IconBtn label="Video">
                        <Video className="w-5 h-5 text-gray-700" />
                      </IconBtn>
                    </>
                  )}
                  <IconBtn label="More">
                    <MoreVertical className="w-5 h-5 text-gray-700" />
                  </IconBtn>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Select a chat to start messaging
                  </h2>
                  <p className="text-sm text-gray-500">
                    Choose a conversation or channel from the sidebar
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
            {(selectedChat || selectedChannel) ? (
              <div className="space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={[
                        "max-w-[80%] md:max-w-[65%] rounded-2xl px-4 py-3 shadow-sm",
                        m.isOwn
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-tr-md"
                          : "bg-gray-100 text-gray-900 rounded-tl-md",
                      ].join(" ")}
                    >
                      {!m.isOwn && (
                        <p className="text-[11px] font-semibold mb-1 opacity-70">
                          {m.senderName}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </p>
                      <div
                        className={`mt-2 flex items-center justify-end gap-1 text-[11px] ${m.isOwn ? "text-blue-100" : "text-gray-500"
                          }`}
                      >
                        <span>{m.timestamp}</span>
                        {m.isOwn && (
                          <span className="opacity-90">
                            <CheckCheck className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="max-w-md text-center px-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-5">
                    <MessageSquare className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Welcome to Chat
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Pick a conversation from the left to start chatting with your team.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          {(selectedChat || selectedChannel) && (
            <div className="border-t border-gray-200 bg-white px-4 md:px-6 py-4">
              <div className="flex items-center gap-2 md:gap-3">
                <IconBtn label="Attach">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </IconBtn>

                <div className="flex-1 min-w-0 relative">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message…"
                    className="w-full bg-gray-100 border border-gray-200 rounded-full px-4 pr-12 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-200"
                    type="button"
                    aria-label="Emoji"
                  >
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className={[
                    "p-3 rounded-full transition-all",
                    newMessage.trim()
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg"
                      : "bg-gray-200 cursor-not-allowed",
                  ].join(" ")}
                  aria-label="Send"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** =========================
 * Sidebar Content (Reusable)
 * ========================= */
function SidebarContent({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  filteredUsers,
  filteredChannels,
  selectedChat,
  selectedChannel,
  onSelectChat,
  onSelectChannel,
  showProfileFooter = true,
}: {
  activeTab: "chats" | "channels";
  setActiveTab: (v: "chats" | "channels") => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (v: boolean) => void;
  filteredUsers: ChatUser[];
  filteredChannels: Channel[];
  selectedChat: ChatUser | null;
  selectedChannel: Channel | null;
  onSelectChat: (u: ChatUser) => void;
  onSelectChannel: (c: Channel) => void;
  showProfileFooter?: boolean;
}) {
  return (
    <>
      <div className="md:px-4 md:py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3 md:mb-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">CHAT</h1>
            <p className="text-xs text-gray-500">Connect with your team</p>
          </div>
        </div>

        <div className="relative">
          <div
            className={`absolute left-4 top-1/2 -translate-y-1/2 ${isSearchFocused ? "text-blue-600" : "text-gray-400"
              }`}
          >
            <Search className="w-5 h-5" />
          </div>
          <input
            placeholder="Search people or channels…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full pl-12 pr-4 md:py-2 py-1 bg-gray-100 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex-1 md:py-3 py-2 flex items-center justify-center gap-2 relative ${activeTab === "chats"
            ? "text-blue-600 font-semibold"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chats</span>
          {activeTab === "chats" && (
            <motion.div
              layoutId="activeTabLine"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab("channels")}
          className={`flex-1 md:py-3 py-2 flex items-center justify-center gap-2 relative ${activeTab === "channels"
            ? "text-blue-600 font-semibold"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          <Users className="w-5 h-5" />
          <span>Channels</span>
          {activeTab === "channels" && (
            <motion.div
              layoutId="activeTabLine"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
            />
          )}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 bg-white/95">
          <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            {activeTab === "chats" ? "Direct Messages" : "Channels"}
            <span className="ml-2 text-[11px] font-normal text-gray-400">
              ({activeTab === "chats" ? filteredUsers.length : filteredChannels.length})
            </span>
          </h2>
        </div>

        <div className="p-2">
          {activeTab === "chats" ? (
            <div className="space-y-1">
              {filteredUsers.map((u) => {
                const selected = selectedChat?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => onSelectChat(u)}
                    className={[
                      "p-4 rounded-xl cursor-pointer transition-all",
                      selected
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
                        : "hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      {/* avatar */}
                      <div className="relative shrink-0">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${u.avatarColor}`}
                        >
                          <span className="text-base font-semibold">
                            {initials(u.name)}
                          </span>
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                            u.status
                          )}`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {u.name}
                            </h3>
                            {u.isPinned && (
                              <Pin className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            )}
                            {u.isMuted && (
                              <BellOff className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </div>
                          {u.timestamp && (
                            <span className="text-[11px] text-gray-400 shrink-0">
                              {u.timestamp}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-sm text-gray-500 truncate">
                            {u.lastMessage}
                          </p>
                          {!!u.unreadCount && u.unreadCount > 0 && (
                            <span className="px-2 py-1 text-[11px] font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full min-w-[22px] text-center shrink-0">
                              {u.unreadCount}
                            </span>
                          )}
                        </div>

                        <div className="mt-2">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full ${u.status === "online"
                              ? "bg-green-100 text-green-700"
                              : u.status === "away"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {getStatusText(u.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChannels.map((c) => {
                const selected = selectedChannel?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => onSelectChannel(c)}
                    className={[
                      "p-4 rounded-xl cursor-pointer transition-all",
                      selected
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
                        : "hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {c.name}
                            </h3>
                            {c.isPrivate && (
                              <Lock className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            {c.isPinned && (
                              <Pin className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          {c.timestamp && (
                            <span className="text-[11px] text-gray-400 shrink-0">
                              {c.timestamp}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-sm text-gray-500 truncate">
                            {c.lastMessage}
                          </p>
                          {!!c.unreadCount && c.unreadCount > 0 && (
                            <span className="px-2 py-1 text-[11px] font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full min-w-[22px] text-center shrink-0">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>

                        <div className="mt-2">
                          <span className="text-[11px] text-gray-500">
                            {c.memberCount} members
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer profile */}
      {showProfileFooter && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold">JD</span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">Active now</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** =========================
 * Small Icon Button
 * ========================= */
function IconBtn({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
      aria-label={label}
      type="button"
    >
      {children}
    </button>
  );
}
