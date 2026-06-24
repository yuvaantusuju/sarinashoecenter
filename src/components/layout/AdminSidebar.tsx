/**
 * AdminSidebar — Navigation sidebar for the Admin Panel.
 * Shows links to Dashboard, Products, Brands, and Orders, with a logout button.
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  ClipboardList,
  LogOut,
  Footprints,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/admin/products",
      label: "Products",
      icon: ShoppingBag,
    },
    {
      href: "/admin/brands",
      label: "Brands",
      icon: Tag,
    },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: ClipboardList,
    },
  ];

  const handleLogout = async () => {
    try {
      // Clear session cookie via the logout endpoint
      await fetch("/api/auth/login", { method: "DELETE" });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <aside className="w-64 bg-black-950 text-white min-h-screen flex flex-col border-r border-black-800">
      {/* ── Logo Area ─────────────────────────────────── */}
      <div className="h-16 px-6 flex items-center border-b border-black-800">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-orange-500">
            <Footprints className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white leading-none">
              Sarina
            </span>
            <span className="text-[9px] font-medium text-black-400 uppercase tracking-widest leading-none">
              Admin Portal
            </span>
          </div>
        </Link>
      </div>

      {/* ── Menu Links ────────────────────────────────── */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && pathname !== "/admin/login";
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-orange-500 text-black-950 font-semibold shadow-lg shadow-orange-500/10"
                  : "text-black-300 hover:bg-black-900 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Footer / Logout ────────────────────────────── */}
      <div className="p-4 border-t border-black-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors duration-200"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
