/**
 * General utility functions for the Sarina Shoe Center application.
 * Includes Tailwind class merging, price formatting, and UUID generation.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper conflict resolution.
 * Combines clsx for conditional classes with tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price from paise (cents) to a display string.
 * @param paise - Price in paise (e.g. 199900)
 * @returns Formatted string like "₹1,999.00"
 */
export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Generate a simple UUID v4 string.
 * Uses crypto.randomUUID() which is available in all modern runtimes
 * including Cloudflare Workers.
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Safely parse a JSON string, returning a fallback value on failure.
 * Used for parsing the stringified JSON columns (colors, image_urls, size_stock).
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Truncate a string to a maximum length, adding ellipsis if needed.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}
