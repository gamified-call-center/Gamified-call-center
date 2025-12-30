"use client";

import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

type LayoutProps = {
  selectedService: string;
};

export default function withJobLayout<P>(
  WrappedComponent: React.ComponentType<P>
) {
  return function LayoutComponent(props: P & LayoutProps) {
    const { selectedService } = props;

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-50 bg-slate-900 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href={"/"}>
              <div className="flex items-center cursor-pointer gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur opacity-30" />
                  <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div>
                  <div className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    ThinkFirst
                  </div>
                  <div className="text-white/50 text-xs">
                    Insurance Platform
                  </div>
                </div>
              </div>
            </Link>

            <div className="flex flex-row gap-5">
              <nav className="flex items-center gap-6 text-sm">
                <div
                  className="text-white cursor-pointer md:text-[16px] text-[14px] font-bold hover:text-white transition"
                >
                  About Us
                </div>
              </nav>
              <nav className="flex items-center gap-6 text-sm">
                <div
                  className="text-white cursor-pointer md:text-[16px] text-[14px] font-bold hover:text-white transition"
                >
                  Jobs
                </div>
              </nav>
            </div>
          </div>
        </header>


        <main className="max-w-7xl mx-auto h-full px-6 py-8">
          <WrappedComponent {...props} />
        </main>
      </div>
    );
  };
}
