"use client";

import { CheckCircle2, Circle, Zap, Target, Timer, Award, TrendingUp, Sparkles, Clock, Trophy, ChevronRight } from "lucide-react";
import { Mission } from "@/lib/dashboard/types";
import { motion } from "framer-motion";
import { useState } from "react";

interface MissionsProps {
  missions: Mission[];
}

export default function Missions({ missions }: MissionsProps) {
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  
  const activeMissions = missions.filter((m) => m.status === "ACTIVE");
  const completedMissions = missions.filter((m) => m.status === "COMPLETED");
  const totalXpReward = missions.reduce((sum, mission) => sum + mission.xpReward, 0);
  const earnedXp = completedMissions.reduce((sum, mission) => sum + mission.xpReward, 0);

  // Calculate daily progress
  const completionPercentage = missions.length > 0 
    ? Math.round((completedMissions.length / missions.length) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative group h-full"
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-amber-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
      
      {/* Main Card */}
      <div className="relative app-card rounded-3xl shadow-2xl shadow-emerald-200/30 border border-slate-200/50 p-6 h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl blur opacity-30" />
              <div className="relative bg-gradient-to-br from-emerald-600 to-teal-600 p-2.5 rounded-xl shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            
            <div>
              <h2 className="text-xl md:text-2xl  font-Gordita-Bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                Daily Missions
              </h2>
              <p className="text-sm app-muted mt-1">
                Complete tasks to earn XP and rewards
              </p>
            </div>
          </div>

          {/* Stats Badge */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Zap className="w-4 h-4 text-emerald-600" />
                <div className="absolute inset-0 animate-ping bg-emerald-400 rounded-full opacity-20" />
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-600">Progress</div>
                <div className="text-sm  font-Gordita-Bold text-emerald-700">
                  {completedMissions.length}/{missions.length}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Daily Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="text-sm  font-Gordita-Bold text-slate-900">Daily Progress</span>
            </div>
            <span className="text-sm  font-Gordita-Bold text-emerald-700">{completionPercentage}%</span>
          </div>
          
          <div className="relative">
            <div className="h-3 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent animate-shimmer" />
              </motion.div>
            </div>
            
            {/* Progress Indicators */}
            <div className="absolute top-0 left-0 w-full h-3 flex items-center justify-between px-2">
              {[0, 25, 50, 75, 100].map((percent) => (
                <div
                  key={percent}
                  className={`w-2 h-2 rounded-full ${
                    completionPercentage >= percent 
                      ? 'bg-white shadow-lg' 
                      : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* XP Summary */}
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 app-text">
                <Award className="w-3 h-3 text-amber-500" />
                <span>Earned: <strong className="text-emerald-700">{earnedXp} XP</strong></span>
              </div>
              <div className="flex items-center gap-1 app-text">
                <Trophy className="w-3 h-3 text-purple-500" />
                <span>Available: <strong className="app-text">{totalXpReward} XP</strong></span>
              </div>
            </div>
            <span className="text-emerald-700  font-Gordita-Medium">
              {totalXpReward - earnedXp} XP remaining
            </span>
          </div>
        </div>

        {/* Active Missions */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <h3 className="text-sm  font-Gordita-Bold app-text">
              Active Missions ({activeMissions.length})
            </h3>
          </div>
          
          {activeMissions.length > 0 ? (
            activeMissions.map((mission, index) => (
              <MissionRow 
                key={mission.id} 
                mission={mission} 
                index={index}
                isSelected={selectedMission === mission.id}
                onSelect={() => setSelectedMission(
                  selectedMission === mission.id ? null : mission.id
                )}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4">
                <Target className="w-8 h-8 app-text" />
              </div>
              <p className="app-text text-sm">No active missions available</p>
              <p className="app-muted text-xs mt-1">Check back later for new missions</p>
            </div>
          )}
        </div>

        {/* Completed Missions */}
        {completedMissions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm  font-Gordita-Bold app-text">
                  Completed ({completedMissions.length})
                </h3>
              </div>
              <span className="text-xs text-emerald-700  font-Gordita-Medium">
                +{earnedXp} XP earned
              </span>
            </div>

            <div className="space-y-3">
              {completedMissions.slice(0, 3).map((mission) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl app-surface border border-emerald-200/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <div className="absolute inset-0 bg-emerald-500 rounded-full blur opacity-20" />
                      </div>
                      <div>
                        <div className="text-sm  font-Gordita-Bold app-text line-through">
                          {mission.title}
                        </div>
                        {mission.description && (
                          <p className="text-xs app-text mt-1 line-clamp-1">
                            {mission.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs  font-Gordita-Bold rounded-lg shadow-sm">
                        +{mission.xpReward} XP
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  
                  {/* Time Info */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Completed {new Date(mission.endsAt).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-6 border-t app-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs app-text">Daily reset in</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-blue-500" />
              <span className="text-sm  font-Gordita-Bold app-text">23:45:12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shimmer Animation */}
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

interface MissionRowProps {
  mission: Mission;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

function MissionRow({ mission, index, isSelected, onSelect }: MissionRowProps) {
  const progressPercentage = Math.max(
    0,
    Math.min(100, Math.round((mission.progress / mission.target) * 100))
  );

  const timeRemaining = new Date(mission.endsAt);
  const isExpiringSoon = timeRemaining.getTime() - Date.now() < 24 * 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className={`group relative rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-emerald-300 bg-gradient-to-r from-emerald-50/50 via-white to-white shadow-lg shadow-emerald-200/50'
          : 'border-slate-200 hover:border-emerald-200 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="relative">
              {isExpiringSoon && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
              )}
              <div className={`p-2 rounded-lg transition-all duration-200 ${
                progressPercentage >= 100 
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                  : 'bg-slate-100 group-hover:bg-emerald-50'
              }`}>
                <Circle className={`w-4 h-4 ${
                  progressPercentage >= 100 ? 'text-white' : 'text-slate-400 group-hover:text-emerald-500'
                }`} />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className=" font-Gordita-Bold app-text">{mission.title}</h4>
                {isExpiringSoon && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-xs  font-Gordita-Bold rounded-full animate-pulse">
                    SOON
                  </span>
                )}
              </div>
              
              {mission.description && (
                <p className="text-sm app-muted mt-1 line-clamp-2">
                  {mission.description}
                </p>
              )}
            </div>
          </div>
          
          {/* XP Reward Badge */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-700 text-sm  font-Gordita-Bold rounded-lg shadow-sm min-w-[70px] text-center"
          >
            +{mission.xpReward} XP
          </motion.div>
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 app-text">
              <TrendingUp className="w-4 h-4" />
              <span>Progress: {mission.progress}/{mission.target}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm  font-Gordita-Bold text-emerald-700">{progressPercentage}%</span>
              {progressPercentage >= 100 && (
                <div className="px-2 py-0.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs  font-Gordita-Bold rounded-full">
                  READY
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="h-2.5 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
                className={`h-full rounded-full ${
                  progressPercentage >= 100
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent animate-shimmer" />
              </motion.div>
            </div>
            
            {/* Progress Indicator */}
            {progressPercentage > 0 && progressPercentage < 100 && (
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-4 border-emerald-500 flex items-center justify-center"
                style={{ left: `${progressPercentage}%`, marginLeft: '-12px' }}
              >
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              </div>
            )}
          </div>
          
          {/* Time Info */}
          <div className="flex items-center justify-between text-xs app-text">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>Ends {new Date(mission.endsAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            </div>
            <span className={isExpiringSoon ? 'text-amber-600  font-Gordita-Medium' : 'text-slate-500'}>
              {isExpiringSoon ? 'Expiring soon!' : `${Math.ceil((timeRemaining.getTime() - Date.now()) / (1000 * 60 * 60))}h left`}
            </span>
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-lg text-xs text-slate-600"
          >
            Click to view details
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}