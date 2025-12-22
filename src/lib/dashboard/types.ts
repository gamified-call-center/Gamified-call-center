export type AppKey = "ACA" | "MEDICARE" | "TAXATION" | "LAUNCHPAD";

export type TimeRangeKey = "TODAY" | "WEEK" | "MONTH";

export type CoreEventType =
  | "CALL_ANSWERED"
  | "DEAL_CLOSED"
  | "XP_GRANTED"
  | "LEVEL_UP"
  | "BADGE_UNLOCKED"
  | "MISSION_COMPLETED"
  | "REWARD_GRANTED";

export type StatKpi = {
  id: string;
  label: string;
  value: string | number;
  deltaLabel?: string; // e.g. "+12% vs last week"
  hint?: string; // micro explanation
};

export type TrendPoint = {
  dateLabel: string; // "Dec 11"
  calls: number;
  deals: number;
  xp: number;
};

export type Mission = {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  xpReward: number;
  endsAt: string; // ISO
  status: "ACTIVE" | "COMPLETED" | "EXPIRED";
  app: AppKey;
};

export type Boost = {
  id: string;
  name: string;
  description: string;
  xpBonusPercent: number; // e.g. 10 = +10%
  expiresAt: string; // ISO
  active: boolean;
  app: AppKey;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  level: number;
  totalXp: number;
  deals: number;
  improvementPct: number;
  rank: number;
};

export type LiveActivityItem = {
  id: string;
  type: CoreEventType;
  title: string;
  subtitle?: string;
  createdAt: string; // ISO
  actorName?: string;
  amount?: number; // e.g. deal amount, reward coins, etc.
  app: AppKey;
};

export type PerformanceMetric = {
  id: string;
  userId: string;
  date: string;              // YYYY-MM-DD
  calls: number;
  deals: number;
  conversations: number;
  createdAt: string;         // ISO timestamp
};


export type DashboardPayload = {
  app: AppKey;
  range: TimeRangeKey;
  myProfile: {
    name: string;
    level: number;
    currentXp: number;
    xpToNextLevel: number;
    streakDays: number;
  };
  kpis: StatKpi[];
  trend: TrendPoint[];
  missions: Mission[];
  boosts: Boost[];
  leaderboard: LeaderboardEntry[];
  activity: LiveActivityItem[];
  performance: PerformanceMetric[];
};
