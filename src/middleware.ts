/**
 * Next.js Middleware — Auth guard for the Admin Panel.
 * Validates the session token for /admin/* (redirecting to /admin/login)
 * and for admin API requests (returning JSON 401).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Browser Route Protection
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const sessionSecret = process.env.SESSION_SECRET || "sarina-default-session-secret-key-123456";

    const isValid = token ? await verifySessionToken(token, sessionSecret) : false;

    if (!isValid) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
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
    const sessionSecret = process.env.SESSION_SECRET || "sarina-default-session-secret-key-123456";

    const isValid = token ? await verifySessionToken(token, sessionSecret) : false;

    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/orders/:path*"],
};
