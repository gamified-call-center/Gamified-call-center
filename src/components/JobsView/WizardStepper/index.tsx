"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

type Step = { key: string; title: string; subtitle?: string };

type WizardStepperProps = {
  steps: Step[];
  activeStep: number;       // 0-based
  onStepClick?: (idx: number) => void; // optional if you want jump
};

export default function WizardStepper({ steps, activeStep, onStepClick }: WizardStepperProps) {
  const count = steps.length;
  const progressPercent = Math.round(((activeStep + 1) / count) * 100);

  const isActive = (i: number) => i === activeStep;
  const isCompleted = (i: number) => i < activeStep;

  return (
    <div className="w-full md:max-w-[82%] mx-auto md:px-6 px-2 py-6">

      {/* Labels row */}
      <div className="grid grid-cols-4 gap-2 text-center text-[10px] md:text-[14px] font-medium text-slate-600 dark:text-slate-300 md:mb-3 mb-1">
        {steps.map((s, i) => (
          <div
            key={s.key}
            className={  isActive(i) ? "text-teal-700 dark:text-teal-300" : isCompleted(i) ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-500"}
          >
            {s.title}
          </div>
        ))}
      </div>

      {/* Stepper container */}
      <div className="relative rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 md:p-3 p-2 shadow-sm">

        {/* Steps with lines */}
        <div className="flex items-center justify-between gap-3">
          {steps.map((s, i) => (
            <div key={s.key} className="flex-1 relative flex flex-col items-center">

              {/* Left connecting line */}
              {i > 0 && (
                <div className="absolute top-[18px] left-0 w-1/2 h-[3px] bg-slate-200 dark:bg-slate-700">
                  {isCompleted(i) && <motion.div className="h-full bg-teal-500" initial={{ width: 0 }} animate={{ width: "100%" }} />}
                </div>
              )}

              {/* Step Button */}
              <button
                type="button"
                onClick={() => onStepClick?.(i)}
                className={[
                  "relative z-[2] w-10 h-10 md:w-9 md:h-9 rounded-full border-2 flex items-center justify-center font-semibold transition-all",
                  isActive(i) ? "bg-teal-600 border-teal-600 text-white shadow-md dark:bg-teal-500 dark:border-teal-500" :
                  isCompleted(i) ? "bg-white border-teal-400 text-teal-700 dark:bg-slate-800 dark:text-teal-300" :
                  "bg-gray-200 border-gray-300 text-gray-600 dark:bg-slate-700 dark:text-slate-200"
                ].join(" ")}
              >
                {isCompleted(i) ? <CheckCircle2 size={18} /> : i + 1}
              </button>

              {/* Subtitle */}
              {s.subtitle && <p className="md:text-xs md:block hidden text-[10px] font-medium mt-1 text-center">{s.subtitle}</p>}

              {/* Right connecting line */}
              {i < count - 1 && (
                <div className="absolute top-[18px] right-0 w-1/2 h-[3px] bg-slate-200 dark:bg-slate-700">
                  {isCompleted(i + 1) && <motion.div className="h-full bg-teal-500" initial={{ width: 0 }} animate={{ width: "100%" }} />}
                </div>
              )}

            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar with percentage inside */}
      <div className="relative mt-5 h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />

        {/* Percentage badge centered inside bar */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white drop-shadow-md">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-3 flex justify-between text-[11px] md:text-[12px] text-slate-500 dark:text-slate-400">
        <span>Step <b className="text-slate-700 dark:text-white">{activeStep + 1}</b> of <b className="text-slate-700 dark:text-white">{count}</b></span>
      </div>

      {/* Navigation Buttons */}
   

    </div>
  );
}


