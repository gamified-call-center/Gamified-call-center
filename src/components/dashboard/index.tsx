"use client";

import Missions from "./MissionsPanel";
import ProgressSection from "./ProgressSection";
import { AppKey, TimeRangeKey } from "@/lib/dashboard/types";
import { getMockDashboard } from "@/lib/dashboard/mock";
import { useMemo,useState } from "react";
import PerformanceChart from "./PerformanceChart";
export default function Dashboard() {
  
  const [activeApp, setActiveApp] = useState<AppKey>("ACA");
  const [range, setRange] = useState<TimeRangeKey>("WEEK");
  const data = useMemo(() => getMockDashboard(activeApp, range), [activeApp, range]);
  return (
    <div className="w-full max-w-400 mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* 🔹 TOP: PROGRESS */}
      <ProgressSection
        level={12}
        currentXp={320}
        xpToNextLevel={500}
        dailyStreak={7}
      />

      {/* 🔹 ROW 1: MISSIONS + PERFORMANCE */}
      <div className="flex flex-wrap gap-6">
        <div className="w-full xl:flex-1 min-w-[320px]">
          <Missions missions={data.missions} />
        </div>

        <div className="w-full xl:flex-1 min-w-[320px]">
          {/* <PerformanceChart  data={data.performance} /> */}
        </div>
      </div>

      {/* 🔹 ROW 2: LEADERBOARD + REWARDS + BOOSTS */}
      {/* <div className="flex flex-wrap gap-6">
        <div className="w-full lg:flex-1 min-w-[300px]">
          <MiniLeaderboard />
        </div>

        <div className="w-full lg:flex-1 min-w-[300px]">
          <RewardsBox />
        </div>

        <div className="w-full lg:flex-1 min-w-[300px]">
          <Boosts boosts={[]} />
        </div>
      </div> */}

      {/* 🔹 FULL WIDTH: LIVE ACTIVITY */}
      {/* <LiveActivityFeed /> */}
    </div>
  );
}


// "use client";

// import { useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   Sparkles, 
//   Zap, 
//   TrendingUp, 
//   BarChart3, 
//   Users, 
//   Award,
//   Target,
//   Activity,
//   ChevronRight
// } from "lucide-react";
// import DashboardHeader from "@/components/dashboard/DashboardHeader";
// import { AppKey, TimeRangeKey } from "@/lib/dashboard/types";
// import { getMockDashboard } from "@/lib/dashboard/mock";
// import StatGrid from "./StatsGrid";
// import AppSwitcher from "../AppSwitcher";
// import TrendPanel from "./TrendPanel";
// import MissionsPanel from "./MissionsPanel";
// import LeaderboardPanel from "./LeaderboardPanel";
// import RewardsBoxCard from "./RewardsBoxCard";
// import BoostsPanel from "./BoostsPanel";
// import LiveActivityFeed from "./LiveActivityFeed";
// import ProgressSection from "./ProgressSection";

// export default function DashboardPage() {
//   const [isLoading, setIsLoading] = useState(false);

//   const data = useMemo(() => getMockDashboard(activeApp, range), [activeApp, range]);

//   // Handle app switch with animation
//   const handleAppChange = (app: AppKey) => {
//     setIsLoading(true);
//     setActiveApp(app);
//     setTimeout(() => setIsLoading(false), 300);
//   };

//   // Handle range change with animation
//   const handleRangeChange = (r: TimeRangeKey) => {
//     setIsLoading(true);
//     setRange(r);
//     setTimeout(() => setIsLoading(false), 300);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-black">
//       {/* Animated Background Elements */}
//       <div className="fixed inset-0 -z-10 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl" />
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl" />
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-amber-100/10 to-orange-100/10 rounded-full blur-3xl" />
//       </div>

//       <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-10 md:py-8">
//         {/* Main Content Container with Animation */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.5 }}
//           className="flex flex-col gap-6 md:gap-8"
//         >
//           {/* Header Section */}
//           <motion.div
//             initial={{ y: -20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ duration: 0.5 }}
//             className="flex flex-col gap-4"
//           >
//             {/* Top Row - Title & Controls */}
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//               <div className="flex flex-col gap-2">
//                 <div className="flex items-center gap-3">
//                   <motion.div
//                     animate={{ rotate: [0, 10, -10, 0] }}
//                     transition={{ duration: 4, repeat: Infinity }}
//                     className="relative"
//                   >
//                     <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur opacity-30" />
//                     <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
//                       <BarChart3 className="w-6 h-6 text-white" />
//                     </div>
//                   </motion.div>
                  
//                   <div>
//                     <h1 className="text-2xl md:text-3xl  font-Gordita-Bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
//                       Performance Dashboard
//                     </h1>
//                     <p className="text-slate-600 text-sm md:text-base">
//                       Real-time analytics, XP progression, missions, rewards & leaderboards.
//                     </p>
//                   </div>
//                 </div>
                
//                 {/* Quick Stats Ribbon */}
//                 <motion.div
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: 0.2 }}
//                   className="flex items-center gap-4 mt-2"
//                 >
//                   <div className="flex items-center gap-2 text-sm">
//                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
//                     <span className="text-slate-700">Live Updates</span>
//                   </div>
//                   <div className="h-4 w-px bg-slate-300" />
//                   <div className="flex items-center gap-2 text-sm">
//                     <Zap className="w-4 h-4 text-amber-500" />
//                     <span className="text-slate-700">{data.myProfile.xp} XP Earned</span>
//                   </div>
//                   <div className="h-4 w-px bg-slate-300" />
//                   <div className="flex items-center gap-2 text-sm">
//                     <Users className="w-4 h-4 text-blue-500" />
//                     <span className="text-slate-700">{data.leaderboard.length} Active Agents</span>
//                   </div>
//                 </motion.div>
//               </div>

//               {/* Controls Section */}
//               <motion.div
//                 initial={{ y: 20, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.1 }}
//                 className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end"
//               >
//                 <div className="relative group">
//                   <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                   <AppSwitcher 
//                     value={activeApp} 
//                     onChange={handleAppChange} 
//                     className="relative z-10"
//                   />
//                 </div>
                
//                 <div className="relative group">
//                   <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                   <DashboardHeader.RangePicker 
//                     value={range} 
//                     onChange={handleRangeChange}
//                     className="relative z-10"
//                   />
//                 </div>
//               </motion.div>
//             </div>

//             {/* Profile Header with Progress */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3 }}
//             >
//               <DashboardHeader profile={data.myProfile} app={data.app} />
//             </motion.div>
//           </motion.div>

//           {/* Loading Overlay */}
//           <AnimatePresence>
//             {isLoading && (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center"
//               >
//                 <motion.div
//                   animate={{ rotate: 360 }}
//                   transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                   className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
//                 />
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Progress Section */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4 }}
//             className="relative group"
//           >
//             <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
//             <ProgressSection 
//               level={data.myProfile.level}
//               currentXp={data.myProfile.xp}
//               xpToNextLevel={1000}
//               dailyStreak={data.myProfile.streak || 7}
//             />
//           </motion.div>

//           {/* Stats Grid */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5 }}
//             className="relative group"
//           >
//             <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
//             <StatGrid items={data.kpis} />
//           </motion.div>

//           {/* Main Content Grid */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.6 }}
//             className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6"
//           >
//             {/* Trend Panel */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.7 }}
//               className="lg:col-span-7"
//             >
//               <div className="relative group h-full">
//                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
//                 <TrendPanel trend={data.trend} range={data.range} app={data.app} />
//               </div>
//             </motion.div>

//             {/* Missions Panel */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.8 }}
//               className="lg:col-span-5"
//             >
//               <div className="relative group h-full">
//                 <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
//                 <MissionsPanel missions={data.missions} />
//               </div>
//             </motion.div>
//           </motion.div>

//           {/* Middle Row Grid */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.9 }}
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 md:gap-6"
//           >
//             {/* Leaderboard */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 1.0 }}
//               className="md:col-span-1 lg:col-span-4"
//             >
//               <div className="relative group h-full">
//                 <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-cyan-500/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
//                 <LeaderboardPanel entries={data.leaderboard} />
//               </div>
//             </motion.div>

//             {/* Rewards Box */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 1.1 }}
//               className="md:col-span-1 lg:col-span-4"
//             >
//               <div className="relative group h-full">
//                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
//                 <RewardsBoxCard app={data.app} />
//               </div>
//             </motion.div>

//             {/* Boosts Panel */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 1.2 }}
//               className="md:col-span-2 lg:col-span-4"
//             >
//               <div className="relative group h-full">
//                 <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
//                 <BoostsPanel boosts={data.boosts} />
//               </div>
//             </motion.div>
//           </motion.div>

//           {/* Live Activity Feed */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 1.3 }}
//             className="relative group"
//           >
//             <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
//             <LiveActivityFeed items={data.activity} />
//           </motion.div>

//           {/* Floating Action Buttons (Mobile Only) */}
//           <div className="fixed bottom-6 right-6 z-40 md:hidden">
//             <motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-4 rounded-2xl shadow-2xl shadow-blue-500/30"
//             >
//               <Zap className="w-6 h-6" />
//             </motion.button>
//           </div>

//           {/* Achievement Toast (Example) */}
//           {/* <motion.div
//             initial={{ opacity: 0, y: 50, scale: 0.8 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             transition={{ delay: 2, type: "spring" }}
//             className="fixed bottom-24 right-6 z-40 max-w-sm"
//           >
//             <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-2xl shadow-amber-500/20">
//               <div className="flex items-center gap-3">
//                 <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 rounded-xl">
//                   <Award className="w-6 h-6 text-white" />
//                 </div>
//                 <div className="flex-1">
//                   <h4 className=" font-Gordita-Bold text-slate-900">Daily Goal Achieved! 🎯</h4>
//                   <p className="text-sm text-slate-600">+150 XP earned today</p>
//                 </div>
//                 <ChevronRight className="w-5 h-5 text-slate-400" />
//               </div>
//             </div>
//           </motion.div> */}
//         </motion.div>
//       </div>

//       {/* Responsive adjustments */}
//       <style jsx>{`
//         @media (max-width: 768px) {
//           .grid-cols-1 {
//             grid-template-columns: 1fr;
//           }
          
//           .gap-6 {
//             gap: 1.5rem;
//           }
//         }
        
//         @media (max-width: 1024px) {
//           .lg\\:col-span-7,
//           .lg\\:col-span-5,
//           .lg\\:col-span-4 {
//             grid-column: span 12;
//           }
//         }
        
//         /* Custom scrollbar */
//         ::-webkit-scrollbar {
//           width: 8px;
//           height: 8px;
//         }
        
//         ::-webkit-scrollbar-track {
//           background: rgba(0, 0, 0, 0.05);
//           border-radius: 10px;
//         }
        
//         ::-webkit-scrollbar-thumb {
//           background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
//           border-radius: 10px;
//         }
        
//         ::-webkit-scrollbar-thumb:hover {
//           background: linear-gradient(to bottom, #2563eb, #7c3aed);
//         }
//       `}</style>
//     </div>
//   );
// }