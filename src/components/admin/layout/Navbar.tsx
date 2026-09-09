"use client";

import { Menu, Bell, User, LogOut, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Open state, rather than CSS :hover alone. The menu was shown only by
  // hover alone, so a keyboard user tabbing to the trigger got nothing and a
  // touch user had no hover to give -- Profile, Settings and Logout were
  // simply unreachable for both. Hover still opens it; this adds the ways in
  // that were missing.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  // Through the context, not authApi directly. The context's logout captures
  // user_logged_out and calls posthog.reset(); going straight to authApi
  // skipped both, so the PostHog distinct id stayed bound to the person who
  // had just signed out and the next session on that browser reported under
  // their identity.
  //
  // Awaited, and followed by a navigation. Neither happened before, so the
  // admin shell stayed on screen after sign-out until something else caused a
  // route change — looking, from the user's side, as though logout had failed.
  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.replace("/auth/login");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "A";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-800">
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Menu size={24} />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        {/* <button
          className="relative text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="Notifications"
        >
          <Bell size={20} />
          {/* Notification badge *
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            3
          </span>
        </button> */}

        {/* User Menu */}
        <div
          className="relative"
          ref={menuRef}
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {/* User Avatar */}
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white">
              {getUserInitials()}
            </div>

            {/* User Info */}
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-500 capitalize dark:text-gray-400">
                {user?.role || "Administrator"}
              </p>
            </div>
          </button>

          {/* Dropdown Menu */}
          <div
            role="menu"
            className={`absolute right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-200 dark:border-gray-700 dark:bg-gray-800 ${
              menuOpen ? "visible opacity-100" : "invisible opacity-0"
            }`}
          >
            {/* User Info in Dropdown */}
            <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || "Admin User"}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {user?.email || "admin@example.com"}
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link href="/admin/profile">
                <button className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">
                  <User size={16} className="mr-3" />
                  Profile
                </button>
              </Link>
              <Link href="/admin/settings">
                <button className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">
                  <Settings size={16} className="mr-3" />
                  Settings
                </button>
              </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-200 py-2 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut size={16} className="mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
