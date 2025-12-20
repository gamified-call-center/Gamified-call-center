"use client";
import React, { type ComponentType } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type WithAdminLayoutOptions = {
  hideChrome?: boolean;
  title?: string;
};

function AdminShell({
  children,
  title,
  hideChrome,
}: {
  children: React.ReactNode;
  title?: string;
  hideChrome?: boolean;
}) {
  const SIDEBAR_W = 260;

  if (hideChrome) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <div>
        <Sidebar />
      </div>
      <div className="">
        <Topbar />
        <main className="pt-16 px-4 md:px-6 pb-6 ">{children}</main>
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

  ComponentWithLayout.displayName = `withAdminLayout(${Wrapped.displayName || Wrapped.name || "Component"
    })`;

  return ComponentWithLayout;
}
