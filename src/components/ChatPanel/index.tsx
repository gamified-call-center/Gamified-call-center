"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { getSocket } from "@/lib/chat/socket";
import apiClient from "@/Utils/apiClient";
import { getTimeHour, useIsBelow1300 } from "@/lib/chat/utilFunctions";
import {
  ChatUser,
  Channel,
  Message,
  ServerMessageNew,
  ServerMessageAck,
  ServerThreadUpdate,
  MessagesByThread,
  ChannelDetails,
  DmUser,
} from "@/lib/chat/types";
import Loader from "@/commonComponents/Loader";
import { AddChannel } from "./AddChannel";
import { SidebarContent } from "./SidebarContent";
import { ChatWindow } from "./ChatWindow";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { BreadCrumb } from "@/commonComponents/BreadCrumb";

export default function ChatPanel() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<any>(null);
  const session = useSession();
  const isBelow1300 = useIsBelow1300();
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  const [activeTab, setActiveTab] = useState<"chats" | "channels">("chats");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedChat, setSelectedChat] = useState<DmUser | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const [newMessage, setNewMessage] = useState("");
  const [messagesByThread, setMessagesByThread] = useState<MessagesByThread>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  const [dmList, setDmList] = useState<DmUser[]>([] as any);
  const [channelList, setChannelList] = useState<Channel[]>([] as any);
  const [addChannelOpen, setAddChannelOpen] = useState(false);

  const [availableUsers, setAvailableUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [channelDetails, setChannelDetails] = useState<ChannelDetails | null>(
    null
  );

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const safeUserId = user?.id || session.data?.user?.id;

  const closeActive = () => {
    setSelectedChat(null);
    setSelectedChannel(null);
    setChannelDetails(null);
  };

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return [...dmList].filter((u) =>
      (u.name || "").toLowerCase().includes(query)
    );
  }, [dmList, searchQuery]);

  const filteredChannels = useMemo(
    () =>
      channelList.filter((c: any) =>
        (c.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [channelList, searchQuery]
  );

  const activeTitle = selectedChat
    ? selectedChat.name
    : selectedChannel
    ? selectedChannel.name
    : "";

  const activeThread = useMemo(() => {
    if ((selectedChat as any)?.threadId)
      return { kind: "dm" as const, id: (selectedChat as any).threadId };
    if (selectedChannel)
      return { kind: "channel" as const, id: selectedChannel.id };
    return null;
  }, [selectedChat, selectedChannel]);

  const threadKey = activeThread
    ? `${activeThread.kind}:${activeThread.id}`
    : null;

  const messages = useMemo(() => {
    if (!threadKey) return [];
    return messagesByThread[threadKey] ?? [];
  }, [messagesByThread, threadKey]);

  const isDrawerOpen = Boolean(selectedChat || selectedChannel);

  const fetchChannelDetails = async (threadId: string) => {
    if (!safeUserId) return null;

    const url =
      `${apiClient.URLS.chat}/threads/${threadId}` +
      `?userId=${encodeURIComponent(safeUserId)}`;

    const res = await apiClient.get(url);

    return res.body?.data ?? res.body;
  };

  const refreshChannelDetails = async (threadId: string) => {
    const details = await fetchChannelDetails(threadId);
    if (!details) return null;

    setChannelDetails(details);

    const memberCount = details?.members?.length ?? 0;

    setSelectedChannel((prev) =>
      prev?.id === threadId ? { ...prev, memberCount } : prev
    );
    setChannelList((prev: any) =>
      prev.map((c: any) => (c.id === threadId ? { ...c, memberCount } : c))
    );

    return details;
  };

  const handleAddMembers = async (threadId: string, selectedIds: string[]) => {
    if (!safeUserId) return;

    await addMembersToChannel(threadId, selectedIds);
  };

  const addMembersToChannel = async (
    threadId: string,
    selectedIds: string[]
  ) => {
    if (!safeUserId || !selectedIds.length) return;

    try {
      await apiClient.post(
        `${
          apiClient.URLS.chat
        }/channels/${threadId}/members?userId=${encodeURIComponent(
          safeUserId
        )}`,
        { memberIds: selectedIds }
      );

      await refreshChannelDetails(threadId);
      toast.success("Members added");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add members");
    }
  };

  const removeMemberFromChannel = async (
    threadId: string,
    removeUserId: string
  ) => {
    if (!safeUserId) return;

    try {
      await apiClient.delete(
        `${
          apiClient.URLS.chat
        }/channels/${threadId}/members/${removeUserId}?userId=${encodeURIComponent(
          safeUserId
        )}`
      );

      await refreshChannelDetails(threadId);

      toast.success("Member removed");
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove member");
    }
  };

  const editChannelDescription = async (
    threadId: string,
    description: string
  ) => {
    if (!safeUserId) return;
    const newDescription = description.trim();
    if (!newDescription) {
      toast.error("description cannot be empty");
      return;
    }

    try {
      await apiClient.patch(
        `${
          apiClient.URLS.chat
        }/channels/${threadId}/description?userId=${encodeURIComponent(
          safeUserId
        )}`,
        { description: newDescription }
      );

      const details = await fetchChannelDetails(threadId);
      if (details) setChannelDetails(details);

      setSelectedChannel((prev) =>
        prev?.id === threadId ? { ...prev, description: newDescription } : prev
      );
      setChannelList((prev: any) =>
        prev.map((c: any) =>
          c.id === threadId ? { ...c, description: newDescription } : c
        )
      );

      toast.success("Channel description updated");
    } catch (err) {
      console.error("Failed to update channel description", err);
      toast.error("Failed to update channel description");
    }
  };
  const editChannelTitle = async (threadId: string, title: string) => {
    if (!safeUserId) return;
    const newTitle = title.trim();
    if (!newTitle) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      await apiClient.patch(
        `${
          apiClient.URLS.chat
        }/channels/${threadId}/title?userId=${encodeURIComponent(safeUserId)}`,
        { title: newTitle }
      );

      const details = await fetchChannelDetails(threadId);
      if (details) setChannelDetails(details);

      setSelectedChannel((prev) =>
        prev?.id === threadId ? { ...prev, name: newTitle } : prev
      );
      setChannelList((prev: any) =>
        prev.map((c: any) => (c.id === threadId ? { ...c, name: newTitle } : c))
      );

      toast.success("Channel title updated");
    } catch (err) {
      console.error("Failed to update channel title", err);
      toast.error("Failed to update channel title");
    }
  };

  const deleteChannel = async (threadId: string) => {
    if (!safeUserId) return;

    try {
      await apiClient.delete(
        `${
          apiClient.URLS.chat
        }/channels/${threadId}?userId=${encodeURIComponent(safeUserId)}`
      );

      setSelectedChannel(null);
      setChannelDetails(null);
      setChannelList((prev: any) => prev.filter((c: any) => c.id !== threadId));
      toast.success("Channel deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete channel");
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    if (!activeThread || !threadKey) return;

    const socket = socketRef.current;
    if (!socket) return;

    const clientId = `cli-${Date.now()}`;

    const optimistic: Message = {
      id: clientId,
      content: newMessage.trim(),
      senderId: safeUserId || "me",
      senderName: session?.data?.user?.name || "You",
      timestamp: getTimeHour(new Date().toISOString()),
      isOwn: true,
    };

    setMessagesByThread((prev) => {
      const list = prev[threadKey] ?? [];
      return { ...prev, [threadKey]: [...list, optimistic] };
    });

    socket.emit("message:send", {
      threadKind: activeThread.kind,
      threadId: activeThread.id,
      clientId,
      content: optimistic.content,
    });

    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openDmWithUser = async (u: any) => {
    setSelectedChannel(null);
    setChannelDetails(null);
    setMessagesByThread({});

    try {
      if (!safeUserId) return;

      let threadId = u.threadId;

      if (!threadId) {
        const dmRes = await apiClient.post(
          `${apiClient.URLS.chatDm}?userId=${encodeURIComponent(safeUserId)}`,
          { otherUserId: u.id }
        );

        threadId = dmRes.body?.threadId as string;
        if (!threadId)
          throw new Error("threadId missing from /chat/dm response");

        // store threadId in lists
        const updated = { ...u, threadId };
        setSelectedChat(updated);

        setDmList((prev: any) =>
          prev.map((x: any) => (x.id === u.id ? updated : x))
        );
      } else {
        setSelectedChat(u);
      }

      const msgRes = await apiClient.get(
        `${
          apiClient.URLS.chat
        }/threads/${threadId}/messages?userId=${encodeURIComponent(
          safeUserId
        )}&limit=50`
      );

      const history = (msgRes.body?.data ?? msgRes.body ?? [])
        .map((m: any) => ({
          id: m.id,
          content: m.content,
          senderId: m.senderId,
          senderName: m.senderName ?? "Unknown",
          // keep raw timestamp for sorting
          _ts: new Date(m.timestamp).getTime(),
          timestamp: getTimeHour(m.timestamp),
          isOwn: m.senderId === safeUserId,
        }))
        .sort((a: any, b: any) => a._ts - b._ts)
        .map(({ _ts, ...rest }: any) => rest);

      const key = `dm:${threadId}`;
      setMessagesByThread((prev) => ({ ...prev, [key]: history }));
    } catch (err) {
      console.error("Failed to open DM", err);
      toast.error("Failed to open DM");
    }
  };

  const openChannel = async (c: Channel) => {
    setSelectedChat(null);
    setChannelDetails(null);
    setMessagesByThread({});

    try {
      if (!safeUserId) return;

      const threadId = c.id;
      if (!threadId) throw new Error("channel threadId missing");

      setSelectedChannel(c);

      const details = await fetchChannelDetails(threadId);

      if (details) {
        setChannelDetails(details);

        const memberCount = details?.members?.length ?? c.memberCount ?? 0;

        setSelectedChannel((prev) => (prev ? { ...prev, memberCount } : prev));
        setChannelList((prev: any) =>
          prev.map((x: any) => (x.id === threadId ? { ...x, memberCount } : x))
        );
      }

      const msgRes = await apiClient.get(
        `${apiClient.URLS.chat}/threads/${threadId}/messages`,
        { params: { userId: safeUserId, limit: 50 } }
      );

      const history = (msgRes.body?.data ?? msgRes.body ?? [])
        .map((m: any) => ({
          id: m.id,
          content: m.content,
          senderId: m.senderId,
          senderName: m.senderName ?? "Unknown",
          timestamp: m.timestamp, // keep raw timestamp for sorting
          isOwn: m.senderId === safeUserId,
        }))
        .sort(
          (a: any, b: any) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        .map((m: any) => ({
          ...m,
          timestamp: getTimeHour(m.timestamp), // format AFTER sorting
        })) as Message[];

      const key = `channel:${threadId}`;

      setMessagesByThread((prev) => ({
        ...prev,
        [key]: history,
      }));
    } catch (err) {
      console.error("Failed to open channel", err);
      toast.error("Failed to open channel");
    }
  };

  const loadThreads = async () => {
    setLoading(true);
    try {
      const id = session.data?.user?.id;
      if (!id) return { receiverIds: [] };

      const url = `${apiClient.URLS.chat}/threads?userId=${encodeURIComponent(
        id
      )}`;
      const res = (await apiClient.get(url)) as any;

      const threads = res?.body ?? [];

      const dms: any[] = threads
        .filter((t: any) => t.kind === "dm")
        .map((t: any) => ({
          threadId: t.id,
          name: t.title ?? "",
          status: "offline",
          receiverId: t.receiverId,
          unreadCount: t.unreadCount,
          lastMessage: t.lastMessage,
          timestamp: t.timestamp,
          avatarColor: "bg-blue-500",
        }))
        .sort((a: any, b: any) => {
          const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return tB - tA;
        });

      const chans: Channel[] = threads
        .filter((t: any) => t.kind === "channel")
        .map((t: any) => ({
          id: t.id,
          name: t.title ?? "Channel",
          memberCount: t.memberCount ?? 0,
          unreadCount: t.unreadCount ?? 0,
          lastMessage: t.lastMessage ?? "",
          timestamp: t.timestamp ?? "",
        }))
        .sort((a: any, b: any) => {
          const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return tB - tA;
        });

      setDmList(dms as any);
      setChannelList(chans);
    } catch (e) {
      console.error("Failed to load threads", e);
      toast.error("Failed to load channels");
      return { receiverIds: [] };
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiClient.get(apiClient.URLS.user);
      const all = (res.body.data ?? []) as any[];

      const existingUsersRes = await apiClient.get(
        `${apiClient.URLS.chatUserList}/${id}`
      );
      const availableUsers = (existingUsersRes.body?.available ?? []) as any[];

      const dms: any[] = availableUsers.map((t: any) => ({
        name: t.name ?? "",
        status: "offline",
        id: t.userId,
        avatarColor: "bg-blue-500",
      }));

      setAvailableUsers(dms as any);

      if (res?.status === 200) {
        const mapped: ChatUser[] = all
          .filter((u) => u.id !== id)
          .map((u) => ({
            id: u.id,
            name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
            status: "offline",
            unreadCount: 0,
            lastMessage: "",
            timestamp: "",
            avatarColor: "bg-blue-500",
          }));

        setAllUsers(mapped as any);
        toast.success("Users loaded");
      }
    } catch (e) {
      console.error("Failed to load users", e);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session.status !== "authenticated") return;

    const token = (session.data as any)?.token;
    if (!token) return;

    const init = async () => {
      const user = session.data.user;
      setUser(user);
      setToken(token);
      await loadThreads();
      await loadAllUsers(user?.id as string);
    };

    init();
  }, [session.status, (session.data as any)?.token]);

  useEffect(() => {
    if (!safeUserId) return;

    const socket = getSocket({ userId: safeUserId, token: token || undefined });
    socketRef.current = socket;

    if (!socket) return;

    const onConnect = () => console.log("🟢 Socket connected:", socket.id);
    const onDisconnect = (reason: string) =>
      console.log("🔴 Socket disconnected:", reason);
    const onConnectError = (err: any) =>
      console.error("❌ Socket connect error:", err?.message || err);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, [safeUserId, token]);

  useEffect(() => {
    if (isBelow1300) {
      setSelectedChat(null);
      setSelectedChannel(null);
      setChannelDetails(null);
    }
  }, [isBelow1300]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (!activeThread) return;

    // join
    socket.emit("thread:join", {
      kind: activeThread.kind,
      id: activeThread.id,
    });

    const onMessageNew = (payload: ServerMessageNew) => {
      const key = `${payload.threadKind}:${payload.threadId}`;

      const incoming: Message = {
        id: payload.message.id,
        content: payload.message.content,
        senderId: payload.message.senderId,
        senderName:
          payload.message.senderName ??
          (payload.message.senderId === safeUserId ? "You" : "Unknown"),
        timestamp:
          getTimeHour(payload.message.timestamp) ?? payload.message.timestamp,
        isOwn: payload.message.senderId === safeUserId,
      };

      setMessagesByThread((prev) => {
        const list = prev[key] ?? [];
        if (list.some((m) => m.id === incoming.id)) return prev;
        return { ...prev, [key]: [...list, incoming] };
      });
    };

    const onMessageAck = (payload: ServerMessageAck) => {
      const key = `${payload.threadKind}:${payload.threadId}`;
      setMessagesByThread((prev) => {
        const list = prev[key] ?? [];
        const time = getTimeHour(payload.timestamp) ?? payload.timestamp;

        const next = list.map((m) =>
          m.id === payload.clientId
            ? { ...m, id: payload.serverId, timestamp: time }
            : m
        );
        return { ...prev, [key]: next };
      });
    };

    socket.on("message:new", onMessageNew);
    socket.on("message:ack", onMessageAck);

    return () => {
      socket.emit("thread:leave", {
        kind: activeThread.kind,
        id: activeThread.id,
      });
      socket.off("message:new", onMessageNew);
      socket.off("message:ack", onMessageAck);
    };
  }, [activeThread, safeUserId]);

  useEffect(() => {
    if (selectedChat || selectedChannel) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, selectedChat, selectedChannel]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onThreadUpdate = (t: ServerThreadUpdate) => {
      if (t.kind === "dm") {
        setDmList((prev: any[]) => {
          const idx = prev.findIndex((u) => u.threadId === t.id);
          if (idx === -1) return prev;

          const item = prev[idx];
          const updated = {
            ...item,
            lastMessage: t.lastMessage ?? item.lastMessage,
            timestamp: t.timestamp ?? item.timestamp,
            unreadCount: t.unreadCount ?? item.unreadCount,
          };

          // move to top
          const next = [...prev];
          next.splice(idx, 1);
          return [updated, ...next];
        });
      } else {
        setChannelList((prev: any[]) => {
          const idx = prev.findIndex((c) => c.id === t.id);
          if (idx === -1) return prev;

          const item = prev[idx];
          const updated = {
            ...item,
            name: t.title ?? item.name,
            lastMessage: t.lastMessage ?? item.lastMessage,
            timestamp: t.timestamp ?? item.timestamp,
            unreadCount: t.unreadCount ?? item.unreadCount,
            memberCount: t.memberCount ?? item.memberCount,
          };

          // move to top
          const next = [...prev];
          next.splice(idx, 1);
          return [updated, ...next];
        });
      }
    };

    socket.on("thread:update", onThreadUpdate);
    return () => {
      socket.off("thread:update", onThreadUpdate);
    };
  }, [safeUserId, token]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onOnline = ({ userId }: { userId: string }) => {
      setDmList((prev: any) =>
        prev.map((u: any) =>
          u.receiverId === userId ? { ...u, status: "online" } : u
        )
      );

      setAvailableUsers((prev: any) =>
        prev.map((u: any) => (u.id === userId ? { ...u, status: "online" } : u))
      );
    };

    const onOffline = ({ userId }: { userId: string }) => {
      setDmList((prev: any) =>
        prev.map((u: any) =>
          u.receiverId === userId ? { ...u, status: "offline" } : u
        )
      );

      setAvailableUsers((prev: any) =>
        prev.map((u: any) =>
          u.id === userId ? { ...u, status: "offline" } : u
        )
      );
    };

    socket.on("user:online", onOnline);
    socket.on("user:offline", onOffline);

    return () => {
      socket.off("user:online", onOnline);
      socket.off("user:offline", onOffline);
    };
  }, [safeUserId, token]);

  useEffect(() => {
    const online = new Set(onlineUserIds);

    setDmList((prev: any) =>
      prev.map((u: any) => ({
        ...u,
        status: online.has(u.receiverId) ? "online" : "offline",
      }))
    );

    setAvailableUsers((prev: any) =>
      prev.map((u: any) => ({
        ...u,
        status: online.has(u.id) ? "online" : "offline",
      }))
    );
  }, [onlineUserIds, dmList.length, availableUsers.length]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onPresenceState = ({
      onlineUserIds,
    }: {
      onlineUserIds: string[];
    }) => {
      setOnlineUserIds(onlineUserIds);
    };

    socket.on("presence:state", onPresenceState);
    return () => {
      socket.off("presence:state", onPresenceState);
    };
  }, [safeUserId, token]);

  if (loading) {
    return (
      <div className="w-full h-full items-center flex justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-theme(spacing.16))] overflow-hidden app-surface">
      <div className="px-4 md:px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between app-card backdrop-blur-sm border-b app-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 p-3 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105">
            <MessageSquare className="h-7 w-7 text-white" />
          </div>

          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-500 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Chat Hub
              </h1>
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse shadow-[0_0_8px] shadow-green-400/50" />
            </div>
            <p className="text-sm app-text mt-1 flex items-center gap-1">
              <span className="font-medium">Connect instantly</span>
              <span className="app-muted">•</span>
              <span className="app-text">Real-time messaging</span>
            </p>
          </div>
        </div>

        <BreadCrumb
          homeHref="/aca/dashboard"
          title="Active Chat"
          icon={<MessageSquare className="w-4 h-4 text-blue-600" />}
        />
      </div>

      <div className="flex h-[calc(100vh-theme(spacing.16)-5.5rem)] min-h-0">
        <div className="w-full min-[1300px]:w-96 shrink-0 app-surface flex flex-col h-full min-h-0 border-r app-border">
          <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 min-h-0 overflow-hidden">
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
                onSelectChat={(u) => openDmWithUser(u)}
                onSelectChannel={(c) => openChannel(c)}
                isAdmin={user?.systemRole === "ADMIN"}
                onClickCreateChannel={() => setAddChannelOpen(true)}
                availableUsers={availableUsers}
              />
            </div>
          </div>
        </div>

        <div className="hidden min-[1300px]:flex flex-1 min-w-0 flex-col h-full prof-surface border-none relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full -translate-x-32 -translate-y-32 blur-2xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-blue-50/10 to-indigo-50/10 rounded-full translate-x-48 translate-y-48 blur-2xl" />

          <div className="relative z-10 h-full">
            <ChatWindow
              selectedChat={selectedChat}
              selectedChannel={selectedChannel}
              activeTitle={activeTitle}
              closeActive={closeActive}
              messagesByThread={messagesByThread}
              messagesEndRef={messagesEndRef}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleKeyDown={handleKeyDown}
              handleSendMessage={handleSendMessage}
              channelDetails={channelDetails}
              currentUserId={safeUserId}
              onEditChannelTitle={editChannelTitle}
              onAddMembers={handleAddMembers}
              onRemoveMember={removeMemberFromChannel}
              onDeleteChannel={deleteChannel}
              allUsers={allUsers}
              onEditChannelDescription={editChannelDescription}
            />
          </div>
        </div>

        <AnimatePresence>
          {isDrawerOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close chat"
                onClick={closeActive}
                className="absolute inset-0 z-40 bg-gradient-to-br from-black/40 via-black/30 to-black/20 backdrop-blur-sm min-[1300px]:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              <motion.div
                className="absolute inset-0 z-50 w-full bg-gradient-to-br from-white via-white to-gray-50/90 backdrop-blur-xl shadow-2xl shadow-black/20 min-[1300px]:hidden"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 35,
                  mass: 0.8,
                }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-xl" />

                <div className="relative z-10 h-full">
                  <ChatWindow
                    selectedChat={selectedChat}
                    selectedChannel={selectedChannel}
                    activeTitle={activeTitle}
                    closeActive={closeActive}
                    messagesByThread={messagesByThread}
                    messagesEndRef={messagesEndRef}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    handleKeyDown={handleKeyDown}
                    handleSendMessage={handleSendMessage}
                    showBackButton
                    channelDetails={channelDetails}
                    currentUserId={safeUserId}
                    onEditChannelTitle={editChannelTitle}
                    onAddMembers={handleAddMembers}
                    onRemoveMember={removeMemberFromChannel}
                    onDeleteChannel={deleteChannel}
                    allUsers={allUsers}
                    onEditChannelDescription={editChannelDescription}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {safeUserId && (
          <AddChannel
            open={addChannelOpen}
            onClose={() => setAddChannelOpen(false)}
            users={allUsers.filter((u: any) => u.id !== safeUserId)}
            currentUserId={safeUserId}
            onCreated={({ threadId, title, memberIds }) => {
              setChannelList((prev: any) => [
                {
                  id: threadId,
                  name: title,
                  memberCount: memberIds.length,
                  unreadCount: 0,
                  lastMessage: "",
                  timestamp: "",
                },
                ...prev,
              ]);
            }}
          />
        )}
      </div>
    </div>
  );
}
