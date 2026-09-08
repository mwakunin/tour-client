"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Phone, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import SearchOverlay from "./SearchOverlay";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false); // ✅ Track client-side mount
  const { user, loading, logout } = useAuth();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Tours", href: "/tours" },
    { name: "Destinations", href: "/destinations" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // ✅ Track when component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const scrolled = scrollY > (viewportHeight - 100) * 0.5;
      setIsScrolled(scrolled);
    };

    // Deep links and restored scroll positions land mid-page, where the header
    // should already be solid — without this the transparent state paints first.
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const handleLogin = () => {
    const returnPath = window.location.pathname;
    window.location.href = `/auth/login?returnTo=${encodeURIComponent(returnPath)}`;
    setMobileMenuOpen(false);
  };

  // ✅ Don't render auth UI until mounted and loaded
  const showAuthUI = mounted && !loading;

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "border-surface-variant bg-surface border-b"
          : "bg-gradient-to-b from-black/5 to-transparent"
        //"bg-gradient-to-b from-black/50 via-black/30 to-transparent"
      }`}
    >
      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Two wordmarks cross-faded rather than one swapped src: the white
              asset is pure white on transparent so it disappears against the
              scrolled bg-surface (#f9f9f9), and the colour one is near-invisible
              over a dark hero frame. Both mount up front, so the swap rides the
              header's own 500ms transition instead of flashing on first scroll.
              Sized by height with w-auto — the two differ in ratio (3.65 vs
              3.76), so any fixed width would letterbox one of them. h-14 fills
              the h-16 bar leaving 4px above and below; the same height at every
              width, since the phone bar is the same 64px as the desktop one. */}
          <Link href="/" className="relative flex items-center">
            <Image
              src="/LOGO_WHITE.webp"
              alt="Footloose Adventures"
              width={1000}
              height={274}
              className={`h-14 w-auto object-contain transition-opacity duration-500 ${
                isScrolled ? "opacity-0" : "opacity-100"
              }`}
              priority
              quality={90}
              sizes="210px"
            />
            <Image
              src="/LOGO_COLOR.webp"
              alt=""
              aria-hidden="true"
              width={1000}
              height={266}
              className={`absolute top-1/2 left-0 h-14 w-auto -translate-y-1/2 object-contain transition-opacity duration-500 ${
                isScrolled ? "opacity-100" : "opacity-0"
              }`}
              priority
              quality={90}
              sizes="210px"
            />
          </Link>

          <nav className="hidden space-x-8 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`label-caps transition-colors duration-300 hover:border-b hover:pb-1 ${
                  isScrolled
                    ? "text-on-surface hover:border-primary hover:text-primary"
                    : "hover:border-tertiary-fixed-dim hover:text-tertiary-fixed-dim text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 md:flex">
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                aria-label="Search"
                className={`transition-colors duration-300 ${
                  isScrolled
                    ? "text-on-surface hover:text-primary"
                    : "text-white hover:text-white/70"
                }`}
              >
                <Search size={18} />
              </button>

              <a
                href="tel:+254 742 060 624"
                className={`label-caps flex items-center gap-1 transition-colors duration-300 ${
                  isScrolled
                    ? "text-on-surface hover:text-primary"
                    : "text-white hover:text-white/70"
                }`}
              >
                <Phone size={14} />
                +254 742 060 624
              </a>

              <Link
                href="/tours"
                className={cn(
                  buttonVariants({ variant: "primary" }),
                  !isScrolled &&
                    "bg-primary text-on-primary hover:bg-primary-container hover:shadow-none"
                )}
              >
                Book Now
              </Link>
            </div>

            {/* Account/hamburger menu - always visible */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Account menu"
              className={`transition-colors duration-500 ${
                isScrolled ? "text-on-surface" : "text-white"
              }`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Account/nav dropdown - ✅ Add suppressHydrationWarning */}
      {mobileMenuOpen && (
        <div
          className="border-outline-variant bg-surface-container-lowest border-t"
          suppressHydrationWarning
        >
          <nav className="space-y-2 px-4 py-4">
            {!showAuthUI ? (
              <div className="text-on-surface-variant py-4 text-center">Loading...</div>
            ) : user ? (
              <>
                <div className="border-outline-variant mb-4 border-b pb-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="bg-primary text-on-primary flex h-8 w-8 items-center justify-center rounded-full font-bold">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-on-surface text-sm font-semibold">
                        {user.name || user.email}
                      </p>
                      <p className="text-on-surface-variant text-xs">{user.role}</p>
                    </div>
                  </div>
                </div>

                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-on-surface hover:text-primary block py-2 font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}

                <Link
                  href="/profile"
                  className="text-on-surface hover:text-primary block py-2 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>

                <Link
                  href="/bookings"
                  className="text-on-surface hover:text-primary block py-2 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Bookings
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-error hover:text-on-error-container block w-full py-2 text-left font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="text-on-surface hover:text-primary block w-full py-2 text-left font-medium transition-colors"
              >
                Login
              </button>
            )}

            <div className="border-outline-variant mt-2 space-y-2 border-t pt-2 md:hidden">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-on-surface hover:text-primary block py-2 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="text-on-surface hover:text-primary flex w-full items-center gap-2 py-2 text-left font-medium transition-colors"
              >
                <Search size={16} />
                Search Tours
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
