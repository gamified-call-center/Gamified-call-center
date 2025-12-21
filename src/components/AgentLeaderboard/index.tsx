'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, Trophy, Crown, Zap, Home, ChevronRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';

// Define agent interface
interface Agent {
  id: number;
  name: string;
  dealsClosed: number;
  color: string;
}

const AgentPerformanceLeaderboard = () => {
  // Hardcoded agent data
  const initialAgents: Agent[] = [
    { id: 1, name: 'Sarah L.', dealsClosed: 92, color: 'from-purple-400 to-pink-400' },
    { id: 2, name: 'Mike D.', dealsClosed: 87, color: 'from-blue-400 to-cyan-400' },
    { id: 3, name: 'Jane R.', dealsClosed: 78, color: 'from-emerald-400 to-teal-400' },
    { id: 4, name: 'Alex T.', dealsClosed: 65, color: 'from-orange-400 to-amber-400' },
    { id: 5, name: 'Emma S.', dealsClosed: 45, color: 'from-rose-400 to-pink-400' },
    { id: 6, name: 'David K.', dealsClosed: 32, color: 'from-indigo-400 to-violet-400' },
    { id: 7, name: 'Lisa M.', dealsClosed: 20, color: 'from-green-400 to-emerald-400' },
  ];

  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [date, setDate] = useState<string>('Dec 21, 2025');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLive, setIsLive] = useState(true);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setAgents(prev => {
        const updated = [...prev];
        const randomIndex = Math.floor(Math.random() * updated.length);
        const randomChange = Math.floor(Math.random() * 3);
        
        if (updated[randomIndex].dealsClosed + randomChange <= 100) {
          updated[randomIndex] = {
            ...updated[randomIndex],
            dealsClosed: updated[randomIndex].dealsClosed + randomChange
          };
        }
        
        // Sort by deals closed
        return updated.sort((a, b) => b.dealsClosed - a.dealsClosed);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Get pastel gradient for agent
  const getPastelGradient = (index: number) => {
    const gradients = [
      'from-blue-100 to-cyan-100',
      'from-emerald-100 to-teal-100',
      'from-violet-100 to-purple-100',
      'from-amber-100 to-orange-100',
      'from-rose-100 to-pink-100',
      'from-sky-100 to-blue-100',
      'from-lime-100 to-emerald-100',
    ];
    return gradients[index % gradients.length];
  };

  // Get medal icon for top 3
  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
      case 2:
        return <Crown className="w-4 h-4 text-slate-400 fill-slate-400" />;
      case 3:
        return <Crown className="w-4 h-4 text-amber-700 fill-amber-700" />;
      default:
        return null;
    }
  };

  // Date options
  const dateOptions = [
    'Dec 21, 2025',
    'Dec 20, 2025',
    'Dec 19, 2025',
    'Dec 18, 2025',
    'Last Week',
    'Last Month',
  ];

  const handleDateSelect = (selectedDate: string) => {
    setDate(selectedDate);
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* Premium Top Navigation Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto mb-6"
      >
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/30 p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Left Section - Live Leaderboard Title */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl blur opacity-20"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </motion.div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900">Live Leaderboard</h1>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping bg-red-400 rounded-full opacity-75"></div>
                      <Zap className="relative w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-xs font-semibold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                      LIVE
                    </span>
                  </motion.div>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Real-time performance tracking of top agents
                </p>
              </div>
            </div>

            {/* Right Section - Breadcrumb Navigation */}
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
              <Link 
                href="/aca/dashboard"
                className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors duration-200 group"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium group-hover:text-blue-600 transition-colors duration-200">Home</span>
              </Link>
              
              <ChevronRight className="w-4 h-4 text-slate-400 mx-1" />
              
              <div className="flex items-center gap-2 text-blue-600">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-semibold">Leaderboard</span>
              </div>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-100">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">Total Agents</div>
              <div className="text-lg font-bold text-slate-900 mt-1">{agents.length}</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-100">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">Avg. Performance</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {Math.round(agents.reduce((acc, agent) => acc + agent.dealsClosed, 0) / agents.length)}%
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-100">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">Top Score</div>
              <div className="text-lg font-bold text-slate-900 mt-1">{agents[0]?.dealsClosed || 0}</div>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-3 rounded-xl border border-violet-100">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">Active Updates</div>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                <div className="text-sm font-semibold text-slate-900">
                  {isLive ? 'Enabled' : 'Paused'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Leaderboard Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-7xl mx-auto"
      >
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-100/50 p-6 md:p-8">
          {/* Leaderboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 rounded-2xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">Top Performers</h2>
                <p className="text-sm text-slate-500 mt-1">Real-time ranking based on closed deals</p>
              </div>
            </div>

            {/* Date Selector */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-200 group"
              >
                <Calendar className="w-4 h-4 text-slate-500 group-hover:text-blue-500 transition-colors duration-200" />
                <span className="font-medium text-slate-700 group-hover:text-blue-600 transition-colors duration-200">{date}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden"
                  >
                    {dateOptions.map((option, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleDateSelect(option)}
                        className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-150 flex items-center gap-2 ${
                          option === date ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
                        }`}
                      >
                        {option === date && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        )}
                        <span>{option}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Agent List */}
          <div className="space-y-3">
            {agents.length > 0 ? (
              agents.map((agent, index) => {
                const dealsToGo = 100 - agent.dealsClosed;
                const progressPercentage = agent.dealsClosed;
                const isTopThree = index < 3;

                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.01,
                      y: -2,
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05)"
                    }}
                    className={`group relative bg-white p-4 rounded-2xl border transition-all duration-300 hover:border-blue-200 ${
                      isTopThree ? 'border-2' : 'border border-slate-200'
                    } ${isTopThree ? 
                      index === 0 ? 'border-yellow-300 bg-gradient-to-r from-yellow-50/30 via-white to-white' : 
                      index === 1 ? 'border-slate-300 bg-gradient-to-r from-slate-50/30 via-white to-white' : 
                      'border-amber-300 bg-gradient-to-r from-amber-50/30 via-white to-white' : ''
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Rank & Profile */}
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {/* Medal for top 3 */}
                          {isTopThree && (
                            <motion.div 
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: index * 0.2, type: "spring" }}
                              className="absolute -top-2 -right-2 z-10"
                            >
                              {getMedalIcon(index + 1)}
                            </motion.div>
                          )}
                          
                          {/* Rank */}
                          <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold ${
                            isTopThree ? 
                              index === 0 ? 'bg-gradient-to-br from-yellow-100 to-amber-100 text-yellow-700 shadow-sm' :
                              index === 1 ? 'bg-gradient-to-br from-slate-100 to-gray-100 text-slate-700 shadow-sm' :
                              'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 shadow-sm' :
                              'bg-slate-100 text-slate-500'
                          }`}>
                            {index + 1}
                          </div>
                        </div>

                        {/* Squircle Profile */}
                        <div className="relative">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getPastelGradient(index)} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                            <span className="text-2xl font-bold text-slate-800">
                              {agent.name.charAt(0)}
                            </span>
                          </div>
                          {isTopThree && (
                            <motion.div 
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg"
                            >
                              <Trophy className={`w-4 h-4 ${
                                index === 0 ? 'text-yellow-500' :
                                index === 1 ? 'text-slate-400' :
                                'text-amber-600'
                              }`} />
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Name & Progress */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                          <div className="min-w-[140px]">
                            <h3 className="font-semibold text-slate-900 truncate text-lg">{agent.name}</h3>
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                              <span className="inline-block w-2 h-2 bg-slate-300 rounded-full"></span>
                              {dealsToGo} deal{dealsToGo !== 1 ? 's' : ''} to target
                            </p>
                          </div>

                          {/* Progress Bar */}
                          <div className="flex-1">
                            <div className="relative">
                              <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPercentage}%` }}
                                  transition={{ 
                                    duration: 1.5,
                                    delay: index * 0.2,
                                    ease: "easeOut"
                                  }}
                                  className={`h-full rounded-full bg-gradient-to-r ${agent.color} shadow-sm`}
                                />
                              </div>
                              
                              {/* Progress Percentage */}
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.2 + 1 }}
                                className="absolute -top-6 right-0 px-2 py-1 bg-white rounded-lg shadow-sm border border-slate-200"
                              >
                                <span className="text-xs font-semibold text-slate-700">{progressPercentage}%</span>
                              </motion.div>
                            </div>
                          </div>

                          {/* Deal Count Badge */}
                          <div className="flex-shrink-0">
                            <div className={`px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm ${
                              isTopThree ?
                                index === 0 ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200' :
                                index === 1 ? 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border border-slate-200' :
                                'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200' :
                                'bg-gradient-to-r from-slate-50 to-gray-50 text-slate-800 border border-slate-200'
                            }`}>
                              {agent.dealsClosed} Deals
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect Glow */}
                    <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-blue-100/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                );
              })
            ) : (
              // Empty State
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6">
                  <Trophy className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Data Available</h3>
                <p className="text-slate-500 mb-6">Select a different date to view performance data</p>
                <button
                  onClick={() => setDate('Dec 21, 2025')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-200 transition-all duration-200"
                >
                  Reset to Today
                </button>
              </motion.div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow"></div>
                <span className="text-sm text-slate-600">Progress Bar</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-3 h-3 text-yellow-500" />
                <span className="text-sm text-slate-600">Top 3 Ranking</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsLive(!isLive)}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  isLive 
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:shadow-red-200' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-200'
                }`}
              >
                <Zap className="w-4 h-4" />
                {isLive ? 'Pause Live Updates' : 'Enable Live Updates'}
              </button>
              
              <div className="text-sm text-slate-500">
                Last updated: Just now
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AgentPerformanceLeaderboard;