"use client";

import ChatHistory from "@/components/chat-history";
import { useAppContextStore } from "@/store/appContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/user";
import withAdminLayout from "@/components/Layouts/GeneralLayout";

 function ChatHistoryPage() {
  // const { data: session, status } = useSession();
  const user = useAuthStore(st=>st.user)
  const router = useRouter();
  // We can also use session.user.systemRole if available in session immediately,
  // but let's check both or follow standard protection pattern.
  // The store usually syncs from session or separate fetch.
  // Sidebar uses session.user.systemRole so we will trust that.

  useEffect(() => {
    // if (status === "loading") return;

    // if (status === "unauthenticated") {
    //   router.replace("/login");
    //   return;
    // }

    const role = (user as any)?.systemRole;
    if (role !== "ADMIN") {
        router.replace("/dashboard"); // or 403 page
    }
  }, [ router]);

  if (status === "loading") {
    return (
        <div className="flex h-screen items-center justify-center bg-[#080c16]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    );
  }

  const role = (user as any)?.systemRole;
  if (role !== "ADMIN") return null; // Logic in useEffect helps redirect, this prevents flash

  return (
    <div className="min-h-screen text-white">
      <ChatHistory />
    </div>
  );
}

export default withAdminLayout(ChatHistoryPage);