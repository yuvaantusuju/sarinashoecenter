/**
 * AdminLayout — Layout wrapper for the admin portal.
 * Conditionally renders the AdminSidebar on admin pages, except /admin/login.
 */

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-black-50 flex items-center justify-center">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
