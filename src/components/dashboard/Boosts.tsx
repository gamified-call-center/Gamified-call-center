import { Zap, Clock } from "lucide-react";
import { Boost } from "../../lib/dashboard/types";

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
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      {/* <h3 className="text-lg  font-Gordita-Bold text-slate-900 mb-4">
        Active Boosts
      </h3>

      {activeBoosts.length === 0 ? (
        <div className="text-center py-8">
          <Zap size={32} className="text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No active boosts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeBoosts.map((boost) => (
            <div
              key={boost.id}
              className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Zap size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className=" font-Gordita-Bold text-slate-900 text-sm">
                      {boost.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Zap size={12} className="text-amber-500" />
                      <span className="text-xs  font-Gordita-Bold text-amber-600">
                        +{boost.xp_bonus} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock size={12} />
                <span>
                  {formatTimeRemaining(boost.expires_at)} remaining
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-900  font-Gordita-Medium py-2 rounded-xl transition-colors border border-slate-300">
        Get More Boosts
      </button> */}
    </div>
  );
}
