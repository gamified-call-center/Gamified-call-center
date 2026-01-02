// src/lib/chat/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentIdentityKey: string | null = null;

function identityKey(params: { userId?: string; token?: string }) {
  return params.token ? `token:${params.token}` : `user:${params.userId}`;
}

export function getSocket(params: { userId?: string; token?: string }) {
  if (typeof window === "undefined") return null;

  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url) {
    console.error("NEXT_PUBLIC_BACKEND_URL is missing");
    return null;
  }

  // If you want, you can control this from env:
  // NEXT_PUBLIC_AUTH_ENABLED=true/false
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

  // If auth is enabled -> token required
  // If auth is disabled -> userId required
  const authPayload = authEnabled
    ? { token: params.token }
    : { userId: params.userId };

  const key = identityKey(authEnabled ? { token: params.token } : { userId: params.userId });

  if (!authEnabled && !params.userId) {
    console.error("getSocket: userId missing (dev mode)");
    return null;
  }
  if (authEnabled && !params.token) {
    console.error("getSocket: token missing (auth mode)");
    return null;
  }

  // Recreate socket if identity changed
  if (socket && currentIdentityKey && currentIdentityKey !== key) {
    socket.disconnect();
    socket = null;
  }

  if (!socket) {
    currentIdentityKey = key;

    socket = io(url, {
      transports: ["websocket"],
      autoConnect: true,
      withCredentials: true,
      // ✅ IMPORTANT: your backend reads socket.handshake.auth.*
      auth: authPayload,
    });

    socket.on("connect_error", (err) => {
      console.log("socket connect_error:", err?.message || err);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentIdentityKey = null;
  }
}
