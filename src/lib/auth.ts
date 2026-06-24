/**
 * Authentication helpers for the admin panel.
 *
 * Uses a simple cookie-based approach:
 * - Admin logs in with a password checked against ADMIN_PASSWORD env var
 * - A signed session token (HMAC) is set as an HTTP-only cookie
 * - Middleware validates the cookie on every /admin/* request
 */

// ── Constants ─────────────────────────────────────────────────────────────
export const AUTH_COOKIE_NAME = "sarina_admin_session";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// ── Token Generation ──────────────────────────────────────────────────────
/**
 * Create a simple signed session token using HMAC-SHA256.
 * The token contains the admin identifier and an expiry timestamp.
 */
export async function createSessionToken(secret: string): Promise<string> {
  const payload = {
    role: "admin",
    exp: Date.now() + AUTH_COOKIE_MAX_AGE * 1000,
  };

  const payloadStr = JSON.stringify(payload);
  const payloadB64 = btoa(payloadStr);

  // Sign with HMAC-SHA256
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${payloadB64}.${sigB64}`;
}

// ── Token Verification ────────────────────────────────────────────────────
/**
 * Verify a session token's signature and check expiry.
 * Returns true if valid, false otherwise.
 */
export async function verifySessionToken(
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return false;

    // Verify HMAC signature
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBytes = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(payloadB64)
    );

    if (!isValid) return false;

    // Check expiry
    const payload = JSON.parse(atob(payloadB64));
    if (payload.exp < Date.now()) return false;

    return payload.role === "admin";
  } catch {
    return false;
  }
}
