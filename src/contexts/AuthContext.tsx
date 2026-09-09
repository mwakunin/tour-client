"use client";

import { createContext, useContext, ReactNode } from "react";
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

  if (session?.user) {
    posthog?.identify(session.user.id, {
      email: session.user.email,
      name: session.user.name,
    });
  }

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
