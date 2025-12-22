"use client";

import React, { type ComponentType, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type WithAdminLayoutOptions = {
  hideChrome?: boolean;
  title?: string;
};

const SIDEBAR_WIDTH = 280;

function AdminShell({
  children,
  title,
  hideChrome,
}: {
  children: React.ReactNode;
  title?: string;
  hideChrome?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  if (hideChrome) return <>{children}</>;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F5F7FB] flex">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main */}
      <div className="flex-1 flex flex-col md:ml-70 ml-0">
        <Topbar title={title} onOpenSidebar={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto scrollbar-hide px-2 py-10">
          {children}
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
    <AdminShell title={options?.title} hideChrome={options?.hideChrome}>
      <Wrapped {...props} />
    </AdminShell>
  );

  return ComponentWithLayout;
}
