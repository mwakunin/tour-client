"use client";

import Link from "next/link";
// Aliased: `Image` in this file is the lucide icon used by the Media nav item
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Plane,
  Calendar,
  Image,
  Settings,
  Users,
  X,
  Banknote,
  Truck,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Destinations", href: "/admin/destinations", icon: MapPin },
  { name: "Tours", href: "/admin/tours", icon: Plane },
  { name: "Bookings", href: "/admin/bookings", icon: Calendar },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "payments", href: "/admin/payments", icon: Banknote },

  // The cost side. One entry, because one page exists — the previous attempt
  // added all five ahead of their pages and every one of them 404'd.
  { name: "Suppliers & Agents", href: "/admin/counterparties", icon: Truck },
  { name: "Supplier Invoices", href: "/admin/supplier-invoices", icon: FileText },
  { name: "Media", href: "/admin/media", icon: Image },
  { name: "Blog", href: "/admin/blog", icon: Image },
  { name: "Blog Categories", href: "/admin/blog/categories", icon: Image },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  // Only the most specific matching nav item lights up. A plain `startsWith`
  // marked both "Blog" and "Blog Categories" active on /admin/blog/categories,
  // and would also match unrelated siblings like /admin/tours-archive.
  const matchesRoute = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const activeHref = navigation.reduce<string | null>((best, item) => {
    if (!matchesRoute(item.href)) return best;
    return best === null || item.href.length > best.length ? item.href : best;
  }, null);

  return (
    <>
      {/* Backdrop overlay - mobile only; desktop sidebar is persistent, not modal */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64",
          "border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
          "transform transition-all duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
          <Link href="/admin" className="flex items-center">
            <NextImage
              src="/LOGO_COLOR.webp"
              alt="Footloose Adventures"
              width={1000}
              height={266}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>

          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close sidebar"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = item.href === activeHref;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  // Only auto-close on mobile, where the sidebar is a modal drawer.
                  // On desktop (lg+) it's persistent and should stay open until the user closes it.
                  if (window.innerWidth < 1024) {
                    setOpen(false);
                  }
                }}
                className={cn(
                  "relative flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary dark:bg-primary/30 dark:text-primary text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}
              >
                {isActive && (
                  <span className="bg-primary absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full" />
                )}
                <item.icon size={20} className="mr-3" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute right-0 bottom-0 left-0 border-t border-gray-200 p-4 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>© 2026 Footloose Adventures</p>
            <p className="mt-1">Version 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
