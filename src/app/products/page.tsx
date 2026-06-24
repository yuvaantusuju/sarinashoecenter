/**
 * ProductsPage — Server Component for the shoe listing catalog.
 * Fetches products and brands from Cloudflare D1.
 */

import React from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { products, brands } from "@/db/schema";
import { ProductListingClient } from "./ProductListingClient";

// export const runtime = 'edge';
export const revalidate = 0; // Disable caching to fetch fresh DB rows

interface SearchParams {
  gender?: string;
  brand?: string;
  search?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  let dbProducts: any[] = [];
  let dbBrands: any[] = [];

  try {
    const { env } = getCloudflareContext();
    if (env?.DB) {
      const db = getDb(env.DB);
      dbProducts = await db.select().from(products);
      dbBrands = await db.select().from(brands);
    }
  } catch (error) {
    console.warn(
      "D1 database is not available or query failed. ProductListingClient will fallback to demo products.",
      error
    );
  }

  return (
    <ProductListingClient
      initialProducts={dbProducts}
      initialBrands={dbBrands}
      searchParams={searchParams}
    />
  );
}
