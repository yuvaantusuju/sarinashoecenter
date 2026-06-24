/**
 * GET /api/auth/me — Returns current user info from session token.
 * Used by the client to check auth state and display user info.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

// export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const sessionSecret =
      process.env.SESSION_SECRET || "sarina-default-session-secret-key-123456";
    const payload = await verifySessionToken(token, sessionSecret);

    if (!payload.valid || !payload.userId) {
      return NextResponse.json({ user: null });
    }

    const { env } = getCloudflareContext();
    if (!(env as any)?.DB) {
      // Fallback: return basic info from token if DB unavailable
      return NextResponse.json({
        user: { id: payload.userId, name: "User", email: "", phone: "", role: payload.role },
      });
    }

    const db = getDb((env as any).DB);
    const found = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (found.length === 0) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: found[0] });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ user: null });
  }
}
