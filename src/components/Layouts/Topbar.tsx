"use client";

import { Menu, Bell, ShieldCheck } from "lucide-react";

export default function Topbar({
  title = "Admin Panel",
  onOpenSidebar,
}: {
  title?: string;
  onOpenSidebar?: () => void;
}) {
  return (
    <header className="h-16 bg-white border-b border-black/10 flex items-center px-4 md:px-6 justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="md:hidden h-10 w-10 rounded-lg hover:bg-black/5 grid place-items-center"
        >
          <Menu className="h-5 w-5 text-black/70" />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-black/70" />
          <span className="font-semibold text-[#111827]">{title}</span>
        </div>
      </div>

      <button className="relative h-10 w-10 rounded-full bg-[#F3F4F6] grid place-items-center">
        <Bell className="h-5 w-5 text-black/70" />
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-orange-500" />
      </button>
    </header>
  );
}
