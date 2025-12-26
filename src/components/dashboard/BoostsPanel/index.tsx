// "use client";

// import { Boost } from "@/lib/dashboard/types";
// import { timeAgo } from "@/lib/dashboard/format";
// import { motion } from "framer-motion";
// import { 
//   Zap, 
//   Clock, 
//   TrendingUp, 
//   Sparkles, 
//   Shield, 
//   Rocket,
//   ChevronRight,
//   Gift,
//   Target,
//   Timer
// } from "lucide-react";
// import { useState, useEffect } from "react";

// // Calculate time remaining until expiration
// const calculateTimeRemaining = (expiresAt: string) => {
//   const now = new Date();
//   const expiry = new Date(expiresAt);
//   const diff = expiry.getTime() - now.getTime();
  
//   if (diff <= 0) return { expired: true, hours: 0, minutes: 0 };
  
//   const hours = Math.floor(diff / (1000 * 60 * 60));
//   const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
//   return { expired: false, hours, minutes };
// };

// // Get boost icon based on type
// const getBoostIcon = (name: string) => {
//   const lowerName = name.toLowerCase();
//   if (lowerName.includes('streak')) return <Target className="w-5 h-5" />;
//   if (lowerName.includes('performance')) return <TrendingUp className="w-5 h-5" />;
//   if (lowerName.includes('quality')) return <Shield className="w-5 h-5" />;
//   if (lowerName.includes('speed')) return <Rocket className="w-5 h-5" />;
//   return <Zap className="w-5 h-5" />;
// };

// // Get gradient class based on boost type
// const getBoostGradient = (xpBonusPercent: number) => {
//   if (xpBonusPercent >= 50) return 'from-purple-500 to-pink-500';
//   if (xpBonusPercent >= 30) return 'from-blue-500 to-cyan-500';
//   if (xpBonusPercent >= 20) return 'from-emerald-500 to-teal-500';
//   return 'from-amber-500 to-orange-500';
// };

// export default function BoostsPanel({ boosts }: { boosts: Boost[] }) {
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [selectedBoost, setSelectedBoost] = useState<number | null>(null);

//   // Update time every minute for countdowns
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   // Calculate active boosts
//   const activeBoosts = boosts.filter(boost => 
//     new Date(boost.expiresAt) > currentTime
//   );
  
//   const totalBonus = activeBoosts.reduce((sum, boost) => sum + boost.xpBonusPercent, 0);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="relative group h-full"
//     >
//       {/* Background Glow Effect */}
//       <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
      
//       {/* Main Panel */}
//       <div className="relative bg-white rounded-3xl shadow-2xl shadow-purple-200/50 border border-slate-200/50 p-6 h-full">
//         {/* Header */}
//         <div className="flex items-start justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <motion.div
//               animate={{ rotate: [0, 10, -10, 0] }}
//               transition={{ duration: 3, repeat: Infinity }}
//               className="relative"
//             >
//               <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur opacity-30" />
//               <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-2.5 rounded-xl shadow-lg">
//                 <Rocket className="w-6 h-6 text-white" />
//               </div>
//             </motion.div>
            
//             <div>
//               <div className="flex items-center gap-2">
//                 <h3 className="text-xl  font-Gordita-Bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
//                   Active Boosts
//                 </h3>
//                 {activeBoosts.length > 0 && (
//                   <span className="px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs  font-Gordita-Bold rounded-full">
//                     {activeBoosts.length} ACTIVE
//                   </span>
//                 )}
//               </div>
//               <p className="text-sm text-slate-600 mt-1">
//                 Temporary XP multipliers & performance enhancers
//               </p>
//             </div>
//           </div>
          
//           {/* Total Bonus Badge */}
//           <motion.div
//             whileHover={{ scale: 1.05 }}
//             className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl shadow-sm"
//           >
//             <div className="text-xs text-slate-600">Total Bonus</div>
//             <div className="text-lg  font-Gordita-Bold text-purple-700 flex items-center gap-1">
//               <TrendingUp className="w-4 h-4" />
//               +{totalBonus}%
//             </div>
//           </motion.div>
//         </div>

//         {/* Stats Summary */}
//         <div className="grid grid-cols-2 gap-3 mb-6">
//           <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-100">
//             <div className="text-xs text-slate-600 mb-1">Active Boosts</div>
//             <div className="text-2xl  font-Gordita-Bold text-purple-700">{activeBoosts.length}</div>
//           </div>
//           <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-100">
//             <div className="text-xs text-slate-600 mb-1">Max Duration</div>
//             <div className="text-2xl  font-Gordita-Bold text-blue-700">24h</div>
//           </div>
//         </div>

//         {/* Boosts List */}
//         <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
//           {activeBoosts.length > 0 ? (
//             activeBoosts.map((boost, index) => {
//               const timeRemaining = calculateTimeRemaining(boost.expiresAt);
//               const gradient = getBoostGradient(boost.xpBonusPercent);
//               const isExpiringSoon = timeRemaining.hours < 2 && !timeRemaining.expired;

//               return (
//                 <motion.div
//                   key={boost.id}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                   whileHover={{ y: -2, scale: 1.01 }}
//                   onClick={() => setSelectedBoost(selectedBoost === boost.id ? null : boost.id)}
//                   className={`relative group/boost cursor-pointer rounded-2xl border p-4 transition-all duration-200
//                     ${selectedBoost === boost.id 
//                       ? 'border-purple-300 bg-gradient-to-r from-purple-50/50 via-white to-white shadow-lg shadow-purple-200/50' 
//                       : 'border-slate-200 hover:border-purple-200 hover:shadow-md'
//                     }`}
//                 >
//                   {/* Boost Glow Effect */}
//                   <div className={`absolute inset-0 bg-gradient-to-r ${gradient}/5 rounded-2xl opacity-0 group-hover/boost:opacity-100 transition-opacity duration-300`} />
                  
//                   <div className="relative">
//                     {/* Boost Header */}
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="flex items-start gap-3">
//                         <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
//                           {getBoostIcon(boost.name)}
//                         </div>
                        
//                         <div className="flex-1">
//                           <div className="flex items-center gap-2">
//                             <h4 className=" font-Gordita-Bold text-slate-900">{boost.name}</h4>
//                             {isExpiringSoon && (
//                               <span className="px-2 py-0.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-xs  font-Gordita-Bold rounded-full animate-pulse">
//                                 SOON
//                               </span>
//                             )}
//                           </div>
//                           <p className="text-sm text-slate-600 mt-1">{boost.description}</p>
//                         </div>
//                       </div>
                      
//                       {/* XP Bonus Badge */}
//                       <motion.div
//                         whileHover={{ scale: 1.1 }}
//                         className={`px-4 py-2 rounded-xl bg-gradient-to-br ${gradient} text-white  font-Gordita-Bold shadow-lg min-w-[70px] text-center`}
//                       >
//                         +{boost.xpBonusPercent}%
//                       </motion.div>
//                     </div>

//                     {/* Time Remaining */}
//                     <div className="mt-4">
//                       <div className="flex items-center justify-between text-sm mb-2">
//                         <div className="flex items-center gap-2 text-slate-600">
//                           <Clock className="w-4 h-4" />
//                           <span>{timeRemaining.expired ? 'Expired' : 'Expires in'}</span>
//                         </div>
//                         <div className="flex items-center gap-1">
//                           {!timeRemaining.expired && (
//                             <>
//                               <div className="px-2 py-1 bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 rounded-lg text-sm  font-Gordita-Bold">
//                                 {timeRemaining.hours}h
//                               </div>
//                               <div className="px-2 py-1 bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 rounded-lg text-sm  font-Gordita-Bold">
//                                 {timeRemaining.minutes}m
//                               </div>
//                             </>
//                           )}
//                         </div>
//                       </div>
                      
//                       {/* Progress Bar */}
//                       <div className="h-2 bg-gradient-to-r from-slate-100 to-gray-100 rounded-full overflow-hidden">
//                         {!timeRemaining.expired && (
//                           <motion.div
//                             initial={{ width: '100%' }}
//                             animate={{ 
//                               width: timeRemaining.hours > 0 
//                                 ? `${(timeRemaining.hours / 24) * 100}%` 
//                                 : '5%'
//                             }}
//                             transition={{ duration: 0.5 }}
//                             className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
//                           />
//                         )}
//                       </div>
                      
//                       {/* Expiry Details */}
//                       <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
//                         <span>
//                           {timeRemaining.expired 
//                             ? 'Boost has expired' 
//                             : `Expires ${new Date(boost.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
//                           }
//                         </span>
//                         <span className="flex items-center gap-1">
//                           <Sparkles className="w-3 h-3" />
//                           Created {timeAgo(boost.expiresAt)}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Hover Action */}
//                     <motion.div
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: selectedBoost === boost.id ? 1 : 0 }}
//                       className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-white border border-slate-200 rounded-full shadow-lg text-xs text-slate-600"
//                     >
//                       Click to expand
//                     </motion.div>
//                   </div>
//                 </motion.div>
//               );
//             })
//           ) : (
//             // Empty State
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="text-center py-10"
//             >
//               <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4">
//                 <Gift className="w-8 h-8 text-slate-400" />
//               </div>
//               <h4 className="text-lg  font-Gordita-Bold text-slate-900 mb-2">No Active Boosts</h4>
//               <p className="text-sm text-slate-600 mb-6">
//                 Complete missions or achieve goals to earn XP boosts
//               </p>
//               <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl  font-Gordita-Medium hover:shadow-lg hover:shadow-purple-200 transition-all duration-200">
//                 View Available Boosts
//               </button>
//             </motion.div>
//           )}
//         </div>

//         {/* Footer Actions */}
//         <div className="mt-6 pt-6 border-t border-slate-200">
//           <div className="flex gap-3">
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl  font-Gordita-Medium hover:shadow-lg hover:shadow-purple-200 transition-all duration-200 flex items-center justify-center gap-2"
//             >
//               <Zap className="w-5 h-5" />
//               Activate New Boost
//             </motion.button>
            
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               className="px-4 py-3 bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 rounded-xl  font-Gordita-Medium hover:shadow transition-all duration-200 flex items-center gap-2"
//             >
//               <Shield className="w-5 h-5" />
//               Rules
//             </motion.button>
//           </div>
          
//           {/* Fair Play Badge */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.5 }}
//             className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-200/50"
//           >
//             <Shield className="w-4 h-4 text-emerald-500" />
//             <span className="text-xs text-slate-500">Fair-play XP system • Transparent calculations</span>
//           </motion.div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }