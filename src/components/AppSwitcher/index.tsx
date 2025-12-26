"use client";

import { motion } from "framer-motion";
import { AppKey } from "@/lib/dashboard/types";
import { 
  Building2, 
  HeartPulse, 
  Receipt, 
  Rocket,
  ChevronRight,
  Check
} from "lucide-react";
import { useState } from "react";

const APPS: { 
  key: AppKey; 
  label: string; 
  sub: string; 
  icon: React.ReactNode;
  color: string;
  gradient: string;
}[] = [
  { 
    key: "ACA", 
    label: "ACA", 
    sub: "Affordable Care Act", 
    icon: <Building2 className="w-4 h-4" />,
    color: "from-blue-500 to-cyan-500",
    gradient: "from-blue-100 to-cyan-100"
  },
  { 
    key: "MEDICARE", 
    label: "Medicare", 
    sub: "Health Coverage", 
    icon: <HeartPulse className="w-4 h-4" />,
    color: "from-purple-500 to-pink-500",
    gradient: "from-purple-100 to-pink-100"
  },
  { 
    key: "TAXATION", 
    label: "Taxation", 
    sub: "Tax Operations", 
    icon: <Receipt className="w-4 h-4" />,
    color: "from-emerald-500 to-teal-500",
    gradient: "from-emerald-100 to-teal-100"
  },
  { 
    key: "LAUNCHPAD", 
    label: "Launch Pad", 
    sub: "Internal Tools", 
    icon: <Rocket className="w-4 h-4" />,
    color: "from-amber-500 to-orange-500",
    gradient: "from-amber-100 to-orange-100"
  },
];

export default function AppSwitcher({
  value,
  onChange,
  className = "",
}: {
  value: AppKey;
  onChange: (v: AppKey) => void;
  className?: string;
}) {
  const [hoveredApp, setHoveredApp] = useState<AppKey | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group ${className}`}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
      
      {/* Main Container */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-blue-200/50 border border-slate-200/50 p-1.5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {APPS.map((app) => {
            const isActive = app.key === value;
            const isHovered = app.key === hoveredApp;

            return (
              <motion.button
                key={app.key}
                onClick={() => onChange(app.key)}
                onMouseEnter={() => setHoveredApp(app.key)}
                onMouseLeave={() => setHoveredApp(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative rounded-xl px-4 py-3 text-left outline-none transition-all duration-200"
              >
                {/* Active/Hover Background */}
                {isActive && (
                  <motion.div
                    layoutId="app-pill"
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${app.color} shadow-lg`}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                
                {!isActive && isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${app.gradient} border border-slate-300`}
                  />
                )}

                {/* Content */}
                <div className="relative z-10 flex items-center gap-3">
                  {/* Icon Container */}
                  <motion.div
                    animate={{ 
                      scale: isActive ? 1.1 : 1,
                      rotate: isActive ? [0, 5, -5, 0] : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className={`p-2 rounded-lg ${
                      isActive 
                        ? 'bg-white/20' 
                        : `bg-gradient-to-br ${app.gradient}`
                    }`}
                  >
                    <div className={isActive ? 'text-white' : `bg-gradient-to-br ${app.color} bg-clip-text text-transparent`}>
                      {app.icon}
                    </div>
                  </motion.div>

                  {/* Text Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm  font-Gordita-Bold ${
                        isActive ? 'text-white' : 'text-slate-900'
                      }`}>
                        {app.label}
                      </span>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4 bg-white rounded-full flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                        </motion.div>
                      )}
                    </div>
                    <div className={`text-xs ${
                      isActive ? 'text-white/90' : 'text-slate-600'
                    }`}>
                      {app.sub}
                    </div>
                  </div>

                  {/* Active Indicator Arrow */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </div>

                {/* Hover Effect Glow */}
                {isHovered && !isActive && (
                  <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-slate-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 pt-3 border-t border-slate-200/50 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-600">Active Application</span>
          </div>
          <div className="text-xs text-slate-500">
            {APPS.find(a => a.key === value)?.sub}
          </div>
        </motion.div>
      </div>

      {/* Tooltip for hovered app */}
      {hoveredApp && hoveredApp !== value && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-xl z-50"
        >
          Switch to {APPS.find(a => a.key === hoveredApp)?.label}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
        </motion.div>
      )}
    </motion.div>
  );
}