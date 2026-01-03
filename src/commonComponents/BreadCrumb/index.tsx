import React from "react";
import { Home, ChevronRight } from "lucide-react";

interface ChatHeaderNavProps {
  homeHref: string;
  title: string;
  icon: React.ReactNode;
  showPulse?: boolean;
}

export const BreadCrumb: React.FC<ChatHeaderNavProps> = ({
  homeHref,
  title,
  icon,
  showPulse = true,
}) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <a
        href={homeHref}
        className="flex items-center gap-2 px-4 py-1 rounded-xl hover:border-blue-200 hover:bg-gradient-to-r hover:from-white hover:to-blue-50/50 transition-all duration-300 group shadow-sm hover:shadow-md"
      >
        <Home className="w-4 h-4 app-text group-hover:text-blue-600 transition-colors duration-300" />
        <span className="text-sm font-semibold app-text group-hover:text-blue-800 transition-colors duration-300">
          Home
        </span>
      </a>

      <ChevronRight className="w-4 h-4 app-muted mx-1" />

      <div className="flex items-center gap-3 px-5 py-1 backdrop-blur-sm border app-border rounded-xl shadow-sm">
        <div className="relative">
          {icon}
          {showPulse && (
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse shadow-[0_0_6px] shadow-blue-400" />
          )}
        </div>

        <span className="text-sm font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent">
          {title}
        </span>

        {showPulse && (
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse" />
        )}
      </div>
    </div>
  );
};
