"use client"

import { DollarSign, TrendingUp } from 'lucide-react';
import { LiveDeal } from '../../lib/supabase';
import { useEffect, useRef } from 'react';

interface LiveDealsFeedProps {
  deals: LiveDeal[];
}

export default function LiveDealsFeed({ deals }: LiveDealsFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scroll = () => {
      if (scrollContainer.scrollTop >= scrollContainer.scrollHeight / 2) {
        scrollContainer.scrollTop = 0;
      } else {
        scrollContainer.scrollTop += 1;
      }
    };

    const interval = setInterval(scroll, 50);
    return () => clearInterval(interval);
  }, [deals]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const dealTime = new Date(timestamp);
    const diffMs = now.getTime() - dealTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const duplicatedDeals = [...deals, ...deals];

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl rounded-[10px] border border-white/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <TrendingUp size={20} className="text-emerald-400" />
            <div className="absolute inset-0 animate-ping">
              <TrendingUp size={20} className="text-emerald-400 opacity-50" />
            </div>
          </div>
          <h3 className="text-lg  font-Gordita-Bold text-white">Live Deal Updates</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="h-32 overflow-hidden"
        style={{ scrollBehavior: 'auto' }}
      >
        <div className="space-y-0">
          {duplicatedDeals.map((deal, index) => (
            <div
              key={`${deal.id}-${index}`}
              className="flex items-center gap-4 px-6 py-3 border-b border-white/5 hover:bg-slate-700/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white text-xs  font-Gordita-Bold flex-shrink-0">
                {deal.username.substring(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">
                  <span className=" font-Gordita-Bold">{deal.username}</span>
                  <span className="text-slate-400 mx-2">closed</span>
                  <span className="text-emerald-400">{deal.deal_title}</span>
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-3 py-1">
                  <DollarSign size={14} className="text-emerald-400" />
                  <span className="text-sm  font-Gordita-Bold text-emerald-400">
                    {deal.amount.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {formatTimeAgo(deal.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
