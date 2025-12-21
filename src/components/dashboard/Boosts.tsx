import { Zap, Clock } from 'lucide-react';
import { Boost } from '../../lib/supabase';

interface BoostsProps {
  boosts: Boost[];
}

export default function Boosts({ boosts }: BoostsProps) {
  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const activeBoosts = boosts.filter((b) => b.active);

  return (
    <div className="h-full bg-slate-800/40 backdrop-blur-xl rounded-[10px] border border-white/10 p-6">
      <h3 className="text-lg font-bold text-white mb-4">Active Boosts</h3>

      {activeBoosts.length === 0 ? (
        <div className="text-center py-8">
          <Zap size={32} className=" mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No active boosts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeBoosts.map((boost) => (
            <div
              key={boost.id}
              className="bg-linear-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/30 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Zap size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{boost.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Zap size={12} className="text-amber-400" />
                      <span className="text-xs font-bold text-amber-400">
                        +{boost.xp_bonus} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={12} />
                <span>{formatTimeRemaining(boost.expires_at)} remaining</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="w-full mt-4 bg-slate-700/50 hover:bg-slate-700 text-white font-medium py-2 rounded-xl transition-colors border border-white/10">
        Get More Boosts
      </button>
    </div>
  );
}
