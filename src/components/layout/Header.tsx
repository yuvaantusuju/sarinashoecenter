/**
 * Header — Sticky top navigation bar.
 * Shows brand logo, nav links, and a cart icon with item count badge.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, Footprints } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onCartOpen: () => void;
}

export function Header({ onCartOpen }: HeaderProps) {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/products?gender=men", label: "Men" },
    { href: "/products?gender=women", label: "Women" },
  ];

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

        {/* ── Cart Button + Mobile Menu Toggle ─────────── */}
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
          mobileMenuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0 border-t-0"
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
        </nav>
      </div>
    </header>
  );
}
