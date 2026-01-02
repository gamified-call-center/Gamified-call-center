"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  ArrowLeft,
  MessageSquare,
  Paperclip,
  Smile,
  Send,
  CheckCheck,
  AlertCircle,
  Info,
  X,
  Pencil,
  UserPlus,
  Trash2,
  Search,
} from "lucide-react";

import {
  getStatusColor,
  getStatusText,
  IconBtn,
  initials,
} from "@/lib/chat/utilFunctions";

import {
  Channel,
  ChatUser,
  MessagesByThread,
  ChannelDetails,
} from "../../lib/chat/types";

// ✅ Emoji picker that works with React 19
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

export function ChatWindow({
  selectedChat,
  selectedChannel,
  activeTitle,
  closeActive,
  messagesByThread,
  messagesEndRef,
  newMessage,
  setNewMessage,
  handleKeyDown,
  handleSendMessage,
  showBackButton = false,
  channelDetails,
  currentUserId,
  onEditChannelTitle,
  onAddMembers,
  onRemoveMember,
  onDeleteChannel,
  allUsers,
}: {
  selectedChat: ChatUser | null;
  selectedChannel: Channel | null;
  activeTitle: string;
  closeActive: () => void;
  messagesByThread: MessagesByThread | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  newMessage: string;
  setNewMessage: (v: any) => void; // allow functional set too
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSendMessage: () => void;
  showBackButton?: boolean;

  channelDetails?: ChannelDetails | null;
  currentUserId?: string;
  onEditChannelTitle?: (
    threadId: string,
    title: string
  ) => Promise<void> | void;

  onAddMembers?: (threadId: string, ids: string[]) => void;
  onRemoveMember?: (threadId: string, removeUserId: string) => void;
  onDeleteChannel?: (threadId: string) => void;
  allUsers?: any;
}) {
  const hasActive = Boolean(selectedChat || selectedChannel);

  const [isChannelInfoOpen, setIsChannelInfoOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [showAddMembers, setShowAddMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savingMembers, setSavingMembers] = useState(false);

  const [titleDraft, setTitleDraft] = useState("");

  const isChannel = Boolean(selectedChannel);
  const isAdmin = Boolean(channelDetails?.isOwner);

  const memberCount =
    channelDetails?.members?.length ?? selectedChannel?.memberCount ?? 0;

  // ✅ Emoji picker state + refs
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiWrapRef = useRef<HTMLDivElement | null>(null);

  const openChannelInfo = () => {
    setIsChannelInfoOpen(true);
    setIsEditingTitle(false);
    setTitleDraft(channelDetails?.title ?? selectedChannel?.name ?? "");
  };

  const closeChannelInfo = () => {
    setIsChannelInfoOpen(false);
    setIsEditingTitle(false);
  };

  const threadKey = useMemo(() => {
    if (!selectedChat && !selectedChannel) return null;
    if (selectedChat && (selectedChat as any).threadId)
      return `dm:${(selectedChat as any).threadId}`;
    if (selectedChannel) return `channel:${selectedChannel.id}`;
    return null;
  }, [selectedChat, selectedChannel]);

  const existingMemberIds = useMemo(() => {
    const ids = new Set<string>();
    (channelDetails?.members ?? []).forEach((m) => ids.add(m.userId));
    return ids;
  }, [channelDetails]);

  const addableUsers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    return (allUsers ?? [])
      .filter((u: any) => {
        if (existingMemberIds.has(u.id)) return false;
        if (currentUserId && u.id === currentUserId) return false;

        if (!q) return true;
        return (
          (u.name ?? "").toLowerCase().includes(q) ||
          (u.email ?? "").toLowerCase().includes(q)
        );
      })
      .slice(0, 200);
  }, [allUsers, existingMemberIds, memberSearch, currentUserId]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submitAddMembers = async () => {
    if (!selectedChannel) return;
    if (!selectedIds.length) return;
    if (!onAddMembers) return;

    try {
      setSavingMembers(true);
      await onAddMembers(selectedChannel.id, selectedIds);
      setShowAddMembers(false);
      setSelectedIds([]);
    } finally {
      setSavingMembers(false);
    }
  };

  useEffect(() => {
    if (!isChannelInfoOpen) return;
    setTitleDraft(channelDetails?.title ?? selectedChannel?.name ?? "");
  }, [isChannelInfoOpen, channelDetails?.title, selectedChannel?.name]);

  // ✅ Close emoji picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        emojiWrapRef.current &&
        !emojiWrapRef.current.contains(e.target as Node)
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ✅ Close emoji picker on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowEmoji(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ✅ Emoji click -> append to input
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev: string) => (prev ?? "") + (emojiData.emoji ?? ""));
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-gradient-to-b from-white via-blue-50/5 to-transparent">
      {/* HEADER */}
      <div className="bg-white/90 backdrop-blur-sm px-4 md:px-6 py-4 shadow-sm">
        {hasActive ? (
          <div className="flex items-center justify-between gap-3">
            {/* LEFT */}
            <div className="flex items-center gap-3 min-w-0">
              {showBackButton && (
                <button
                  onClick={closeActive}
                  className="p-2 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/80 border border-gray-200/50 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 group shadow-sm hover:shadow-md"
                  aria-label="Back"
                  type="button"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                </button>
              )}

              {selectedChat ? (
                <div className="relative shrink-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${selectedChat.avatarColor}`}
                    style={{
                      backgroundImage: selectedChat.avatarColor.includes(
                        "gradient"
                      )
                        ? selectedChat.avatarColor
                        : `linear-gradient(135deg, ${selectedChat.avatarColor}, ${selectedChat.avatarColor}99)`,
                    }}
                  >
                    <span className="text-base font-bold tracking-wide">
                      {initials(selectedChat.name)}
                    </span>
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-3 border-white shadow-md ${getStatusColor(
                      selectedChat.status
                    )}`}
                  />
                </div>
              ) : (
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100/80 to-purple-100/80 flex items-center justify-center shrink-0 shadow-lg border border-white/80">
                  <Users className="w-6 h-6 text-gradient-to-r from-blue-600 to-purple-600" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-white">
                      {selectedChannel?.memberCount ?? 0}
                    </span>
                  </div>
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center justify-center gap-1">
                  <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-800 bg-clip-text text-transparent truncate">
                    {activeTitle}
                  </h2>
                  {selectedChannel && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full text-xs font-semibold text-blue-700 border border-blue-200/50">
                      Channel
                    </span>
                  )}
                </div>

                <p className="text-xs md:text-sm text-gray-600 flex items-center gap-2">
                  {selectedChat ? (
                    <>
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${getStatusColor(
                          selectedChat.status
                        )}`}
                      />
                      <span className="sublabel-text">
                        {getStatusText(selectedChat.status)}
                      </span>
                    </>
                  ) : (
                    <>
                      <Users className="w-3 h-3 text-gray-500" />
                      <span>{memberCount} active members</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {isChannel && (
              <button
                type="button"
                onClick={openChannelInfo}
                className="p-2 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/80 border border-gray-200/50 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 shadow-sm hover:shadow-md"
                aria-label="Channel info"
                title="Channel info"
              >
                <Info className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                  Select a conversation
                </h2>
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
              </div>
              <p className="sublabel-text text-gray-600 ">
                Choose a conversation or channel from the sidebar to begin
                messaging
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 bg-gradient-to-b from-transparent via-blue-50/5 to-transparent">
        <div className="sticky top-0 z-10 pt-2 p-4 py-2 bg-gradient-to-b from-white/90 to-transparent backdrop-blur-sm">
          <div className="flex items-center justify-center">
            <div className="px-4 py-1 shadow-sm">
              <span className="text-xs font-medium text-black flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Attention! Messages are not private and may be visible to
                administrators
              </span>
            </div>
          </div>
        </div>

        {hasActive ? (
          <div className="px-4 md:px-6 py-4 space-y-5 max-w-6xl mx-auto">
            {Object.values(messagesByThread || {})
              .flat()
              .map((m: any) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.isOwn ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[75%] relative group ${
                      m.isOwn ? "pr-2" : "pl-2"
                    }`}
                  >
                    <div
                      className={`absolute ${
                        m.isOwn
                          ? "left-0 -translate-x-full"
                          : "right-0 translate-x-full"
                      } top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900/90 backdrop-blur-sm rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none`}
                    >
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    <div
                      className={[
                        "rounded-2xl px-4 py-3 shadow-sm min-w-[160px] border backdrop-blur-sm",
                        m.isOwn
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md border-blue-500/30 shadow-lg shadow-blue-500/20"
                          : "bg-white/90 backdrop-blur-sm text-gray-900 rounded-bl-md border-gray-200/60 shadow-sm",
                      ].join(" ")}
                    >
                      {isChannel && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-bold">
                          {m.senderName}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </p>

                      <div
                        className={`flex items-center justify-between mt-3 text-xs ${
                          m.isOwn ? "text-blue-100/90" : "text-gray-500"
                        }`}
                      >
                        <span className="font-medium">{m.timestamp}</span>
                        <div className="flex items-center gap-1">
                          {m.isOwn && (
                            <span className="opacity-90 flex items-center gap-1">
                              <CheckCheck className="w-4 h-4" />
                              <span className="text-[10px]">Delivered</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center px-4">
            <div className="max-w-md text-center px-6 py-12">
              <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-100/50 to-purple-100/50 flex items-center justify-center mb-6 shadow-xl border border-white/80">
                <MessageSquare className="w-12 h-12 text-gradient-to-r from-blue-600 to-purple-600" />
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-3">
                Welcome to Chat
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Pick a conversation from the sidebar to start chatting with your
                team. Create channels for projects or message colleagues
                directly.
              </p>
            </div>
          </div>
        )}
      </div>

      {hasActive && (
        <div className="border-gray-200/50 backdrop-blur-sm px-4 md:px-6 py-2 shadow-[0_-4px_20px_-6px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <IconBtn
                label="Attach"
                className="bg-gradient-to-br from-gray-50 to-gray-100/80 border border-gray-200/60 hover:from-gray-100 hover:to-gray-200 text-gray-700 hover:shadow-md transition-all"
              >
                <Paperclip className="w-5 h-5" />
              </IconBtn>

              {/* ✅ Emoji button + picker */}
              <div className="relative" ref={emojiWrapRef}>
                <IconBtn
                  label="Emoji"
                  onClick={() => setShowEmoji((v: boolean) => !v)}
                  className="bg-gradient-to-br from-gray-50 to-gray-100/80 border border-gray-200/60 hover:from-gray-100 hover:to-gray-200 text-gray-700 hover:shadow-md transition-all"
                >
                  <Smile className="w-5 h-5" />
                </IconBtn>

                {showEmoji && (
                  <div className="absolute bottom-12 left-0 z-50 shadow-2xl rounded-xl overflow-hidden border border-gray-200 bg-white">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      height={380}
                      width={320}
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-sm" />
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message…"
                className="relative w-full bg-white/80 placeholder:label-text backdrop-blur-sm border-2 border-gray-200/60 rounded-xl px-5 pr-14 md:py-[6px] py-1 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 shadow-sm hover:shadow-md transition-all duration-300 text-gray-800 placeholder-gray-400"
              />
            </div>

            <button
              onClick={() => {
                handleSendMessage();
                setShowEmoji(false);
              }}
              disabled={!newMessage.trim()}
              className={[
                "px-3.5 py-2 rounded-2xl transition-all duration-300 shadow-lg relative overflow-hidden group",
                newMessage.trim()
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105"
                  : "bg-gradient-to-r from-gray-200 to-gray-300 cursor-not-allowed",
              ].join(" ")}
              aria-label="Send"
              type="button"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Send className="w-5 h-5 text-white relative z-10 transform group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {selectedChannel && isChannelInfoOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeChannelInfo}
            aria-label="Close modal"
          />

          <div className="relative z-10 w-[92%] max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {!isEditingTitle ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {channelDetails?.title ??
                        selectedChannel.name ??
                        "Channel"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {memberCount} members
                      {isAdmin ? (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200">
                          Admin
                        </span>
                      ) : null}
                    </p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <input
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50"
                      placeholder="Channel title"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                        onClick={async () => {
                          const threadId = selectedChannel.id;
                          if (!onEditChannelTitle) return;
                          await onEditChannelTitle(threadId, titleDraft);
                          setIsEditingTitle(false);
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50"
                        onClick={() => {
                          setIsEditingTitle(false);
                          setTitleDraft(
                            channelDetails?.title ?? selectedChannel?.name ?? ""
                          );
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={closeChannelInfo}
                className="p-2 rounded-xl hover:bg-gray-100 border border-gray-200"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="mt-4 max-h-64 overflow-y-auto border rounded-xl">
              {(channelDetails?.members ?? []).map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center justify-between px-4 py-3 border-b last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {m.name}
                      {m.userId === currentUserId ? (
                        <span className="ml-2 text-xs text-gray-500">
                          (You)
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-gray-500">
                      {m.role ?? "member"}
                    </p>
                  </div>

                  {isAdmin && m.userId !== currentUserId && onRemoveMember && (
                    <button
                      type="button"
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() =>
                        onRemoveMember(selectedChannel.id, m.userId)
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {!channelDetails?.members?.length && (
                <div className="px-4 py-6 text-sm text-gray-500">
                  Members not loaded yet.
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="mt-4 flex flex-wrap gap-2">
                {onAddMembers && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                    onClick={() => setShowAddMembers(true)}
                  >
                    <UserPlus className="w-4 h-4" /> Add members
                  </button>
                )}

                {!isEditingTitle && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50"
                    onClick={() => {
                      setIsEditingTitle(true);
                      setTitleDraft(
                        channelDetails?.title ?? selectedChannel?.name ?? ""
                      );
                    }}
                  >
                    <Pencil className="w-4 h-4" /> Edit title
                  </button>
                )}

                {onDeleteChannel && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-sm font-semibold text-red-700 hover:bg-red-50"
                    onClick={() => onDeleteChannel(selectedChannel.id)}
                  >
                    <Trash2 className="w-4 h-4" /> Delete channel
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showAddMembers && selectedChannel && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add members</h3>
                <p className="text-xs text-gray-500">
                  Select users to add to{" "}
                  <span className="font-semibold">{selectedChannel.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMembers(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="px-5 py-4">
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {addableUsers.length === 0 ? (
                  <div className="text-sm text-gray-500 py-6 text-center">
                    No users available to add.
                  </div>
                ) : (
                  addableUsers.map((u: any) => {
                    const checked = selectedIds.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleSelect(u.id)}
                        className={[
                          "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition",
                          checked
                            ? "border-blue-300 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50",
                        ].join(" ")}
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {u.name}
                          </div>
                          {u.email && (
                            <div className="text-xs text-gray-500 truncate">
                              {u.email}
                            </div>
                          )}
                        </div>

                        <div
                          className={[
                            "w-5 h-5 rounded border flex items-center justify-center",
                            checked
                              ? "bg-blue-600 border-blue-600"
                              : "bg-white border-gray-300",
                          ].join(" ")}
                        >
                          {checked && (
                            <span className="text-white text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="mt-3 text-xs text-gray-600">
                Selected:{" "}
                <span className="font-semibold">{selectedIds.length}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t">
              <button
                type="button"
                onClick={() => setShowAddMembers(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitAddMembers}
                disabled={!selectedIds.length || savingMembers}
                className={[
                  "px-4 py-2 rounded-xl font-semibold text-white",
                  !selectedIds.length || savingMembers
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700",
                ].join(" ")}
              >
                {savingMembers ? "Adding..." : "Add selected"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
