import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // ✅ Save current path to return after login
        const returnPath = encodeURIComponent(window.location.pathname);
        router.push(`/auth/login?returnTo=${returnPath}`);
      } else if (requireAdmin && user?.role !== "admin") {
        // ✅ Show 403 page for non-admins
        router.push("/403");
      }
    }
  }, [isAuthenticated, loading, user, requireAdmin, router]);

  // ✅ Show loading skeleton
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Don't render anything while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // ✅ Show access denied for non-admins
  if (requireAdmin && user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
