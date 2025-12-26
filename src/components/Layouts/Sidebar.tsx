"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Trophy,
  MessageSquareText,
  GraduationCap,
  X,
  ChevronRight,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useAppContextStore } from "@/store/appContext"; // <-- from step 1

const SIDEBAR_WIDTH = 280;

type NavItemType = {
  label: string;
  href: string; // must be absolute (starts with "/")
  icon: any;
  badge?: string;
  scope?: "service" | "global"; // ✅ NEW
};

type SectionType = {
  title: string;
  items: NavItemType[];
};

const SERVICE_KEYS = ["aca", "medicare", "taxation", "launchpad"] as const;
type ServiceKey = (typeof SERVICE_KEYS)[number];

function isServiceKey(v: string): v is ServiceKey {
  return (SERVICE_KEYS as readonly string[]).includes(v);
}

function getServiceFromPathname(pathname: string | null): ServiceKey | null {
  if (!pathname) return null;
  const first = pathname.split("/").filter(Boolean)[0] || "";
  return isServiceKey(first) ? first : null;
}

function normalizeHref(href: string) {
  return href.startsWith("/") ? href : `/${href}`;
}

function buildHref(service: ServiceKey, item: NavItemType) {
  const cleaned = normalizeHref(item.href);
  if (item.scope === "global") return cleaned;
  return `/${service}${cleaned}`;
}

function getSections(): SectionType[] {
  return [
    {
      title: "MENU",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, scope: "service" },
        { label: "Agents", href: "/agents", icon: Users, scope: "service" },
        { label: "Deals", href: "/deals", icon: Briefcase, scope: "service" },
      ],
    },
    {
      title: "REPORTS",
      items: [
        { label: "Leader Board", href: "/leaderboard", icon: Trophy, scope: "service" },
        { label: "Chat History", href: "/chat", icon: MessageSquareText, scope: "global" },
      ],
    },
    {
      title: "LEARNING",
      items: [
        { label: "Training", href: "/training", icon: GraduationCap, badge: "New", scope: "service" },
      ],
    },
    {
      title: "ADMIN CONTROLS",
      items: [
        { label: "Access Control", href: "/access-control", icon: Shield, scope: "global" },
      ],
    },
  ];
}

export default function Sidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();

  const selectedService = useAppContextStore((s) => s.selectedService);
  const setSelectedService = useAppContextStore((s) => s.setSelectedService);

  useEffect(() => {
    const svc = getServiceFromPathname(pathname);
    if (svc && svc !== selectedService) setSelectedService(svc);
  }, [pathname, selectedService, setSelectedService]);

  const SECTIONS = getSections();

  const NavItem = ({ item }: { item: NavItemType }) => {
    const Icon = item.icon;
    const finalHref = buildHref(selectedService, item);

    const active =
      pathname === finalHref || (pathname?.startsWith(finalHref + "/") ?? false);

    const isNew = item.badge === "New";

    return (
      <Link
        href={finalHref}
        onClick={onCloseMobile}
        className={clsx(
          "group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 mx-2",
          active
            ? "bg-gradient-to-r from-blue-500/15 via-blue-500/10 to-transparent text-white shadow-lg"
            : "text-white hover:bg-white/5 hover:text-white hover:shadow-md"
        )}
      >
        {active && (
          <motion.div
            layoutId="active-sidebar"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-r-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        <div
          className={clsx(
            "relative p-2.5 rounded-lg transition-all duration-200",
            active
              ? "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg"
              : "bg-white/5 group-hover:bg-white/10"
          )}
        >
          <Icon
            className={clsx(
              "h-4 w-4 transition-colors",
              active ? "text-white" : "text-white/70 group-hover:text-white"
            )}
          />

          {isNew && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full border border-[#131313]" />
          )}
        </div>

        <span className="text-sm  font-Gordita-Medium truncate flex-1">{item.label}</span>

        {item.badge && (
          <span className="ml-2 px-2.5 py-0.5 text-[10px]  font-Gordita-Bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-sm">
            {item.badge}
          </span>
        )}

        {active && <ChevronRight className="h-4 w-4 text-blue-400 ml-auto" />}
      </Link>
    );
  };

  const Content = (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#080c16] via-[#1e293b] to-[#060a14] border-r border-white/10">
      <div className="p-6 border-b border-white/10">
        <Link href={`/${selectedService}/dashboard`}>
          <div className="flex items-center cursor-pointer gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur opacity-30" />
              <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>

            <div>
              <div className="text-white  font-Gordita-Bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                ThinkFirst
              </div>
              <div className="text-white/50 text-xs">Insurance Platform</div>
            </div>
          </div>
        </Link>

        <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/70">Active</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-300 text-xs  font-Gordita-Bold">
              <Sparkles className="h-3 w-3" />
              <span>Premium</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="text-[10px] text-white/40  font-Gordita-Bold tracking-widest mb-1 px-3">
              {section.title}
            </div>
            <div className="space-y-1.5">
              {section.items.map((item) => (
                <NavItem key={`${section.title}-${item.label}`} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur opacity-30" />
            <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white  font-Gordita-Bold shadow-lg">
              KR
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1e293b]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm  font-Gordita-Bold text-white truncate">
              Kishor Reddy
            </div>
            <div className="text-[11px] text-white/50 truncate">Director</div>
          </div>

          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200">
            <Zap className="h-4 w-4 text-white/60" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <motion.aside
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="hidden md:block fixed left-0 top-0 h-screen z-40 shadow-2xl shadow-black/50"
        style={{ width: SIDEBAR_WIDTH }}
      >
        {Content}
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="md:hidden fixed left-0 top-0 h-screen z-50 w-full max-w-[280px] shadow-2xl"
            >
              <button
                onClick={onCloseMobile}
                className="absolute top-4 right-4 z-50 p-2.5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 backdrop-blur-sm"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              {Content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
