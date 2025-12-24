'use client'
import ChatPanel from "@/components/ChatPanel";
import withAdminLayout from "@/components/Layouts/GeneralLayout";

 const ChatHistoryPage=()=> {
    return (
        <>
            <ChatPanel />
        </>
    );
}

export default withAdminLayout(ChatHistoryPage);