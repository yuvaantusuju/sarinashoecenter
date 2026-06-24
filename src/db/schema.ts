/**
 * Sarina Shoe Center — Drizzle ORM Schema
 *
 * Flattened 3-table design to eliminate complex multi-table joins.
 * Variant data (colors, images, stock) is stored as stringified JSON
 * inside text columns for maximum simplicity.
 *
 * Tables:
 *   1. brands   — shoe brand registry
 *   2. products — product catalog with embedded variant data
 *   3. orders   — customer orders placed via WhatsApp
 */

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ---------------------------------------------------------------------------
// 1. BRANDS — Simple brand registry
// ---------------------------------------------------------------------------
export const brands = sqliteTable("brands", {
  /** Unique brand identifier (UUID string) */
  id: text("id").primaryKey(),

  /** Display name of the brand (e.g. "Nike", "Bata") */
  name: text("name").notNull(),

  /** URL to the brand's logo image */
  logoUrl: text("logo_url").default(""),
});

// ---------------------------------------------------------------------------
// 2. USERS — Registered user accounts (customers + admins)
// ---------------------------------------------------------------------------
export const users = sqliteTable("users", {
  /** Unique user identifier (UUID string) */
  id: text("id").primaryKey(),

  /** User's display name */
  name: text("name").notNull(),

  /** Email address (unique, used for login) */
  email: text("email").notNull().unique(),

  /** PBKDF2-hashed password (base64 encoded "salt:hash") */
  passwordHash: text("password_hash").notNull(),

  /** User role: "user" (regular customer) or "admin" */
  role: text("role").notNull().default("user"),

  /** Unix timestamp (seconds) when the user registered */
  createdAt: integer("created_at").notNull(),
});

// ---------------------------------------------------------------------------
// 3. PRODUCTS — Product catalog with embedded JSON variant data
// ---------------------------------------------------------------------------
export const products = sqliteTable("products", {
  /** Unique product identifier (UUID string) */
  id: text("id").primaryKey(),

  /** Foreign key → brands.id */
  brandId: text("brand_id").notNull(),

  /** Product display name (e.g. "Air Max Classic Runner") */
  name: text("name").notNull(),

  /** Product description / marketing copy */
  description: text("description").default(""),

  /** Price in paise (INR cents). 199900 = ₹1,999.00 */
  price: integer("price").notNull(),

  /** Target gender: "men" | "women" | "unisex" */
  gender: text("gender").notNull().default("unisex"),

  /**
   * Available colors — stored as a stringified JSON array.
   * Example: '["Black","White","Navy Blue"]'
   */
  colors: text("colors").notNull().default("[]"),

  /**
   * Image URLs mapped to colors — stored as a stringified JSON array.
   * Each entry corresponds to the color at the same index.
   * Example: '["https://...black.jpg","https://...white.jpg","https://...navy.jpg"]'
   */
  imageUrls: text("image_urls").notNull().default("[]"),

  /**
   * Size → stock quantity mapping — stored as a stringified JSON object.
   * Keys are shoe sizes (strings), values are available quantities.
   * Example: '{"38":5,"39":10,"40":15,"41":8,"42":3}'
   */
  sizeStock: text("size_stock").notNull().default("{}"),
});

// ---------------------------------------------------------------------------
// 3. ORDERS — WhatsApp-verified customer orders
// ---------------------------------------------------------------------------
export const orders = sqliteTable("orders", {
  /** Unique order identifier (UUID string) */
  id: text("id").primaryKey(),

  /** Customer's full name */
  customerName: text("customer_name").notNull(),

  /** Customer's phone number (for WhatsApp confirmation) */
  customerPhone: text("customer_phone").notNull(),

  /** Shipping / delivery address */
  deliveryAddress: text("delivery_address").notNull(),

  /**
   * Human-readable summary of what was ordered.
   * Example: "1x Air Max (Black, Size 42) | 2x Runner Pro (White, Size 39)"
   */
  cartItemsSummary: text("cart_items_summary").notNull(),

  /** Total price in paise (INR cents) */
  totalPrice: integer("total_price").notNull(),

  /**
   * Order lifecycle status.
   * Values: "pending_payment" → "paid" → "shipped"
   */
  status: text("status").notNull().default("pending_payment"),

  /** Unix timestamp (seconds) when the order was created */
  createdAt: integer("created_at").notNull(),
});

// ---------------------------------------------------------------------------
// TypeScript types inferred from the schema
// ---------------------------------------------------------------------------
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
