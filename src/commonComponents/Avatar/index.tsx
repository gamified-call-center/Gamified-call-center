"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, User2, Settings } from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

export default function AvatarMenu({
  name = "Super Admin",
  role = "Administrator",
  onLogout,
}: {
  name?: string;
  role?: string;
  onLogout?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogout = () => {
    console.log("navigating to the login page")
    router.push('/login')
  }

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const handleClick = () => {
    setOpen(false);
    router.push("/userprofile");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 transition"
        aria-label="Open profile menu"
        aria-expanded={open}
      >
        <div className="h-9 w-9 rounded-full bg-black/10" />
        <div className="hidden sm:flex flex-col leading-tight text-left">
          <span className="text-sm  font-Gordita-Bold text-[#111827]">{name}</span>
          <span className="text-xs text-black/50">{role}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-black/50 hidden sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-[10px] py-2 bg-white shadow-xl border border-black/10 z-50 overflow-hidden">
          <button
            className="w-full flex items-center gap-2  font-Gordita-Bold text-gray-700 px-4 md:py-2 py-1 text-sm hover:bg-black/5"
            onClick={handleClick}
          >
            <User2 className="h-4 w-4" />
            Profile
          </button>
          <button
            className="w-full flex items-center text-gray-700  font-Gordita-Bold gap-2 px-4 md:py-2 py-1 text-sm hover:bg-black/5"
            onClick={() => setOpen(false)}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>

          <div className="h-px bg-black/10" />

          <button
            className={clsx(
              "w-full flex items-center gap-2 px-4 py-3  font-Gordita-Bold text-sm",
              "hover:bg-red-50 text-red-600"
            )}
            onClick={() => { handleLogout() }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
