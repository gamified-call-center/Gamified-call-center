"use client";

import AcaAgentsView from "@/components/AraComponents/AgentsView";

import withAdminLayout from "@/components/Layouts/GeneralLayout";

const Agents = () => {
  return (
    <div>
      <AcaAgentsView />
    </div>
  );
};

export default withAdminLayout(Agents);
