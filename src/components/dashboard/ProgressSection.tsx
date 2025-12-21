'use client';

import { Trophy, Flame, Star, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProgressSectionProps {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  dailyStreak: number;
}

export default function ProgressSection({
  level,
  currentXp,
  xpToNextLevel,
  dailyStreak,
}: ProgressSectionProps) {
  const progressPercentage = (currentXp / xpToNextLevel) * 100;
  
  // Calculate XP remaining
  const xpRemaining = xpToNextLevel - currentXp;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-white via-white to-slate-50 rounded-3xl shadow-2xl shadow-blue-100/50 border border-slate-200/50 p-6 lg:p-8 w-full backdrop-blur-sm"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        
        {/* Level Badge - Premium Centerpiece */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-yellow-400/20 to-orange-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
          
          <div className="relative flex items-center gap-6">
            {/* Animated Orb */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 flex items-center justify-center shadow-2xl shadow-amber-400/30 group-hover:shadow-amber-400/50 transition-all duration-500">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Trophy size={40} className="text-white drop-shadow-lg" />
                </motion.div>
                
                {/* Floating XP particles */}
                <motion.div
                  animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1"
                >
                  <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                </motion.div>
              </div>
              
              {/* Level Badge */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 border-4 border-white shadow-xl flex items-center justify-center"
              >
                <span className="text-sm font-bold text-white">{level}</span>
              </motion.div>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                  Level {level}
                </h3>
                {level >= 5 && (
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-bold rounded-full">
                    ELITE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <p className="text-sm text-slate-600">
                    <span className="font-bold text-slate-900">{currentXp}</span> / {xpToNextLevel} XP
                  </p>
                </div>
                <div className="h-4 w-px bg-slate-300" />
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-amber-600">{xpRemaining} XP</span> to next level
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar Section */}
        <div className="flex-1 max-w-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-semibold text-slate-700">
                  Journey to Level {level + 1}
                </span>
              </div>
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full"
              >
                <span className="text-sm font-bold text-emerald-700">
                  {Math.round(progressPercentage)}%
                </span>
              </motion.div>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="relative">
              <div className="h-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full overflow-hidden border border-slate-300/30 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 rounded-full relative shadow-lg shadow-emerald-400/30"
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/30 animate-shimmer" />
                  
                  {/* Progress indicator dots */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-4 border-emerald-500 flex items-center justify-center">
                    <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                  </div>
                </motion.div>
              </div>
              
              {/* Milestone markers */}
              <div className="absolute top-6 left-0 w-full flex justify-between px-2">
                {[0, 25, 50, 75, 100].map((percent) => (
                  <div key={percent} className="relative">
                    <div className={`w-2 h-2 rounded-full ${progressPercentage >= percent ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs text-slate-500 whitespace-nowrap">
                      {percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* XP Breakdown */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <div className="text-xs text-slate-500 mb-1">Current XP</div>
                <div className="text-lg font-bold text-slate-900">{currentXp}</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="text-xs text-slate-500 mb-1">Next Level</div>
                <div className="text-lg font-bold text-slate-900">{xpToNextLevel}</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="text-xs text-slate-500 mb-1">Progress</div>
                <div className="text-lg font-bold text-slate-900">{Math.round(progressPercentage)}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Streak - Premium */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
          
          <div className="relative bg-gradient-to-br from-white to-orange-50 rounded-2xl border border-orange-200/50 p-5 shadow-lg shadow-orange-200/30 group-hover:shadow-orange-300/50 transition-all duration-300">
            <div className="flex items-center gap-4">
              {/* Animated Flame */}
              <div className="relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <div className="relative">
                    <Flame size={36} className="text-orange-500" />
                    <div className="absolute inset-0">
                      <Flame size={36} className="text-orange-400 opacity-50 animate-pulse" />
                    </div>
                  </div>
                </motion.div>
                
                {/* Streak Badge */}
                {dailyStreak >= 7 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-amber-600 to-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                  >
                    <Star className="w-3 h-3 text-white fill-white" />
                  </motion.div>
                )}
              </div>
              
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {dailyStreak}
                  </p>
                  <span className="text-sm text-orange-600 font-semibold">
                    {dailyStreak >= 30 ? "🔥 LEGENDARY" : 
                     dailyStreak >= 7 ? "🔥 HOT STREAK" : 
                     "DAY STREAK"}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(dailyStreak, 5))].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-400 border-2 border-white shadow-sm"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    {dailyStreak === 1 ? "1st day streak!" : 
                     `${dailyStreak} consecutive days`}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Streak Reward */}
            {dailyStreak >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-3 pt-3 border-t border-orange-200/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">
                    Daily Bonus:
                  </span>
                  <span className="text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                    +{dailyStreak * 10} XP
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Achievement Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 pt-6 border-t border-slate-200/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Next Achievement</h4>
              <p className="text-xs text-slate-500">
                {xpRemaining > 0 
                  ? `Complete ${xpRemaining} XP to reach Level ${level + 1}`
                  : "Ready to level up! 🎉"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-500">Next Level Rewards</div>
              <div className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                +200 XP • 
                <Flame className="w-4 h-4 text-orange-500 ml-1" />
                +7 Day Streak
              </div>
            </div>
            <motion.div
              whileHover={{ rotate: 15 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center border border-emerald-200"
            >
              <Zap className="w-5 h-5 text-emerald-600" />
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Add CSS animation for shimmer effect */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </motion.div>
  );
}