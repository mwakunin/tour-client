// app/admin/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/admin/layout/Breadcrumbs";
import Sidebar from "@/components/admin/layout/Sidebar";
import Navbar from "@/components/admin/layout/Navbar";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils/cn";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const { user, loading, isAuthenticated } = useAuth();

  // ✅ Redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/auth/login?returnTo=/admin");
      } else if (user?.role !== "admin") {
        router.push("/?error=admin_required");
      }
    }
  }, [user, isAuthenticated, loading, router]);

  // ✅ Show loading while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // ✅ Don't render if not authenticated
  if (!isAuthenticated || user?.role !== "admin") {
    return null; // Will redirect via useEffect
  }

  // ✅ User is admin - render admin layout
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden transition-[margin] duration-200",
          sidebarOpen && "lg:ml-64"
        )}
      >
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-6">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
