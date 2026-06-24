/**
 * Footer — Site-wide footer with brand info and quick links.
 */

import React from "react";
import Link from "next/link";
import { Footprints, Phone, MapPin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-black-100 bg-black-950 text-black-300">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* ── Brand Column ────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-black-900">
                <Footprints className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-none">Sarina</p>
                <p className="text-[10px] font-medium text-black-400 uppercase tracking-widest leading-none">
                  Shoe Center
                </p>
              </div>
            </div>
            <p className="text-sm text-black-400 leading-relaxed max-w-xs">
              Affordable, high-quality everyday footwear for the whole family.
              Step into comfort, step into style.
            </p>
          </div>

          {/* ── Quick Links ─────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-2">
              {[
                { href: "/", label: "Home" },
                { href: "/products", label: "All Products" },
                { href: "/products?gender=men", label: "Men's Collection" },
                { href: "/products?gender=women", label: "Women's Collection" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-black-400 hover:text-orange-400 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Contact Info ────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Contact Us
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-black-400">
                <Phone className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span>+91 99999 99999</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-black-400">
                <Mail className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span>hello@sarinashoes.com</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-black-400">
                <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>123 Shoe Street, Fashion District, Mumbai 400001</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ──────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-black-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-black-500">
            © {new Date().getFullYear()} Sarina Shoe Center. All rights reserved.
          </p>
          <p className="text-xs text-black-600">
            Crafted with ❤️ for happy feet
          </p>
        </div>
      </div>
    </footer>
  );
}
