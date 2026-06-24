/**
 * Header — Sticky top navigation bar.
 * Shows brand logo, nav links, cart icon, and user auth menu.
 * Admin users see an "Admin Dashboard" link in their dropdown.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Menu,
  X,
  Footprints,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onCartOpen: () => void;
}

export function Header({ onCartOpen }: HeaderProps) {
  const { totalItems } = useCart();
  const { user, isLoggedIn, isAdmin, loading, setAuthModalOpen, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/products?gender=men", label: "Men" },
    { href: "/products?gender=women", label: "Women" },
  ];

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    router.push("/");
    router.refresh();
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black-100 bg-white/80 backdrop-blur-lg">
      <div className="page-container flex h-16 items-center justify-between">
        {/* ── Logo ─────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black-900 text-orange-500 transition-transform duration-300 group-hover:scale-110">
            <Footprints className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-black-900 leading-none">
              Sarina
            </span>
            <span className="text-[10px] font-medium text-black-400 uppercase tracking-widest leading-none">
              Shoe Center
            </span>
          </div>
        </Link>

        {/* ── Desktop Nav ──────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-black-600 rounded-lg hover:bg-black-50 hover:text-black-900 transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Cart + User + Mobile Menu Toggle ─────────── */}
        <div className="flex items-center gap-2">
          {/* Cart icon with badge */}
          <button
            onClick={onCartOpen}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-black-600 hover:bg-black-50 hover:text-black-900 transition-colors duration-200"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white animate-scale-in">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>

          {/* User auth button / dropdown */}
          {!loading && (
            <div className="relative" ref={userMenuRef}>
              {isLoggedIn && user ? (
                <>
                  {/* Logged-in: avatar button */}
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 h-10 px-2 rounded-lg text-black-600 hover:bg-black-50 hover:text-black-900 transition-colors duration-200"
                    aria-label="User menu"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white text-[10px] font-bold">
                      {getInitials(user.name)}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 hidden sm:block transition-transform duration-200",
                        userMenuOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {/* User dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-white border border-black-100 rounded-xl shadow-xl py-2 animate-fade-in z-50">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-black-100">
                        <p className="text-sm font-semibold text-black-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-black-400 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                            Admin
                          </span>
                        )}
                      </div>

                      {/* Admin dashboard link */}
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-black-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Logged-out: sign in button */
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex h-10 items-center gap-2 px-3 rounded-lg text-black-600 hover:bg-black-50 hover:text-black-900 transition-colors duration-200"
                  aria-label="Sign in"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm font-medium">Sign In</span>
                </button>
              )}
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg text-black-600 hover:bg-black-50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Nav ───────────────────────────────── */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-t border-black-100",
          mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 border-t-0"
        )}
      >
        <nav className="page-container py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-black-600 rounded-lg hover:bg-black-50 hover:text-black-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile auth actions */}
          {!loading && !isLoggedIn && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthModalOpen(true);
              }}
              className="px-4 py-2.5 text-sm font-medium text-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-left"
            >
              Sign In / Register
            </button>
          )}

          {!loading && isLoggedIn && isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Admin Dashboard
            </Link>
          )}

          {!loading && isLoggedIn && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="px-4 py-2.5 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 transition-colors text-left"
            >
              Sign Out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
