/**
 * POST /api/auth/login — User authentication endpoint.
 * Validates credentials against the users table and sets session cookie.
 * DELETE /api/auth/login — Clears the session cookie (logout).
 */

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE,
} from "@/lib/auth";

// export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { email, emailOrPhone, password } = await req.json();
    const identifier = (emailOrPhone || email || "").trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email/Phone number and password are required." },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    if (!(env as any)?.DB) {
      return NextResponse.json(
        { error: "Database not available." },
        { status: 503 }
      );
    }

    const db = getDb((env as any).DB);

    // Auto-seed default admin user if they don't exist yet
    const adminEmail = "admin@sarinashoes.com";
    const adminFound = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (adminFound.length === 0) {
      try {
        const adminHash = await hashPassword("admin123");
        await db.insert(users).values({
          id: crypto.randomUUID(),
          name: "Admin",
          email: adminEmail,
          phone: "+9779800000000",
          passwordHash: adminHash,
          role: "admin",
          createdAt: Math.floor(Date.now() / 1000),
        });
      } catch (seedErr) {
        console.error("Auto-seeding admin user failed:", seedErr);
      }
    }

    // Determine if identifier is an email or phone number
    let user = null;
    if (identifier.includes("@")) {
      const found = await db
        .select()
        .from(users)
        .where(eq(users.email, identifier.toLowerCase()))
        .limit(1);
      if (found.length > 0) {
        user = found[0];
      }
    } else {
      let phoneNum = identifier;
      if (/^9\d{9}$/.test(phoneNum)) {
        phoneNum = "+977" + phoneNum;
      }
      const found = await db
        .select()
        .from(users)
        .where(eq(users.phone, phoneNum))
        .limit(1);
      if (found.length > 0) {
        user = found[0];
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email/phone number or password." },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email/phone number or password." },
        { status: 401 }
      );
    }

    // Generate signed session token with user's role
    const sessionSecret =
      (env as any)?.SESSION_SECRET ||
      "sarina-default-session-secret-key-123456";
    const token = await createSessionToken(sessionSecret, user.id, user.role);

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully.",
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });

    const isLocalhost =
      req.nextUrl.hostname === "localhost" ||
      req.nextUrl.hostname === "127.0.0.1";
    const secureFlag = isLocalhost ? "" : "Secure;";

    response.headers.set(
      "Set-Cookie",
      `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; ${secureFlag} SameSite=Lax; Max-Age=${AUTH_COOKIE_MAX_AGE}`
    );

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: `Authentication failed: ${error?.message || error || "Unknown error"}` },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  // Expire the cookie immediately
  const isLocalhost =
    req.nextUrl.hostname === "localhost" ||
    req.nextUrl.hostname === "127.0.0.1";
  const secureFlag = isLocalhost ? "" : "Secure;";

  response.headers.set(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; ${secureFlag} SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );

  return response;
}
