"use client";

import { useMemo, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";


import { AppKey, TimeRangeKey } from "@/lib/dashboard/types";
import { getMockDashboard } from "@/lib/dashboard/mock";
import StatGrid from "./StatsGrid";
import AppSwitcher from "../AppSwitcher";
import TrendPanel from "./TrendPanel";
import MissionsPanel from "./MissionsPanel";
import LeaderboardPanel from "./LeaderboardPanel";
import RewardsBoxCard from "./RewardsBoxCard";
import BoostsPanel from "./BoostsPanel";
import LiveActivityFeed from "./LiveActivityFeed";

export default function DashboardPage() {
    const [activeApp, setActiveApp] = useState<AppKey>("ACA");
    const [range, setRange] = useState<TimeRangeKey>("WEEK");

    const data = useMemo(() => getMockDashboard(activeApp, range), [activeApp, range]);

    return (
        <div className="min-h-screen  text-black">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-10  md:py-8">
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-col">
                            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                                Dashboard
                            </h1>
                            <p className="text-black/60 text-sm">
                                Real-time performance, XP progression, missions, rewards & leaderboards.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                            <AppSwitcher value={activeApp} onChange={setActiveApp} />
                            <DashboardHeader.RangePicker value={range} onChange={setRange} />
                        </div>
                    </div>

                    <DashboardHeader profile={data.myProfile} app={data.app} />

                    <StatGrid items={data.kpis} />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        <div className="lg:col-span-7">
                            <TrendPanel trend={data.trend} range={data.range} app={data.app} />
                        </div>
                        <div className="lg:col-span-5">
                            <MissionsPanel missions={data.missions} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        <div className="lg:col-span-4">
                            <LeaderboardPanel entries={data.leaderboard} />
                        </div>
                        <div className="lg:col-span-4">
                            <RewardsBoxCard app={data.app} />
                        </div>
                        <div className="lg:col-span-4">
                            <BoostsPanel boosts={data.boosts} />
                        </div>
                    </div>

                    <LiveActivityFeed items={data.activity} />
                </div>
            </div>
        </div>
    );
}
