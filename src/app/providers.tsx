"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";


// Mock session data to bypass authentication
const mockSession = {
  expires: "2050-01-01T00:00:00.000Z",
  user: {
    name: "Test User",
    email: "test@example.com",
    image: "https://i.pravatar.cc/150",
  },
  token: "mock-token-123",
};

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider 
      session={mockSession as any}
      refetchInterval={0}
      refetchOnWindowFocus={false} 
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}
