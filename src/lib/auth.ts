/**
 * Authentication helpers for Sarina Shoe Center.
 *
 * Uses a simple cookie-based approach:
 * - Users register / log in with email + password (hashed with PBKDF2)
 * - A signed session token (HMAC) is set as an HTTP-only cookie
 * - Middleware validates the cookie on every /admin/* request
 * - Tokens carry role ("user" | "admin") and userId for authorization
 */

// ── Constants ─────────────────────────────────────────────────────────────
export const AUTH_COOKIE_NAME = "sarina_admin_session";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// ── Password Hashing (PBKDF2) ────────────────────────────────────────────

/**
 * Hash a plaintext password using PBKDF2-SHA256 with a random salt.
 * Returns a string in the format "base64salt:base64hash".
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return `${saltB64}:${hashB64}`;
}

/**
 * Verify a plaintext password against a stored "salt:hash" string.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const [saltB64, hashB64] = storedHash.split(":");
    if (!saltB64 || !hashB64) return false;

    const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const hash = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );

    const computedB64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
    return computedB64 === hashB64;
  } catch {
    return false;
  }
}

// ── Token Generation ──────────────────────────────────────────────────────
/**
 * Create a signed session token using HMAC-SHA256.
 * The token encodes the user's ID, role, and an expiry timestamp.
 */
export async function createSessionToken(
  secret: string,
  userId: string,
  role: string = "user"
): Promise<string> {
  const payload = {
    userId,
    role,
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
export interface TokenPayload {
  valid: boolean;
  userId: string;
  role: string;
}

/**
 * Verify a session token's signature and check expiry.
 * Returns structured payload with validity, userId, and role.
 */
export async function verifySessionToken(
  token: string,
  secret: string
): Promise<TokenPayload> {
  const invalid: TokenPayload = { valid: false, userId: "", role: "" };

  try {
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return invalid;

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

    if (!isValid) return invalid;

    // Check expiry
    const payload = JSON.parse(atob(payloadB64));
    if (payload.exp < Date.now()) return invalid;

    return {
      valid: true,
      userId: payload.userId || "",
      role: payload.role || "user",
    };
  } catch {
    return invalid;
  }
}
