"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Trophy,
  MessageSquareText,
  GraduationCap,
  X,
  Sparkles,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: any;
  badge?: string;
};
type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    title: "MENU",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Agents", href: "/agents", icon: Users },
      { label: "Deals", href: "/aca/deals", icon: Briefcase },
    ],
  },
  {
    title: "REPORTS",
    items: [
      { label: "Leader Board", href: "/leaderboard", icon: Trophy },
      { label: "Chat History", href: "/chat-history", icon: MessageSquareText },
    ],
  },
  {
    title: "LEARNING",
    items: [{ label: "Training", href: "/training", icon: GraduationCap, badge: "New" }],
  },
];

const MIN_SIDEBAR = 240;
const MAX_SIDEBAR = 360;
const COLLAPSED_SIDEBAR = 76;

type SidebarProps = {
  width: number; // resizable
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onWidthChange: (w: number) => void;

  mobileOpen: boolean;
  onCloseMobile: () => void;

  user?: { name: string; role?: string; initials?: string };
  xp?: { level: number; current: number; next: number };
  rewards?: { points: number };
};

export default function Sidebar({
  width,
  collapsed,
  onToggleCollapsed,
  onWidthChange,
  mobileOpen,
  onCloseMobile,
  user = { name: "Kishor Reddy", role: "Director", initials: "JD" },
  xp = { level: 5, current: 300, next: 500 },
  rewards = { points: 120 },
}: SidebarProps) {
  const pathname = usePathname();

  // close mobile on route change
  useEffect(() => {
    onCloseMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const xpPct = Math.min(100, Math.round((xp.current / xp.next) * 100));
  const effectiveWidth = collapsed ? COLLAPSED_SIDEBAR : width;

  // drag resize
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);
  const startWRef = useRef(width);

  const startDrag = (clientX: number) => {
    if (collapsed) return;
    setDragging(true);
    startXRef.current = clientX;
    startWRef.current = width;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchmove", onTouchMove, { passive: false } as any);
    window.addEventListener("touchend", stopDrag);
  };

  const onMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - startXRef.current;
    const next = startWRef.current + dx;
    onWidthChange(Math.max(MIN_SIDEBAR, Math.min(MAX_SIDEBAR, next)));
  };

  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const t = e.touches?.[0];
    if (!t) return;
    const dx = t.clientX - startXRef.current;
    const next = startWRef.current + dx;
    onWidthChange(Math.max(MIN_SIDEBAR, Math.min(MAX_SIDEBAR, next)));
  };

  const stopDrag = () => {
    setDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", stopDrag);
    window.removeEventListener("touchmove", onTouchMove as any);
    window.removeEventListener("touchend", stopDrag);
  };

  useEffect(() => () => stopDrag(), []);

  const SidebarContent = useMemo(() => {
    const NavLink = ({ item }: { item: NavItem }) => {
      const Icon = item.icon;
      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

      return (
        <Link
          href={item.href}
          className={clsx(
            "group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition",
            isActive ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/[0.07] hover:text-white"
          )}
          title={collapsed ? item.label : undefined}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={clsx(
                "grid place-items-center h-9 w-9 rounded-lg transition",
                isActive ? "bg-white/10" : "bg-white/5 group-hover:bg-white/[0.07]"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>

            {!collapsed && <span className="font-semibold text-[14px] truncate">{item.label}</span>}
          </div>

          {!collapsed && (
            <div className="flex items-center gap-2">
              {item.badge ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-400/20">
                  {item.badge}
                </span>
              ) : null}

              <span
                className={clsx(
                  "h-2 w-2 rounded-full transition",
                  isActive ? "bg-emerald-400" : "bg-transparent group-hover:bg-white/20"
                )}
              />
            </div>
          )}
        </Link>
      );
    };

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <div className={clsx("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10" />
            {!collapsed && (
              <div className="leading-tight">
                <div className="text-white font-semibold text-[18px]">Think</div>
                <div className="text-white/70 text-[12px] -mt-0.5">Insurance First</div>
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          <div className={clsx("mt-4 flex", collapsed ? "justify-center" : "justify-end")}>
            <button
              onClick={onToggleCollapsed}
              className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 grid place-items-center"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? (
                <ChevronsRight className="h-5 w-5 text-white/80" />
              ) : (
                <ChevronsLeft className="h-5 w-5 text-white/80" />
              )}
            </button>
          </div>
        </div>

        {/* XP card */}
        {!collapsed && (
          <div className="px-5 pt-4">
            <div className="rounded-xl bg-[#477891] border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="text-white/90 text-xs font-semibold tracking-wider">AGENT PROGRESS</div>
                <span className="inline-flex items-center gap-1 text-[12px] text-emerald-200">
                  <Sparkles className="h-4 w-4" />
                  Lv {xp.level}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[12px] text-white/70">
                  <span>
                    XP {xp.current}/{xp.next}
                  </span>
                  <span className="text-emerald-200 font-semibold">{xpPct}%</span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-400/80 rounded-full" style={{ width: `${xpPct}%` }} />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-[12px] text-white/70">Rewards</div>
                  <div className="text-[12px] font-semibold text-white">{rewards.points} pts</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sections */}
        <div className="mt-4 px-5">
          {SECTIONS.map((sec) => (
            <div key={sec.title} className="mb-4">
              {!collapsed && (
                <div className="px-1 pb-2 text-[11px] tracking-widest text-white/50 font-bold">
                  {sec.title}
                </div>
              )}
              <div className="space-y-1">
                {sec.items.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom user card */}
        <div className="mt-auto px-5 pb-6">
          <div
            className={clsx(
              "rounded-xl bg-[#256e90] border border-white/10 p-3 flex items-center gap-3",
              collapsed && "justify-center"
            )}
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400/80 to-blue-500/80 flex items-center justify-center text-white font-semibold text-sm">
              {user.initials ?? "JD"}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-white font-semibold text-sm truncate">{user.name}</div>
                <div className="text-white/60 text-xs truncate">{user.role ?? "Agent"}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [collapsed, onToggleCollapsed, pathname, rewards.points, user.initials, user.name, user.role, xp.current, xp.level, xp.next, xpPct]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:block fixed left-0 top-0 h-screen z-50 bg-[#131313] backdrop-blur-xl border-r border-white/10"
        style={{ width: effectiveWidth }}
      >
        {SidebarContent}

        {/* Drag handle (desktop only) */}
        {!collapsed && (
          <div
            className={clsx(
              "absolute top-0 right-0 h-full w-2 cursor-col-resize",
              "hover:bg-white/10",
              dragging && "bg-white/10"
            )}
            onMouseDown={(e) => {
              e.preventDefault();
              startDrag(e.clientX);
            }}
            onTouchStart={(e) => {
              const t = e.touches?.[0];
              if (!t) return;
              startDrag(t.clientX);
            }}
            aria-label="Resize sidebar"
            title="Drag to resize"
          />
        )}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-60"
            onClick={onCloseMobile}
          />
          <aside
            className="md:hidden fixed left-0 top-0 h-screen z-70 bg-[#131313] border-r border-white/10"
            style={{ width: Math.min(320, Math.max(260, width)) }}
          >
            <div className="absolute top-3 right-3">
              <button
                onClick={onCloseMobile}
                className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 grid place-items-center"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5 text-white/80" />
              </button>
            </div>
            {SidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
