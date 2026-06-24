/**
 * Next.js Middleware — Auth guard for the Admin Panel.
 *
 * - Validates the session token for /admin/* and checks role === "admin"
 * - Unauthenticated/unauthorized users hitting /admin are redirected to /
 * - Admin API mutations require an admin-role session token
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionSecret =
    process.env.SESSION_SECRET || "sarina-default-session-secret-key-123456";

  // 1. Browser Route Protection — /admin/*
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const payload = token
      ? await verifySessionToken(token, sessionSecret)
      : { valid: false, userId: "", role: "" };

    // Must be a valid session with admin role
    if (!payload.valid || payload.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // 2. API Route Protection
  // Public GET endpoints: /api/admin/products, /api/admin/brands (needed by storefront catalog)
  // Private endpoints: POST/PUT/DELETE/PATCH under /api/admin, and GET/PATCH under /api/orders
  const isApiAdmin = pathname.startsWith("/api/admin");
  const isApiOrders = pathname.startsWith("/api/orders");
  const method = request.method;

  const requiresAuth =
    (isApiAdmin && method !== "GET") ||
    (isApiOrders && (method === "GET" || pathname.split("/").length > 3)); // e.g. /api/orders/[id] PATCH

  if (requiresAuth) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const payload = token
      ? await verifySessionToken(token, sessionSecret)
      : { valid: false, userId: "", role: "" };

    if (!payload.valid || payload.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/orders/:path*"],
};
