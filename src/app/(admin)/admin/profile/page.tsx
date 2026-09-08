"use client";

import Link from "next/link";
import { Users, Settings } from "lucide-react";
import Card from "@/components/ui/card";
import ProfilePanel from "@/components/profile/ProfilePanel";

export default function AdminProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your account information
        </p>
      </div>

      {/* Same panel the public account page renders, so the two cannot drift apart */}
      <ProfilePanel>
        <Card title="Administration">
          <div className="grid gap-3 md:grid-cols-2">
            <Link
              href="/admin/users"
              className="border-outline-variant hover:border-primary hover:bg-primary/5 border p-4 transition-colors"
            >
              <p className="text-on-surface flex items-center gap-2 font-semibold">
                <Users size={16} /> Users
              </p>
              <p className="text-on-surface-variant text-sm">
                Manage roles and registered accounts
              </p>
            </Link>

            <Link
              href="/admin/settings"
              className="border-outline-variant hover:border-primary hover:bg-primary/5 border p-4 transition-colors"
            >
              <p className="text-on-surface flex items-center gap-2 font-semibold">
                <Settings size={16} /> Settings
              </p>
              <p className="text-on-surface-variant text-sm">Site-wide configuration</p>
            </Link>
          </div>
        </Card>
      </ProfilePanel>
    </div>
  );
}
