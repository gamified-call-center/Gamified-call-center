"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import AppsMenu from "@/commonComponents/AppMenu";
import AvatarMenu from "@/commonComponents/Avatar";
import ThemeToggle from "@/commonComponents/ThemeToggle";
import { useAuthStore } from "@/store/user";
import { useSession } from "next-auth/react";
import {
  Bell,
  ShieldCheck,
  Menu,
  X,
  CheckCheck,
  Trash2,
  Dot,
  BellIcon,
  Check,
} from "lucide-react";
import apiclient from "@/Utils/apiClient";
import { useRouter } from "next/navigation";
import { useAppContextStore } from "@/store/appContext";
import Button from "@/commonComponents/Button";
import apiClient from "@/Utils/apiClient";

type NotificationItem = {
  id: string;
  title: string;
  message?: string;
  isRead: boolean;
  createdAt: Date;
  type?: any;
};

function useOnEscape(handler: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handler();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, handler]);
}

export default function Topbar({
  sidebarLeft = 280,
  onOpenSidebar,
  title = "Admin Panel",
}: {
  sidebarLeft?: number;
  onOpenSidebar?: () => void;
  title?: string;
}) {
  const router = useRouter();
  const session = useSession() as any;
  const { data } = session;
  const [user, setUser] = useState<any>(null);
  const name = user?.firstName ?? "Super Admin";
  const role = user?.employee?.designation?.name ?? "Administrator";
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    // {
    //   id: "n1",
    //   title: "New lead assigned",
    //   message: "A new lead has been assigned to you in ACA Deals.",
    //   time: "2 mins ago",
    //   read: false,
    //   type: "info",
    // },
    // {
    //   id: "n2",
    //   title: "Document uploaded",
    //   message: "A deal document was uploaded successfully.",
    //   time: "1 hour ago",
    //   read: false,
    //   type: "success",
    // },
    // {
    //   id: "n3",
    //   title: "Training reminder",
    //   message: "Complete ‘Objection Handling’ module today.",
    //   time: "Yesterday",
    //   read: true,
    //   type: "warning",
    // },
  ]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );
  const getNotifications = async () => {
    if (!user?.id) return;
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.notifications}/${user?.id}`,
        {}
      );
      if (res.status === 200 && res.body) {
        setNotifications(res.body);
      }
    } catch (error) {
      console.log("error is ", error);
    }
  };
  useEffect(() => {
    if (session.status === "authenticated") {
      const currentUser: any = session.data?.user;
      setUser(currentUser);
    }
  }, [session.status, session.data]);
  useEffect(() => {
    if (user?.id) {
      getNotifications();
    }
  }, [user]);
  const markOneRead = async (id: string) => {
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.notifications}/read`,
        { ids: [id] },
        true
      );
      if (res.status === 200) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    const ids = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (ids.length === 0) return;

    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.notifications}/read`,
        { ids },
        true
      );
      if (res.status === 200) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!notifOpen) return;

    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [notifOpen]);

  useOnEscape(() => setNotifOpen(false), notifOpen);

  useEffect(() => {
    if (!notifOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [notifOpen]);

  const clearAll = () => setNotifications([]);

  const removeOne = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const typeDotClass = (type?: NotificationItem["type"]) => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-amber-600";
      case "danger":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <>
      <header className="h-16 border-b min-w-full border-black/10 flex flex-row justify-between items-center px-4 md:px-6 sticky top-0 z-30 bg-white">
        <div className="flex items-center gap-3">
          <Button
            onClick={onOpenSidebar}
            className="md:hidden h-10 w-10 rounded-lg hover:bg-black/5 grid place-items-center"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5 text-black/70" />
          </Button>

          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-black/70" />
            <div className="text-[15px]  font-bold text-[#111827]">{title}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AppsMenu
            onNavigate={(href: string) => {
              const seg = href.split("/").filter(Boolean)[0] as any;
              if (["aca", "medicare", "taxation", "launchpad"].includes(seg)) {
                useAppContextStore.getState().setSelectedService(seg);
              }
              router.push(href);
            }}
          />

          <ThemeToggle />
          <button
            onClick={() => setNotifOpen(true)}
            className="relative h-10 w-10 rounded-full grid place-items-center   "
          >
            <BellIcon className="h-6 w-6 z-100 dark:text-black" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-1 min-w-[18px] font-medium h-[18px] px-1 rounded-full bg-[#1d2027] text-white text-[10px] grid place-items-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          <div className="hidden sm:block">
            <AvatarMenu />
          </div>
          <div className="sm:hidden">
            <AvatarMenu />
          </div>
        </div>
      </header>

      {notifOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" />
          <div
            ref={panelRef}
            className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Notifications panel"
          >
            <div className="h-16 px-4 border-b border-black/10 flex items-center justify-between">
              <div>
                <div className="text-[16px]  font-bold text-[#111827]">
                  Notifications
                </div>
                <div className="text-[12px] text-black/50">
                  {unreadCount} unread
                </div>
              </div>

              <div className="flex items-center gap-2">
                {notifications?.length > 0 && (
                  <Button
                    onClick={markAllRead}
                    className="h-9 px-3 rounded-lg text-[12px]  font-medium bg-black/5 hover:bg-black/10 text-[#111827] flex items-center gap-2"
                    type="button"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Mark all read
                  </Button>
                )}
                {/* <Button
                  onClick={() => setNotifOpen(false)}
                  className="h-9 w-9 rounded-lg hover:bg-black/5 grid place-items-center"
                  aria-label="Close notifications"
                >
                  <X className="h-5 w-5 text-black/70" />
                </Button> */}
              </div>
            </div>

            <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
              <div className="text-[12px] text-black/60">
                Latest updates & alerts
              </div>
              {/* <Button
                onClick={clearAll}
                className="h-9 px-3 rounded-lg text-[12px]  font-medium bg-red-50 hover:bg-red-100 text-red-700 flex items-center gap-2"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </Button> */}
            </div>

            <div className="flex-1 overflow-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-[14px]  font-medium text-[#111827]">
                    You’re all caught up 🎉
                  </div>
                  <div className="text-[12px] text-black/60 mt-1">
                    No notifications right now.
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-black/10">
                  {notifications?.map((n) => (
                    <li
                      key={n?.id}
                      className={`p-4 hover:bg-black/[0.02] transition ${
                        n?.isRead ? "opacity-80" : "bg-orange-50/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Dot
                          className={`h-8 w-8 -ml-2 -mt-1 ${typeDotClass(
                            n.type
                          )}`}
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="text-[13px]  font-bold text-[#111827]">
                              {n?.title}
                            </div>
                            <div className="text-[11px] text-black/50 whitespace-nowrap">
                              {new Date(n?.createdAt).toLocaleString("en-IN", {
                                timeZone: "+05:30",
                              })}
                            </div>
                          </div>
                          {n?.message && (
                            <div className="text-[12px] text-black/60 mt-1">
                              {n?.message}
                            </div>
                          )}

                          <div className="mt-3 flex items-center gap-2">
                            {!n?.isRead && (
                              <Button
                                onClick={() => markOneRead(n.id)}
                                className="mt-3 h-8 px-3 rounded-lg text-[12px] font-bold bg-black/5 hover:bg-black/10 flex items-center gap-2"
                              >
                                <Check size={14} />
                                Mark read
                              </Button>
                            )}
                            {/* <Button
                              onClick={() => removeOne(n.id)}
                              className="h-8 px-3 rounded-lg text-[12px]  font-medium bg-black/5 hover:bg-black/10 text-[#111827]"
                              type="button"
                            >
                              Remove
                            </Button> */}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 border-t border-black/10">
              <Button
                onClick={() => setNotifOpen(false)}
                className="h-11 w-full rounded-xl bg-[#111827] text-white  font-bold hover:opacity-95 transition"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
