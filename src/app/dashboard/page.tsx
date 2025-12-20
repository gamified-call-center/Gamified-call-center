"use client";
import DashboardPage from "@/components/dashboard"
import withAdminLayout from "@/components/Layouts/GeneralLayout";

const Dashboard = () => {
  return (
    <div>
      <DashboardPage />
    </div>
  )
}

export default withAdminLayout(Dashboard);