import { Trophy, Flame } from "lucide-react";

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
  const rawProgress =
    xpToNextLevel > 0 ? (currentXp / xpToNextLevel) * 100 : 0;

  const progressPercentage = Math.min(Math.max(rawProgress, 0), 100);

  return (
    <div className="app-card rounded-3xl border app-border p-6 lg:p-8 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* LEVEL INFO */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-amber-400 via-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-400/40">
              <Trophy size={32} className="text-white" />
            </div>

            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center shadow-sm">
              <span className="text-xs  font-Gordita-Bold text-amber-600">
                {level}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-3xl  font-Gordita-Bold app-text">
              Level {level}
            </h3>
            <p className="text-sm app-text mt-1">
              {currentXp} / {xpToNextLevel} XP
            </p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="app-text">
                Progress to Level {level + 1}
              </span>
              <span className="text-emerald-600  font-Gordita-Bold">
                {Math.round(progressPercentage)}%
              </span>
            </div>

            <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="h-full w-full bg-linear-to-r from-white/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* DAILY STREAK */}
        <div className="flex justify-end">
          <div className="bg-linear-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-sm">
            <div className="relative">
              <Flame size={32} className="text-orange-500" />
              <div className="absolute inset-0 animate-pulse">
                <Flame size={32} className="text-orange-400 opacity-40" />
              </div>
            </div>

            <div>
              <p className="text-3xl  font-Gordita-Bold text-slate-900">
                {dailyStreak}
              </p>
              <p className="text-sm text-orange-600">
                Day Streak
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
