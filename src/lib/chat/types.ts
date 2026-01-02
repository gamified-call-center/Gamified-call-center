export type PresenceStatus = "online" | "away" | "offline";


export interface ChatUser {
  id: string;
  name: string;
  receiverId?: string;
  status: PresenceStatus;
  lastSeen?: string;
  unreadCount?: number;
  lastMessage?: string;
  timestamp?: string;
  isPinned?: boolean;
  isMuted?: boolean;
  avatarColor: string; // tailwind bg-* class
}

export interface Channel {
  id: string;
  name: string;
  memberCount: number;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  isPrivate?: boolean;
  isPinned?: boolean;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isOwn: boolean;
}

export type MessagesByThread = Record<string, Message[]>;

export type ThreadKind = "dm" | "channel";

export type ServerMessageNew = {
  threadKind: ThreadKind;
  threadId: string;
  message: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    timestamp: string; // or ISO
  };
};

export type ServerMessageAck = {
  threadKind: ThreadKind;
  threadId: string;
  clientId: string;
  serverId: string;
  timestamp: string;
};

export type ServerThreadUpdate =
  | {
      kind: "dm";
      id: string;
      lastMessage?: string;
      timestamp?: string;
      unreadCount?: number;
    }
  | {
      kind: "channel";
      id: string;
      lastMessage?: string;
      timestamp?: string;
      unreadCount?: number;
    };

export type ThreadApiItem = {
  kind: "dm" | "channel";
  id: string;                 // ✅ threadId UUID
  title?: string | null;      // for channel
  lastMessage?: string | null;
  timestamp?: string | null;
  unreadCount?: number;
};

export type DmUser = ChatUser & { threadId?: string };


export type ChannelMember = { userId: string; name: string; role: string };
export type ChannelDetails = {
  id: string;
  kind: "channel" | "dm";
  title: string | null;
  isOwner?: boolean;
  members?: ChannelMember[];
};
