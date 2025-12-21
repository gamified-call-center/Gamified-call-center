import { Trophy, Flame } from 'lucide-react';

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

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl rounded-[10px] border border-white/10 p-6 lg:p-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between gap-y-4">
        {/* Level  */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/50">
              <Trophy size={32} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center">
              <span className="text-xs font-bold text-amber-400">{level}</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">Level {level}</h3>
            <p className="text-sm text-slate-400 mt-1">
              {currentXp} / {xpToNextLevel} XP
            </p>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="lg:col-span-1">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 mr-2">Progress to Level 
              </span>
              <span className="text-emerald-400 font-semibold">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-4 bg-slate-900/50 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 shadow-lg shadow-emerald-500/30"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="h-full w-full bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Daily Streak */}
        <div className="flex ">
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl px-6 py-4 flex items-center gap-3">
            <div className="relative">
              <Flame size={32} className="text-orange-400" />
              <div className="absolute inset-0 animate-pulse">
                <Flame size={32} className="text-orange-400 opacity-50" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{dailyStreak}</p>
              <p className="text-sm text-orange-300">Day Streak</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
