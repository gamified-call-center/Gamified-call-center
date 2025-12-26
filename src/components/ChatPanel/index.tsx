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
  CheckCheck,
  ArrowLeft,
  Home,
  ChevronRight,
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

/**
 * Below 1300px: “list-first”.
 * We use Tailwind for layout; JS only to enforce “no active chat” when crossing below 1300.
 */
function useIsBelow1300() {
  const [isBelow, setIsBelow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1299px)");
    const update = () => setIsBelow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isBelow;
}

/** =========================
 * Component
 * ========================= */
export default function ChatPanel() {
  const isBelow1300 = useIsBelow1300();

  const [activeTab, setActiveTab] = useState<"chats" | "channels">("chats");
  const [searchQuery, setSearchQuery] = useState("");
  // ✅ Below 1300: no active chat by default
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
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

  // ✅ Enforce rule: below 1300px there should not be an active chat "in-page"
  // (so we close any open chat/drawer when entering <1300).
  useEffect(() => {
    if (isBelow1300) {
      setSelectedChat(null);
      setSelectedChannel(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBelow1300]);

  // Scroll to bottom on messages change (only when a chat is open)
  useEffect(() => {
    if (selectedChat || selectedChannel) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, selectedChat, selectedChannel]);

  const activeTitle = selectedChat
    ? selectedChat.name
    : selectedChannel
    ? selectedChannel.name
    : "";

  const isDrawerOpen = Boolean(selectedChat || selectedChannel);

  const closeActive = () => {
    setSelectedChat(null);
    setSelectedChannel(null);
  };

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
    <div className="h-[calc(100vh-theme(spacing.16))] overflow-hidden bg-gray-50">
      {/* ✅ Keep the top bar EXACTLY like you kept */}
      <div className="mb-1 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-2 shadow-sm">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>

          <div className="leading-tight">
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
              Chat
            </h1>
            <p className="text-xs text-gray-500">Connect with your team</p>
          </div>
        </div>

        {/* Right: Breadcrumb */}
        <div className="flex items-center gap-2">
          <a
            href="/aca/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200 group"
          >
            <Home className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
            <span className="text-sm  font-Gordita-Medium text-gray-600 group-hover:text-gray-900 transition-colors">
              Home
            </span>
          </a>

          <ChevronRight className="w-4 h-4 text-gray-400" />

          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="text-sm  font-Gordita-Bold text-gray-900">Chat</span>
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main area takes the remaining height below the top bar */}
      <div className="relative flex h-[calc(100%-4.5rem)] min-h-0">
        {/* ========================= Sidebar (ALWAYS visible) ========================= */}
        <div className="w-full min-[1300px]:w-96 shrink-0 bg-white border-r border-gray-200 flex flex-col h-full min-h-0">
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
            showProfileFooter={true}
          />
        </div>

        {/* ========================= Desktop Chat Window (>=1300) ========================= */}
        <div className="hidden min-[1300px]:flex flex-1 min-w-0 flex-col h-full bg-white">
          <ChatWindow
            selectedChat={selectedChat}
            selectedChannel={selectedChannel}
            activeTitle={activeTitle}
            closeActive={closeActive}
            messages={messages}
            messagesEndRef={messagesEndRef}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleKeyDown={handleKeyDown}
            handleSendMessage={handleSendMessage}
          />
        </div>

        {/* ========================= Drawer Chat Window (<1300) ========================= */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              {/* Backdrop only on <1300 */}
              <motion.button
                type="button"
                aria-label="Close chat"
                onClick={closeActive}
                className="absolute inset-0 z-40 bg-black/30 min-[1300px]:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* Drawer panel */}
              <motion.div
                className="absolute inset-y-0 right-0 z-50 w-full bg-white shadow-2xl sm:w-[640px] min-[1300px]:hidden"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 420, damping: 40 }}
              >
                <ChatWindow
                  selectedChat={selectedChat}
                  selectedChannel={selectedChannel}
                  activeTitle={activeTitle}
                  closeActive={closeActive}
                  messages={messages}
                  messagesEndRef={messagesEndRef}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleKeyDown={handleKeyDown}
                  handleSendMessage={handleSendMessage}
                  showBackButton
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** =========================
 * Chat Window (Reusable desktop + drawer)
 * ========================= */
function ChatWindow({
  selectedChat,
  selectedChannel,
  activeTitle,
  closeActive,
  messages,
  messagesEndRef,
  newMessage,
  setNewMessage,
  handleKeyDown,
  handleSendMessage,
  showBackButton = false,
}: {
  selectedChat: ChatUser | null;
  selectedChannel: Channel | null;
  activeTitle: string;
  closeActive: () => void;
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  newMessage: string;
  setNewMessage: (v: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSendMessage: () => void;
  showBackButton?: boolean;
}) {
  const hasActive = Boolean(selectedChat || selectedChannel);

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-2">
        {hasActive ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Back (drawer only) */}
              {showBackButton && (
                <button
                  onClick={closeActive}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="Back"
                  type="button"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
              )}

              {selectedChat ? (
                <div className="relative shrink-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white ${selectedChat.avatarColor}`}
                  >
                    <span className="text-base  font-Gordita-Bold">
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
                <h2 className="text-base md:text-lg  font-Gordita-Bold text-gray-900 truncate">
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
              <h2 className="text-lg  font-Gordita-Bold text-gray-900">
                Select a chat to start messaging
              </h2>
              <p className="text-sm text-gray-500">
                Choose a conversation or channel from the list
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 bg-white">
        {hasActive ? (
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={[
                    "max-w-[80%] md:max-w-[65%] rounded-2xl px-4 py-2 shadow-sm",
                    m.isOwn
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-tr-md"
                      : "bg-gray-100 text-gray-900 rounded-tl-md",
                  ].join(" ")}
                >
                  {!m.isOwn && (
                    <p className="text-[11px]  font-Gordita-Bold mb-1 opacity-70">
                      {m.senderName}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {m.content}
                  </p>
                  <div
                    className={`mt-2 flex items-center justify-end gap-1 text-[11px] ${
                      m.isOwn ? "text-blue-100" : "text-gray-500"
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
              <h3 className="text-xl  font-Gordita-Bold text-gray-900">
                Welcome to Chat
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Pick a conversation from the left to start chatting with your
                team.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      {hasActive && (
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
                className="w-full bg-gray-100 border border-gray-200 rounded-full px-4 pr-12 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
              type="button"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
      {/* Enhanced Search Section */}
      <div className="px-5 py-2 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/50">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <Search
                className={`w-5 h-5 transition-all duration-300 ${
                  isSearchFocused
                    ? "text-blue-600 transform scale-110"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
            </div>
            <input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-12 pr-4 py-2 bg-white border-2 border-gray-200/50 rounded-2xl outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm hover:shadow transition-all duration-300 text-gray-700 placeholder-gray-400"
            />
            {searchQuery && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                {activeTab === "chats"
                  ? filteredUsers.length
                  : filteredChannels.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="flex border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/30">
        {(["chats", "channels"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 flex items-center justify-center gap-2.5 relative overflow-hidden group ${
              activeTab === tab
                ? "text-blue-700  font-Gordita-Bold"
                : "text-gray-500 hover:text-gray-700"
            }`}
            type="button"
          >
            {/* Background highlight */}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-gradient-to-b from-blue-50/60 to-purple-50/40"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            {/* Border indicator */}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabLine"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-500"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            {/* Icon */}
            <div
              className={`relative z-10 transition-transform duration-300 ${
                activeTab === tab
                  ? "transform scale-110"
                  : "group-hover:scale-105"
              }`}
            >
              {tab === "chats" ? (
                <MessageSquare className="w-5 h-5" />
              ) : (
                <Users className="w-5 h-5" />
              )}
            </div>

            {/* Text */}
            <span className="relative z-10  font-Gordita-Medium text-sm">
              {tab === "chats" ? "Chats" : "Channels"}
            </span>

            {/* Unread count badge for active tab */}
            {activeTab === tab &&
              tab === "chats" &&
              filteredUsers.some((u) => u.unreadCount) && (
                <div className="absolute top-2 right-6 z-10">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
                </div>
              )}
          </button>
        ))}
      </div>

      {/* List Section */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Enhanced Header */}
        <div className="sticky top-0 z-10 px-5 py-2 bg-gradient-to-b from-white to-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm  font-Gordita-Bold text-gray-800 uppercase tracking-wide">
                {activeTab === "chats" ? "Direct Messages" : "Team Channels"}
              </h2>
              <div className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg">
                <span className="text-xs  font-Gordita-Bold text-gray-600">
                  {activeTab === "chats"
                    ? filteredUsers.length
                    : filteredChannels.length}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-400  font-Gordita-Medium">
              {activeTab === "chats"
                ? `${filteredUsers.length} online`
                : `${filteredChannels.reduce(
                    (acc, c) => acc + c.memberCount,
                    0
                  )} total members`}
            </div>
          </div>
        </div>

        {/* List Items */}
        <div className="p-3">
          {activeTab === "chats" ? (
            <div className="space-y-1">
              {filteredUsers.map((user) => {
                const selected = selectedChat?.id === user.id;
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onSelectChat(user)}
                    className={`relative p-2 rounded-2xl cursor-pointer transition-all duration-300 group ${
                      selected
                        ? "bg-gradient-to-r from-blue-50/80 to-purple-50/80 shadow-md shadow-blue-100/50 border-2 border-blue-100/50"
                        : "bg-white hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-50/30 hover:shadow-sm border-2 border-transparent hover:border-gray-100"
                    }`}
                  >
                    {/* Selected indicator */}
                    {selected && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                    )}

                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

                    <div className="flex items-center gap-4 relative">
                      {/* Enhanced Avatar */}
                      <div className="relative">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${user.avatarColor}`}
                        >
                          <span className="text-base  font-Gordita-Bold">
                            {initials(user.name)}
                          </span>
                        </div>

                        {/* Status indicator */}
                        <div
                          className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white shadow-sm ${getStatusColor(
                            user.status
                          )} flex items-center justify-center`}
                        >
                          {user.status === "online" && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          )}
                        </div>

                        {/* Pinned indicator */}
                        {user.isPinned && (
                          <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-sm">
                            <Pin className="w-2.5 h-2.5 text-white fill-white" />
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className=" font-Gordita-Bold text-gray-900 truncate text-sm">
                              {user.name}
                            </h3>
                            {user.isMuted && (
                              <BellOff className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                          {user.timestamp && (
                            <span className="text-xs text-gray-400  font-Gordita-Medium flex-shrink-0">
                              {user.timestamp}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 truncate mb-2 leading-tight">
                          {user.lastMessage}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full  font-Gordita-Medium ${
                                user.status === "online"
                                  ? "bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-700"
                                  : user.status === "away"
                                  ? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700"
                                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600"
                              }`}
                            >
                              {getStatusText(user.status)}
                            </span>

                            {user.lastSeen && user.status !== "online" && (
                              <span className="text-xs text-gray-400">
                                • Last seen {user.lastSeen}
                              </span>
                            )}
                          </div>

                          {!!user.unreadCount && user.unreadCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="px-2.5 py-1 text-xs  font-Gordita-Bold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full min-w-[24px] text-center shadow-sm"
                            >
                              {user.unreadCount}
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredChannels.map((channel) => {
                const selected = selectedChannel?.id === channel.id;
                return (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onSelectChannel(channel)}
                    className={`relative p-2 rounded-2xl cursor-pointer transition-all duration-300 group ${
                      selected
                        ? "bg-gradient-to-r from-blue-50/80 to-purple-50/80 shadow-md shadow-blue-100/50 border-2 border-blue-100/50"
                        : "bg-white hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-50/30 hover:shadow-sm border-2 border-transparent hover:border-gray-100"
                    }`}
                  >
                    {/* Selected indicator */}
                    {selected && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                    )}

                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

                    <div className="flex items-center gap-4 relative">
                      {/* Enhanced Channel Icon */}
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center shadow-sm">
                          {channel.isPrivate ? (
                            <Lock className="w-6 h-6 text-gray-600" />
                          ) : (
                            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Pinned indicator */}
                        {channel.isPinned && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-sm">
                            <Pin className="w-2.5 h-2.5 text-white fill-white" />
                          </div>
                        )}

                        {/* Private indicator */}
                        {channel.isPrivate && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-sm">
                            <Lock className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Channel Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className=" font-Gordita-Bold text-gray-900 truncate text-sm">
                              {channel.name}
                            </h3>
                          </div>
                          {channel.timestamp && (
                            <span className="text-xs text-gray-400  font-Gordita-Medium flex-shrink-0">
                              {channel.timestamp}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 truncate mb-2 leading-tight">
                          {channel.lastMessage}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Users className="w-3.5 h-3.5" />
                              <span className=" font-Gordita-Medium">
                                {channel.memberCount}
                              </span>
                              <span>members</span>
                            </div>

                            {channel.isPrivate && (
                              <span className="text-xs px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-full">
                                Private
                              </span>
                            )}
                          </div>

                          {!!channel.unreadCount && channel.unreadCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="px-2.5 py-1 text-xs  font-Gordita-Bold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full min-w-[24px] text-center shadow-sm"
                            >
                              {channel.unreadCount}
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

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
