import { AppKey, DashboardPayload, TimeRangeKey } from "./types";

function isoMinusMinutes(min: number) {
  return new Date(Date.now() - min * 60 * 1000).toISOString();
}

export function getMockDashboard(
  app: AppKey,
  range: TimeRangeKey
): DashboardPayload {
  const appLabel =
    app === "ACA"
      ? "ACA"
      : app === "MEDICARE"
      ? "Medicare"
      : app === "TAXATION"
      ? "Taxation"
      : "Launch Pad";

  const base =
    app === "MEDICARE"
      ? 1.2
      : app === "ACA"
      ? 1
      : app === "TAXATION"
      ? 0.7
      : 0.5;

  return {
    app,
    range,
    myProfile: {
      name: "Super Admin",
      level: 12,
      currentXp: Math.round(640 * base),
      xpToNextLevel: 1000,
      streakDays: 9,
    },
    kpis: [
      {
        id: "k1",
        label: "Calls Answered",
        value: Math.round(420 * base),
        deltaLabel: "+8% vs previous",
        hint: "Verified CALL_ANSWERED events",
      },
      {
        id: "k2",
        label: "Deals Closed",
        value: Math.round(63 * base),
        deltaLabel: "+12% vs previous",
        hint: "DEAL_CLOSED events",
      },
      {
        id: "k3",
        label: "XP Granted",
        value: Math.round(14850 * base),
        deltaLabel: "+5% vs previous",
        hint: "XP_GRANTED after safeguards",
      },
      {
        id: "k4",
        label: "Level Ups",
        value: Math.max(1, Math.round(7 * base)),
        deltaLabel: "+2 vs previous",
        hint: "LEVEL_UP triggers + rewards",
      },
    ],
    trend: Array.from({ length: 10 }).map((_, i) => ({
      dateLabel: `Day ${i + 1}`,
      calls: Math.round((30 + i * 2 + (i % 3) * 7) * base),
      deals: Math.round((4 + (i % 4)) * base),
      xp: Math.round((700 + i * 55 + (i % 2) * 120) * base),
    })),
    missions: [
      {
        id: "m1",
        title: `Hit 30 ${appLabel} Calls`,
        description: "Maintain quality conversations & keep notes updated",
        target: 30,
        progress: Math.round(18 * base),
        xpReward: 120,
        endsAt: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
        status: "ACTIVE",
        app,
      },
      {
        id: "m2",
        title: "Close 5 Deals",
        description: "Turn hot leads into confirmations",
        target: 5,
        progress: Math.round(3 * base),
        xpReward: 250,
        endsAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
        status: "ACTIVE",
        app,
      },
      {
        id: "m3",
        title: "Zero Missed Follow-ups",
        description: "Clear all due follow-ups before end of day",
        target: 10,
        progress: Math.round(10 * base),
        xpReward: 180,
        endsAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        status: "COMPLETED",
        app,
      },
    ],
    boosts: [
      {
        id: "b1",
        name: "Hot Streak",
        description: "Bonus XP on verified call outcomes",
        xpBonusPercent: 10,
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        active: true,
        app,
      },
      {
        id: "b2",
        name: "Closer Mode",
        description: "Bonus XP for DEAL_CLOSED events",
        xpBonusPercent: 15,
        expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        active: true,
        app,
      },
    ],
    leaderboard: [
      {
        id: "u1",
        name: "Ivan Ballin",
        level: 15,
        totalXp: 28750,
        deals: 46,
        improvementPct: 21,
        rank: 1,
      },
      {
        id: "u2",
        name: "Alex 1Defalco",
        level: 14,
        totalXp: 26240,
        deals: 41,
        improvementPct: 17,
        rank: 2,
      },
      {
        id: "u3",
        name: "Jacob 1Smith",
        level: 13,
        totalXp: 23820,
        deals: 38,
        improvementPct: 14,
        rank: 3,
      },
      {
        id: "u4",
        name: "Tizano Brown",
        level: 12,
        totalXp: 22010,
        deals: 33,
        improvementPct: 11,
        rank: 4,
      },
      {
        id: "u5",
        name: "Andre Triplett",
        level: 11,
        totalXp: 19840,
        deals: 29,
        improvementPct: 9,
        rank: 5,
      },
    ],
    activity: [
      {
        id: "a1",
        app,
        type: "DEAL_CLOSED",
        title: "Deal closed",
        subtitle: `${appLabel} conversion confirmed`,
        createdAt: isoMinusMinutes(2),
        actorName: "Sarah Chen",
        amount: 15000,
      },
      {
        id: "a2",
        app,
        type: "LEVEL_UP",
        title: "Level up!",
        subtitle: "New level unlocked with rewards",
        createdAt: isoMinusMinutes(11),
        actorName: "Mike Torres",
      },
      {
        id: "a3",
        app,
        type: "BADGE_UNLOCKED",
        title: "Badge unlocked",
        subtitle: "Consistency streak badge earned",
        createdAt: isoMinusMinutes(19),
        actorName: "Alex Kim",
      },
      {
        id: "a4",
        app,
        type: "MISSION_COMPLETED",
        title: "Mission completed",
        subtitle: "Daily follow-ups cleared",
        createdAt: isoMinusMinutes(36),
        actorName: "Emma Davis",
      },
      {
        id: "a5",
        app,
        type: "XP_GRANTED",
        title: "XP granted",
        subtitle: "Verified outcomes processed safely",
        createdAt: isoMinusMinutes(58),
        actorName: "System",
      },
    ],
    performance:[
       { id: '1', userId: 'user1', date: '2024-01-15', calls: 12, deals: 3, conversations: 8, createdAt: new Date().toISOString() },
    { id: '2', userId: 'user1', date: '2024-01-16', calls: 15, deals: 5, conversations: 10, createdAt: new Date().toISOString() },
    { id: '3', userId: 'user1', date: '2024-01-17', calls: 10, deals: 2, conversations: 7, createdAt: new Date().toISOString() },
    { id: '4', userId: 'user1', date: '2024-01-18', calls: 18, deals: 6, conversations: 12, createdAt: new Date().toISOString() },
    { id: '5', userId: 'user1', date: '2024-01-19', calls: 14, deals: 4, conversations: 9, createdAt: new Date().toISOString() },
    { id: '6', userId: 'user1', date: '2024-01-20', calls: 16, deals: 5, conversations: 11, createdAt: new Date().toISOString() },
    { id: '7', userId: 'user1', date: '2024-01-21', calls: 20, deals: 7, conversations: 14, createdAt: new Date().toISOString() },
    ]
  };
}
