/**
 * POST /api/auth/register — User registration endpoint.
 * Creates a new user account with hashed password and sets session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  createSessionToken,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE,
} from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
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

    // Check if email already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHashed = await hashPassword(password);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: passwordHashed,
      role: "user",
      createdAt: Math.floor(Date.now() / 1000),
    });

    // Generate session token and set cookie
    const sessionSecret =
      (env as any)?.SESSION_SECRET ||
      "sarina-default-session-secret-key-123456";
    const token = await createSessionToken(sessionSecret, userId, "user");

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully.",
      user: { id: userId, name: name.trim(), email: email.toLowerCase().trim(), role: "user" },
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
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
