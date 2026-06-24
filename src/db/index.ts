/**
 * Database connection utility for Cloudflare D1.
 *
 * Uses getCloudflareContext() from @opennextjs/cloudflare to access
 * the D1 binding, and wraps it in a per-request cached Drizzle client.
 *
 * IMPORTANT: Never create a global Drizzle instance at module scope.
 * Always call getDb() within the request context.
 */

import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import type { D1Database } from '@cloudflare/workers-types';

/**
 * Returns a Drizzle ORM client connected to the D1 database.
 *
 * For server components and API routes using @opennextjs/cloudflare,
 * pass the env.DB binding from getCloudflareContext().
 *
 * @param d1 - The D1Database binding from Cloudflare context
 * @returns Drizzle ORM client instance
 */
export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}
