"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useSession, type AuthUser } from "@/lib/auth-client";
import { authApi } from "@/lib/api/auth";
import { usePostHog } from "posthog-js/react";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const posthog = usePostHog();

  const logout = async () => {
    posthog?.capture("user_logged_out");
    await authApi.logout();
    posthog?.reset();
  };

  // In an effect, not the render body. React may render a component without
  // committing it -- Strict Mode renders twice, and concurrent rendering can
  // discard work -- so calling identify during render fired it for renders
  // that never happened and repeated it on every render of everything below
  // this provider. Keyed on the user id, so it runs once per signed-in user.
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;
  const userName = session?.user?.name;

  useEffect(() => {
    if (!userId) return;
    posthog?.identify(userId, { email: userEmail, name: userName });
  }, [posthog, userId, userEmail, userName]);

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        loading: isPending,
        isAuthenticated: !!session?.user,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
