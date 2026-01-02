import Button from "@/commonComponents/Button";
import { Channel, ChatUser,  } from "../../lib/chat/types";
import { motion } from "framer-motion";
import {
  Users,
  Lock,
  MessageSquare,
  Search,
} from "lucide-react";
import { getStatusColor, getStatusText, initials } from "@/lib/chat/utilFunctions";



export function SidebarContent({
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
  onClickCreateChannel,
  allUsers
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
  isAdmin?: boolean;
  onClickCreateChannel?: () => void;
  allUsers: any[]
}) {

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-5 py-4 border-b border-gray-200/60 prof-surface  backdrop-blur-sm">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <Search
                className={`w-5 h-5 transition-all duration-300 ${isSearchFocused
                  ? "text-blue-600 transform scale-110"
                  : "app-text group-hover:text-gray-600"
                  }`}
              />
            </div>
            <input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-12 pr-4 py-2 btn-text bg-white/80 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-400/60 shadow-sm hover:shadow transition-all duration-300 app-text placeholder-gray-400"
            />
            {searchQuery && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium px-2.5 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-lg border border-blue-200/50">
                {activeTab === "chats"
                  ? filteredUsers.length
                  : filteredChannels.length}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex border-b app-border app-surface backdrop-blur-sm">
        {(["chats", "channels"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 flex items-center justify-center gap-2.5 relative overflow-hidden group ${activeTab === tab
              ? "text-blue-700 font-semibold"
              : "app-text"
              }`}
            type="button"
          >
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-gradient-to-b from-blue-50/60 to-purple-50/40"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            {activeTab === tab && (
              <motion.div
                layoutId="activeTabLine"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-500"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            <div
              className={`relative z-10 transition-transform duration-300 ${activeTab === tab
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

            <span className="relative z-10 font-medium text-sm">
              {tab === "chats" ? "Chats" : "Channels"}
            </span>

            {activeTab === tab &&
              tab === "chats" &&
              filteredUsers.some((u) => u.unreadCount) && (
                <div className="absolute top-3 right-6 z-10">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-[0_0_6px] shadow-blue-400/50" />
                </div>
              )}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="sticky top-0 z-10 px-5 py-3 prof-surface backdrop-blur-sm border-b border-gray-200/60">
          <div className="flex  items-center w-full justify-between">
            <div className="flex items-center justify-between w-full  gap-2">
              <h2 className="text-sm font-bold app-text uppercase text-nowrap tracking-wide">
                {activeTab === "chats" ? "Direct Messages" : "Team Channels"}
              </h2>
              {activeTab === "channels" && (
                <button
                  type="button"
                  onClick={onClickCreateChannel}
                  className="px-4 py-2 rounded-xl text-label text-nowrap bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition"
                >
                  +  Channel
                </button>
              )}
            </div>
          </div>
          <div className="text-xs flex  items-center justify-start gap-2 text-gray-400 font-medium">
            <div className="px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200/50">
              <span className="text-xs font-semibold text-blue-700">
                {activeTab === "chats"
                  ? filteredUsers.length
                  : filteredChannels.length}
              </span>
            </div>
            {activeTab === "chats"
              ? `${filteredUsers.length} contacts`
              : `${filteredChannels.reduce(
                (acc, c) => acc + c.memberCount,
                0
              )} total members`}
          </div>
        </div>

        <div className="p-3">
          <h2 className="text-white px-6  py-1 bg-gradient-to-r text-[10px] from-blue-500 to-purple-500 w-20 rounded-sm mb-2">Recent</h2>
          {activeTab === "chats" ? (
            <div className="space-y-2">
              {filteredUsers.map((user) => {
                const selected = selectedChat?.id === user.id;
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onSelectChat(user)}
                    className={`relative p-3 rounded-2xl cursor-pointer transition-all duration-300 group ${selected
                      ? "bg-gradient-to-r from-blue-50/80 to-purple-50/80 shadow-md shadow-blue-100/50 border-2 border-blue-100/50"
                      : "bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-50/30 hover:shadow-sm border-2 border-transparent hover:border-gray-200/60"
                      }`}
                  >
                    {selected && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

                    <div className="flex items-center gap-3 relative">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${user.avatarColor}`}
                          style={{
                            backgroundImage: user.avatarColor.includes(
                              "gradient"
                            )
                              ? user.avatarColor
                              : `linear-gradient(135deg, ${user.avatarColor}, ${user.avatarColor}99)`,
                          }}
                        >
                          <span className="text-base font-bold">
                            {initials(user.name)}
                          </span>
                        </div>

                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-3 border-white shadow-sm ${getStatusColor(
                            user.status
                          )} flex items-center justify-center`}
                        >
                          {user.status === "online" && (
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 ">
                        <div className="flex items-start justify-between gap-2 ">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate text-sm">
                              {user.name}
                            </h3>
                          </div>
                        </div>

                        <p className="sublabel-text text-gray-600 truncate mb-[2px] leading-tight">
                          {user.lastMessage || "Start a conversation..."}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] px-2 py-[2px] rounded-full font-medium ${user.status === "online"
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-700 border border-emerald-200/50"
                                : user.status === "away"
                                  ? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200/50"
                                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-200/50"
                                }`}
                            >
                              {getStatusText(user.status)}
                            </span>
                          </div>

                          
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <h2 className="text-white px-6  py-1 bg-gradient-to-r text-[10px] from-blue-500 to-purple-500 w-20 rounded-sm">+New</h2>
              {allUsers.map((user) => {
                const selected = selectedChat?.id === user.id;
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onSelectChat(user)}
                    className={`relative p-3 rounded-2xl cursor-pointer transition-all duration-300 group ${selected
                      ? "bg-gradient-to-r from-blue-50/80 to-purple-50/80 shadow-md shadow-blue-100/50 border-2 border-blue-100/50"
                      : "bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-50/30 hover:shadow-sm border-2 border-transparent hover:border-gray-200/60"
                      }`}
                  >
                    {selected && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

                    <div className="flex items-center gap-3 relative">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${user.avatarColor}`}
                          style={{
                            backgroundImage: user.avatarColor.includes(
                              "gradient"
                            )
                              ? user.avatarColor
                              : `linear-gradient(135deg, ${user.avatarColor}, ${user.avatarColor}99)`,
                          }}
                        >
                          <span className="text-base font-bold">
                            {initials(user.name)}
                          </span>
                        </div>

                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-3 border-white shadow-sm ${getStatusColor(
                            user.status
                          )} flex items-center justify-center`}
                        >
                          {user.status === "online" && (
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 ">
                        <div className="flex items-start justify-between gap-2 ">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate text-sm">
                              {user.name}
                            </h3>
                          </div>
                          {user.timestamp && (
                            <span className="text-xs text-gray-400 font-medium flex-shrink-0">
                              {user.timestamp}
                            </span>
                          )}
                        </div>

                        <p className="sublabel-text text-gray-600 truncate mb-[2px] leading-tight">
                          {user.lastMessage || "Start a conversation..."}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] px-2 py-[2px] rounded-full font-medium ${user.status === "online"
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-700 border border-emerald-200/50"
                                : user.status === "away"
                                  ? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200/50"
                                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-200/50"
                                }`}
                            >
                              {getStatusText(user.status)}
                            </span>
                          </div>

                   
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredChannels.map((channel) => {
                const selected = selectedChannel?.id === channel.id;
                return (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onSelectChannel(channel)}
                    className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 group ${selected
                      ? "bg-gradient-to-r from-blue-50/80 to-purple-50/80 shadow-md shadow-blue-100/50 border-2 border-blue-100/50"
                      : "bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-50/30 hover:shadow-sm border-2 border-transparent hover:border-gray-200/60"
                      }`}
                  >
                    {selected && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-14 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

                    <div className="flex items-center gap-4 relative">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 flex items-center justify-center shadow-sm border border-white/80">
                          {channel.isPrivate ? (
                            <Lock className="w-7 h-7 text-gray-600" />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>

                        {channel.isPrivate && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-sm">
                            <Lock className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate text-base">
                              {channel.name}
                            </h3>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 truncate mb-3 leading-tight">
                          {channel.lastMessage || "No messages yet"}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50/50 px-3 py-1.5 rounded-full">
                              <Users className="w-3.5 h-3.5" />
                              <span className="font-medium">
                                {channel.memberCount}
                              </span>
                              <span>members</span>
                            </div>

                            {channel.isPrivate && (
                              <span className="text-xs px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-full font-medium">
                                Private
                              </span>
                            )}
                          </div>

                          {!!channel.unreadCount && channel.unreadCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full min-w-[28px] text-center shadow-sm"
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
    </div>
  );
}