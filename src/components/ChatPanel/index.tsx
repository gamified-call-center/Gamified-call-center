"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MessageSquare,
  Users,
  ChevronRight,
  MoreVertical,
  CheckCheck,
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
} from "lucide-react";

// Define types
interface ChatUser {
  id: string;
  name: string;
  status: "online" | "away" | "offline";
  lastSeen?: string;
  unreadCount?: number;
  lastMessage?: string;
  timestamp?: string;
  isPinned?: boolean;
  isMuted?: boolean;
  avatarColor: string;
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
  sender: string;
  timestamp: string;
  isOwn: boolean;
}

// Mock data for users
const DIRECT_MESSAGES: ChatUser[] = [
  { id: "1", name: "Anna Mann", status: "online", unreadCount: 2, lastMessage: "Can you review the policy document?", timestamp: "10:30 AM", avatarColor: "bg-pink-500" },
  { id: "2", name: "Andre Triplett", status: "online", lastMessage: "Thanks for the update!", timestamp: "09:15 AM", isPinned: true, avatarColor: "bg-blue-500" },
  { id: "3", name: "Luigi Chafloque", status: "away", lastMessage: "Meeting at 3 PM", timestamp: "Yesterday", avatarColor: "bg-green-500" },
  { id: "4", name: "Ivan Ballin", status: "online", unreadCount: 1, lastMessage: "Premium calculation sent", timestamp: "10:22 AM", avatarColor: "bg-purple-500" },
  { id: "5", name: "Oluvaseun Cyriloye", status: "offline", lastMessage: "Will send by EOD", timestamp: "Tuesday", avatarColor: "bg-yellow-500" },
  { id: "6", name: "Shira Mitzmann", status: "online", lastMessage: "Approved ✅", timestamp: "10:00 AM", isMuted: true, avatarColor: "bg-red-500" },
  { id: "7", name: "Joseph Defalco", status: "away", lastMessage: "Need your signature", timestamp: "Monday", avatarColor: "bg-indigo-500" },
  { id: "8", name: "Norma Titcomb", status: "online", unreadCount: 5, lastMessage: "Urgent: Client waiting", timestamp: "10:45 AM", isPinned: true, avatarColor: "bg-teal-500" },
  { id: "9", name: "Krystal Arthur-Vining", status: "offline", lastMessage: "Documents received", timestamp: "Sunday", avatarColor: "bg-orange-500" },
  { id: "10", name: "Alex iDefalco", status: "online", lastMessage: "Call me when free", timestamp: "10:20 AM", avatarColor: "bg-cyan-500" },
  { id: "11", name: "Monika Sylvester", status: "away", lastMessage: "See attached file", timestamp: "Yesterday", avatarColor: "bg-purple-500" },
];
// Mock data for channels
const CHANNELS: Channel[] = [
  { id: "c1", name: "Team Alpha", memberCount: 12, lastMessage: "Anna: Deadline extended", timestamp: "10:25 AM", unreadCount: 3 },
  { id: "c2", name: "Client Updates", memberCount: 8, lastMessage: "New case assigned", timestamp: "09:45 AM", isPrivate: true },
  { id: "c3", name: "Policy Reviews", memberCount: 15, lastMessage: "5 policies pending", timestamp: "Yesterday", isPinned: true },
  { id: "c4", name: "Sales Team", memberCount: 20, lastMessage: "Monthly target achieved! 🎉", timestamp: "10:10 AM", unreadCount: 12 },
  { id: "c5", name: "Support", memberCount: 6, lastMessage: "System maintenance at 2 AM", timestamp: "Monday" },
  { id: "c6", name: "Managers", memberCount: 5, lastMessage: "Budget meeting tomorrow", timestamp: "Tuesday", isPrivate: true, isPinned: true },
];

// Mock messages
const MESSAGES: Message[] = [
  { id: "1", content: "Hey there! How's the project going?", sender: "Anna Mann", timestamp: "10:25 AM", isOwn: false },
  { id: "2", content: "Going well! Just finished the policy review.", sender: "You", timestamp: "10:27 AM", isOwn: true },
  { id: "3", content: "Great! Can you send me the updated document?", sender: "Anna Mann", timestamp: "10:28 AM", isOwn: false },
  { id: "4", content: "Sure, I'll send it in the next 30 minutes.", sender: "You", timestamp: "10:30 AM", isOwn: true },
  { id: "5", content: "Perfect, thanks!", sender: "Anna Mann", timestamp: "10:30 AM", isOwn: false },
];

export default function ChatPanel() {
  const [activeTab, setActiveTab] = useState<"chats" | "channels">("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(DIRECT_MESSAGES[0]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filter users based on search
  const filteredUsers = DIRECT_MESSAGES.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter channels based on search
  const filteredChannels = CHANNELS.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: ChatUser["status"]) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500";
      case "offline": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  const getStatusText = (status: ChatUser["status"]) => {
    switch (status) {
      case "online": return "Online";
      case "away": return "Away";
      case "offline": return "Offline";
      default: return "Offline";
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "You",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isMobileSidebarOpen ? 0 : '-100%',
        }}
        className={`md:relative md:translate-x-0 fixed inset-y-0 left-0 z-40 w-80 md:w-96 bg-white border-r border-gray-200 flex flex-col h-full shadow-xl md:shadow-none`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">CHAT</h1>
                <p className="text-sm text-gray-500">Connect with your team</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
              isSearchFocused ? "text-blue-500" : "text-gray-400"
            }`}>
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all relative ${
              activeTab === "chats"
                ? "text-blue-600 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Chats</span>
            {activeTab === "chats" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
              />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("channels")}
            className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all relative ${
              activeTab === "channels"
                ? "text-blue-600 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Channels</span>
            {activeTab === "channels" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
              />
            )}
          </button>
        </div>

        {/* Chats/Channels List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200 bg-white/95">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              {activeTab === "chats" ? "DIRECT MESSAGES" : "CHANNELS"}
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({activeTab === "chats" ? filteredUsers.length : filteredChannels.length})
              </span>
            </h2>
          </div>

          <div className="p-2">
            {activeTab === "chats" ? (
              <div className="space-y-1">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      setSelectedChat(user);
                      setSelectedChannel(null);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedChat?.id === user.id
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${user.avatarColor}`}>
                          <span className="text-lg font-semibold">
                            {user.name.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-800 truncate">
                              {user.name}
                            </h3>
                            {user.isPinned && (
                              <Pin className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            )}
                            {user.isMuted && (
                              <BellOff className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {user.timestamp && (
                              <span className="text-xs text-gray-400">
                                {user.timestamp}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-500 truncate">
                            {user.lastMessage}
                          </p>
                          {user.unreadCount && user.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full min-w-[20px] text-center">
                              {user.unreadCount}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            user.status === "online"
                              ? "bg-green-100 text-green-700"
                              : user.status === "away"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {getStatusText(user.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredChannels.map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => {
                      setSelectedChannel(channel);
                      setSelectedChat(null);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedChannel?.id === channel.id
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-800">
                              {channel.name}
                            </h3>
                            {channel.isPrivate && (
                              <Lock className="w-3 h-3 text-gray-400" />
                            )}
                            {channel.isPinned && (
                              <Pin className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {channel.timestamp && (
                              <span className="text-xs text-gray-400">
                                {channel.timestamp}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-500 truncate">
                            {channel.lastMessage}
                          </p>
                          {channel.unreadCount && channel.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full min-w-[20px] text-center">
                              {channel.unreadCount}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {channel.memberCount} members
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold">JD</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">John Doe</p>
              <p className="text-xs text-gray-500">Active now</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 md:p-6">
          {selectedChat ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${selectedChat.avatarColor}`}>
                    <span className="text-lg font-semibold">
                      {selectedChat.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(selectedChat.status)}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedChat.name}</h2>
                  <p className="text-sm text-gray-500">{getStatusText(selectedChat.status)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          ) : selectedChannel ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedChannel.name}</h2>
                  <p className="text-sm text-gray-500">{selectedChannel.memberCount} members</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Select a chat to start messaging</h2>
                <p className="text-sm text-gray-500">Choose from your conversations or channels</p>
              </div>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {selectedChat || selectedChannel ? (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] md:max-w-[60%] rounded-2xl p-4 ${
                    message.isOwn
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    {!message.isOwn && (
                      <p className="text-xs font-medium mb-1 opacity-80">{message.sender}</p>
                    )}
                    <p className="text-sm md:text-base">{message.content}</p>
                    <p className={`text-xs mt-2 ${message.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-6">
                <MessageSquare className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Chat</h3>
              <p className="text-gray-500 max-w-md">
                Select a conversation from the sidebar to start messaging with your team members or join a channel for group discussions.
              </p>
            </div>
          )}
        </div>

        {/* Message Input */}
        {(selectedChat || selectedChannel) && (
          <div className="border-t border-gray-200 bg-white p-4 md:p-6">
            <div className="flex items-center gap-3">
              <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                <Paperclip className="w-5 h-5 text-gray-500" />
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400"
                />
                <button className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors">
                  <Smile className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={`p-3 rounded-full transition-all ${
                  newMessage.trim()
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg'
                    : 'bg-gray-200 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}