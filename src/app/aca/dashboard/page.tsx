"use client";
import DashboardPage from "@/components/dashboard"
import LeaderboardPanel from "@/components/dashboard/LeaderboardPanel";
import withAdminLayout from "@/components/Layouts/GeneralLayout";
import TrainingPage from "@/components/Training";

const Dashboard = () => {
  return (
    <div>
      <DashboardPage />
    </div>
  )
}

export default withAdminLayout(Dashboard);