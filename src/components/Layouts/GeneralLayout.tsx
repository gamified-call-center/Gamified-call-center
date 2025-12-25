"use client";

import React, { type ComponentType, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import FloatingChatButton from "../ChatButton";
import ThemeToggle from "@/commonComponents/ThemeToggle";

type WithAdminLayoutOptions = {
  hideChrome?: boolean;
};

function AdminShell({
  children,
  hideChrome,
}: {
  children: React.ReactNode;
  hideChrome?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const title = useMemo(() => {
    if (!pathname) return "";

    const parts = pathname.split("/").filter(Boolean);

    const relevant = parts.slice(-2);
    return relevant
      .map((part) =>
        part.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      )
      .join(" > ");
  }, [pathname]);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  if (hideChrome) return <>{children}</>;

  return (
    <div className="h-screen w-full bg-[#F5F7FB] flex">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 md:ml-70 ml-0">
        <Topbar title={title} onOpenSidebar={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-x-auto overflow-y-auto md:px-6 px-2 py-3 min-w-0 app-surface">
          
          {children}
          <FloatingChatButton />
        </main>
      </div>
    </div>
  );
}

export default function withAdminLayout<P extends object>(
  Wrapped: ComponentType<P>,
  options?: WithAdminLayoutOptions
) {
  const ComponentWithLayout = (props: P) => (
    <AdminShell hideChrome={options?.hideChrome}>
      <Wrapped {...props} />
    </AdminShell>
  );

  return ComponentWithLayout;
}
