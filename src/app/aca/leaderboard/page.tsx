'use client';

import AgentLeaderboard from '@/components/AgentLeaderboard'
import withAdminLayout from '@/components/Layouts/GeneralLayout';

const Leaderboard = () => {
    return (
        <div>
            <AgentLeaderboard />
        </div>
    )
}

export default withAdminLayout(Leaderboard);