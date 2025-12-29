"use client";
import withAdminLayout from "@/components/Layouts/GeneralLayout";
import AdminDashboard from "../../../components/AdminDashboard";

const Dashboard = () => {
  return (
    <div>
      <AdminDashboard />
    </div>
  )
}

export default withAdminLayout(Dashboard);