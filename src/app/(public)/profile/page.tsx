"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Card from "@/components/ui/card";
import ProfilePanel from "@/components/profile/ProfilePanel";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-on-surface-variant">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Middleware already redirects unauthenticated visitors to /auth/login;
    // this is just a fallback for a cookie-present-but-invalid session.
    return null;
  }

  return (
    <div className="bg-surface min-h-screen py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-on-surface text-3xl font-bold">My Profile</h1>
          <p className="text-on-surface-variant mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <ProfilePanel allowDelete afterDeleteHref="/">
          <Card title="Quick Links">
            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={() => router.push("/bookings")}
                className="border-outline-variant hover:border-primary hover:bg-primary/5 border p-4 text-left transition-colors"
              >
                <p className="text-on-surface font-semibold">My Bookings</p>
                <p className="text-on-surface-variant text-sm">
                  View and manage your safari bookings
                </p>
              </button>

              <button
                onClick={() => router.push("/tours")}
                className="border-outline-variant hover:border-primary hover:bg-primary/5 border p-4 text-left transition-colors"
              >
                <p className="text-on-surface font-semibold">Browse Tours</p>
                <p className="text-on-surface-variant text-sm">Discover new safari adventures</p>
              </button>
            </div>
          </Card>
        </ProfilePanel>
      </div>
    </div>
  );
}
