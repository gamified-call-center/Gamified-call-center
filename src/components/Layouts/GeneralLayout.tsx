"use client";

import React, { type ComponentType, useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type WithAdminLayoutOptions = {
  hideChrome?: boolean;
  title?: string;
};

const MIN_SIDEBAR = 240;
const MAX_SIDEBAR = 360;
const DEFAULT_SIDEBAR = 280;
const COLLAPSED_SIDEBAR = 76;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function AdminShell({
  children,
  title,
  hideChrome,
}: {
  children: React.ReactNode;
  title?: string;
  hideChrome?: boolean;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR);
  const [collapsed, setCollapsed] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarLeft = useMemo(() => (collapsed ? COLLAPSED_SIDEBAR : sidebarWidth), [collapsed, sidebarWidth]);

  const setWidthSafe = useCallback((w: number) => {
    setSidebarWidth(clamp(Math.round(w), MIN_SIDEBAR, MAX_SIDEBAR));
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (hideChrome) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <Sidebar
        width={sidebarWidth}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        onWidthChange={setWidthSafe}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <Topbar
        title={title ?? "Admin Panel"}
        sidebarLeft={sidebarLeft}
        onOpenSidebar={() => setMobileOpen(true)}
      />

      <div
        className="pt-16 px-4 md:px-6 pb-6 transition-[margin] duration-200"
        style={{ marginLeft: sidebarLeft }}
      >
        <main>{children}</main>
      </div>
    </div>
  );
}

export default function withAdminLayout<P extends object>(
  Wrapped: ComponentType<P>,
  options?: WithAdminLayoutOptions
) {
  const ComponentWithLayout = (props: P) => {
    return (
      <AdminShell title={options?.title} hideChrome={options?.hideChrome}>
        <Wrapped {...props} />
      </AdminShell>
    );
  };

  ComponentWithLayout.displayName = `withAdminLayout(${Wrapped.displayName || Wrapped.name || "Component"})`;
  return ComponentWithLayout;
}
