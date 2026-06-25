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
    const { name, email, phone, password } = await req.json();

    // Validate input
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Name, email, phone number, and password are required." },
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

    let formattedPhone = phone.trim();
    // Auto-prepend +977 if it's a 10-digit number starting with 9
    if (/^9\d{9}$/.test(formattedPhone)) {
      formattedPhone = "+977" + formattedPhone;
    }

    // Validate Nepalese mobile format (+977 followed by 10 digits starting with 9)
    if (!/^\+9779\d{9}$/.test(formattedPhone)) {
      return NextResponse.json(
        { error: "Phone number must be a valid Nepalese number (e.g. +97798xxxxxxxx or 98xxxxxxxx)." },
        { status: 400 }
      );
    }

    const { env } = await getCloudflareContext({ async: true });
    if (!(env as any)?.DB) {
      return NextResponse.json(
        { error: "Database not available." },
        { status: 503 }
      );
    }

    const db = getDb((env as any).DB);

    // Check if email already exists
    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Check if phone already exists
    const existingPhone = await db
      .select()
      .from(users)
      .where(eq(users.phone, formattedPhone))
      .limit(1);

    if (existingPhone.length > 0) {
      return NextResponse.json(
        { error: "An account with this phone number already exists." },
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
      phone: formattedPhone,
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
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: formattedPhone,
        role: "user",
      },
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: `Registration failed: ${error?.message || error || "Unknown error"}` },
      { status: 500 }
    );
  }
}
