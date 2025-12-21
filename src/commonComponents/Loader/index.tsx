"use client";

import React from "react";

type LoaderProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean; 
  label?: string;
};

export default function Loader({
  className = "",
  size = "lg",
  showLabel = false,
  label = "Loading...",
}: LoaderProps) {
  const sizes = {
    sm: { shield: "w-14 h-14", barsH: "h-10", dot: "w-2 h-2", progressW: "w-44" },
    md: { shield: "w-20 h-20", barsH: "h-14", dot: "w-3 h-3", progressW: "w-64" },
    lg: { shield: "w-28 h-28", barsH: "h-20", dot: "w-3.5 h-3.5", progressW: "w-80" },
  }[size];

  return (
    <div className="flex items-center justify-center min-h-full h-screen  ">
 <div
      className={[
        "flex flex-col items-center justify-center min-h-65 space-y-6",
        className,
      ].join(" ")}
    >
      
      <div className="relative">
        
        <svg
          className={`${sizes.shield} text-gray-200 dark:text-gray-800`}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>

       
        <div className="absolute inset-0 overflow-hidden rounded-[22px]">
          <svg
            className={`${sizes.shield} text-indigo-600 dark:text-indigo-500 animate-[loaderFill_2.2s_ease-in-out_infinite]`}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
          </svg>
        </div>

        
        <div className="absolute -inset-4 rounded-full border border-indigo-300/40 dark:border-indigo-700/30 animate-ping opacity-30" />
      </div>

     
      <div className="flex items-center justify-center gap-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={[
              "w-2.5 rounded-full",
              sizes.barsH,
              "bg-linear-to-b from-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-600",
              "animate-pulse",
            ].join(" ")}
            style={{
              animationDelay: `${i * 0.12}s`,
              animationDuration: "1s",
              transform: `scaleY(${0.55 + i * 0.08})`,
            }}
          />
        ))}
      </div>

    
      <div className="flex flex-col items-center gap-4">
        <div
          className={[
            sizes.progressW,
            "h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden",
          ].join(" ")}
        >
          <div className="h-full bg-linear-to-r from-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-600 animate-[loaderProgress_2s_ease-in-out_infinite]" />
        </div>

        <div className="flex items-center gap-2">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className={`${sizes.dot} rounded-full bg-indigo-600 dark:bg-indigo-500 animate-bounce`}
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>

        {showLabel ? (
          <div className="text-sm text-gray-600 font-medium dark:text-gray-300">{label}</div>
        ) : null}
      </div>

     
    </div>
    </div>
   
  );
}
