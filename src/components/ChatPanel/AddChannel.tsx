"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Users, Check } from "lucide-react";
import apiClient from "@/Utils/apiClient";
import toast from "react-hot-toast";

type UserPick = {
  id: string;
  name:string,
  email?: string;
};

type CreateChannelResponse = {
  id: string;
  title: string;
  kind: "channel";
};

export function AddChannel({
  open,
  onClose,
  users,
  currentUserId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  users: UserPick[];
  currentUserId: string;
  onCreated: (payload: { threadId: string; title: string; memberIds: string[] }) => void;
}) {
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const name = ` ${u.name ?? ""}`.trim().toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, query]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCount = selected.size;

   const createChannel = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      alert("Please enter channel name");
      return;
    }
    if (selected.size < 1) {
      alert("Select at least 1 user");
      return;
    }

    // Include admin himself always
    const memberIds = Array.from(new Set([currentUserId, ...Array.from(selected)]));

    try {
      setLoading(true);
      const res = await apiClient.post(
        `${apiClient.URLS.chatChannels}?userId=${currentUserId}`,
        {
          title: trimmed,
          memberIds,
        }
      );
      console.log("created channal",res)
      const data: CreateChannelResponse = (res.data ?? res.body) as any;

      if (!data?.id) throw new Error("threadId missing");

      onCreated({ threadId: data.id, title: data.title, memberIds });
      onClose();

      // reset UI
      setTitle("");
      setQuery("");
      setSelected(new Set());
    } catch (e: any) {
      toast.error(e);
      toast.error(e?.message ?? "Failed to create channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed z-[90] left-1/2 top-1/2  w-[95vw] max-w-2xl -translate-x-1/2  rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, scale: 0.98, y: "-48%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.98, y: "-48%" }}
            transition={{ type: "spring", stiffness: 420, damping: 35 }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="leading-tight">
                  <h2 className="text-lg font-extrabold text-gray-900">Create Channel</h2>
                  <p className="text-xs text-gray-500">Select members and start realtime chat</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700">Channel name</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sales Team"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 md:py-[6px] py-1 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-11 pr-4 md:py-[6px] py-1 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Selected count */}
              <div className="flex items-center justify-between text-sm">
                <p className="text-gray-700">
                  Selected: <span className="font-bold">{selectedCount}</span>
                </p>
                <p className="text-gray-400 text-xs">Admin will be added automatically</p>
              </div>

              {/* User list */}
              <div className="max-h-[380px] overflow-auto rounded-xl border border-gray-200">
                {users.map((u) => {
                  const name = u?.name ?? "name"
                  const checked = selected.has(u.id);

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggle(u.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="min-w-0 text-left">
                        <p className="font-semibold text-gray-900 truncate">{name}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email ?? ""}</p>
                      </div>

                      <div
                        className={[
                          "w-6 h-6 rounded-lg border flex items-center justify-center",
                          checked ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300",
                        ].join(" ")}
                      >
                        {checked && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </button>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="p-6 text-center text-gray-500">No users found</div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-white">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createChannel}
                disabled={loading}
                className={[
                  "px-5 py-2 rounded-xl font-semibold text-white",
                  loading ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg",
                ].join(" ")}
              >
                {loading ? "Creating..." : "Create Channel"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
