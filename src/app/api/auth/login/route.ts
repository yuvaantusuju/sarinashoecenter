/**
 * POST /api/auth/login — Admin authentication endpoint.
 * Sets a secure, HTTP-only session cookie upon successful validation.
 * DELETE /api/auth/login — Clears the session cookie (logout).
 */

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createSessionToken, AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const { env } = getCloudflareContext();
    
    // Read credentials from env, falling back to local defaults for developer convenience
    const adminEmail = (env as any)?.ADMIN_EMAIL || "admin@sarinashoes.com";
    const adminPassword = (env as any)?.ADMIN_PASSWORD || "admin123";
    const sessionSecret = (env as any)?.SESSION_SECRET || "sarina-default-session-secret-key-123456";

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate signed session token
    const token = await createSessionToken(sessionSecret);

    // Create Set-Cookie header
    const response = NextResponse.json({ success: true, message: "Logged in successfully" });
    
    // Cookie flags: HttpOnly, Secure (unless localhost), SameSite=Lax, Max-Age
    const isLocalhost = req.nextUrl.hostname === "localhost" || req.nextUrl.hostname === "127.0.0.1";
    const secureFlag = isLocalhost ? "" : "Secure;";
    
    response.headers.set(
      "Set-Cookie",
      `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; ${secureFlag} SameSite=Lax; Max-Age=${AUTH_COOKIE_MAX_AGE}`
    );

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed. Server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  
  // Expire the cookie immediately
  const isLocalhost = req.nextUrl.hostname === "localhost" || req.nextUrl.hostname === "127.0.0.1";
  const secureFlag = isLocalhost ? "" : "Secure;";

  response.headers.set(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; ${secureFlag} SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );

  return response;
}
