"use client";

import React, { ReactNode, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import useAuthStore from "@/store/authStore";

type SessionSyncProps = {
  // No props needed
};

// This component syncs the NextAuth session with our custom store
function SessionSync({}: SessionSyncProps): React.ReactElement | null {
  const { data: session, status } = useSession();
  const { setSession, setStatus } = useAuthStore();

  useEffect(() => {
    console.log("Session sync: Session updated", {
      userName: session?.user?.name,
      status,
      timestamp: new Date().toISOString(),
    });

    setSession(session);
    setStatus(status);
  }, [session, setSession, status, setStatus]);

  return null;
}

type NextAuthProviderProps = {
  children: ReactNode;
};

export default function NextAuthProvider({
  children,
}: NextAuthProviderProps): React.ReactElement {
  return (
    <SessionProvider>
      <SessionSync />
      {children}
    </SessionProvider>
  );
}
