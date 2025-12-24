'use client';

import ChatPanel from '@/components/ChatPanel';
import withAdminLayout from '@/components/Layouts/GeneralLayout';

const ChatPage = () => {
    return (
        <div>
            <ChatPanel />
        </div>
    )
}

export default withAdminLayout(ChatPage);