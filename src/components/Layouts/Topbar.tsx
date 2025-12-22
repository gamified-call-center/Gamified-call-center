"use client";

import AppsMenu from "@/commonComponents/AppMenu";
import AvatarMenu from "@/commonComponents/Avatar";
import { Bell, ShieldCheck, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

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

  return (
    <header className="h-16 border-b min-w-full  border-black/10 flex  flex-row justify-between items-center px-4 md:px-6  sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="md:hidden h-10 w-10 rounded-lg hover:bg-black/5 grid place-items-center"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5 text-black/70" />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-black/70" />
          <div className="text-[15px] font-semibold text-[#111827]">{title}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <AppsMenu
          onNavigate={(href: any) => {
            router.push(href);
          }}
        />

        <button
          className="relative h-10 w-10 rounded-full grid place-items-center bg-[#F3F4F6] hover:bg-[#EDEFF3] transition"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-black/70" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-orange-500" />
        </button>

        <div className="hidden sm:block">
          <AvatarMenu
            name="Super Admin"
            role="Administrator"
            onLogout={() => {
              console.log("logout");
            }}
          />
        </div>

        <div className="sm:hidden">
          <AvatarMenu name="Super Admin" role="Administrator" />
        </div>
      </div>
    </header>
  );
}
