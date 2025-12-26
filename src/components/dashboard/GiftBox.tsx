import { Gift } from 'lucide-react';

export default function GiftBox() {
  return (
    <div className="h-full bg-slate-800/40 backdrop-blur-xl rounded-[10px] border border-white/10 p-6">
      <h3 className="text-lg  font-Gordita-Bold text-white mb-4">Gift Box</h3>

      <div className="relative">
        <div className="bg-linear-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl p-6 flex flex-col items-center justify-center aspect-square">
          <div className="relative">
            <Gift size={48} className="text-amber-400" />
            <div className="absolute inset-0 animate-pulse">
              <Gift size={48} className="text-amber-400 opacity-50" />
            </div>
          </div>

          <p className="text-amber-400  font-Gordita-Bold text-lg mt-4 animate-pulse">
            Gold Box Ready!
          </p>
          <p className="text-slate-400 text-sm mt-2 text-center">
            Complete 3 more missions to unlock
          </p>
        </div>

        <button className="w-full mt-4 bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white  font-Gordita-Bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50">
          Claim Reward
        </button>
      </div>
    </div>
  );
}
