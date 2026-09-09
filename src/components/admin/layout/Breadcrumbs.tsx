"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    // Remove /admin prefix and split
    const paths = pathname.replace("/admin", "").split("/").filter(Boolean);

    const breadcrumbs = [{ label: "Dashboard", href: "/admin" }];

    let currentPath = "/admin";

    paths.forEach((path, index) => {
      currentPath += `/${path}`;

      // Skip dynamic routes like [id]
      if (path.startsWith("[")) return;

      // Format label (capitalize and replace hyphens)
      let label = path
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Handle special cases
      if (path === "new") label = "Create New";
      if (path === "edit") label = "Edit";

      // Check if it's the last item
      const isLast = index === paths.length - 1;

      breadcrumbs.push({
        label,
        href: isLast ? currentPath : currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on dashboard home
  if (pathname === "/admin") {
    return null;
  }

  return (
    <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
      {/* Home Icon */}
      <Link href="/admin" className="flex items-center transition-colors hover:text-gray-900">
        <Home size={16} />
      </Link>

      {/* Breadcrumb Items */}
      {breadcrumbs.slice(1).map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 2;

        return (
          <div key={crumb.href} className="flex items-center space-x-2">
            <ChevronRight size={16} className="text-gray-400" />

            {isLast ? (
              <span className="font-medium text-gray-900">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="transition-colors hover:text-gray-900">
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
