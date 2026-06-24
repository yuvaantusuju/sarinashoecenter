/**
 * ProductDetailPage — Server Component for the PDP.
 * Fetches single product details and its brand from Cloudflare D1.
 * Falls back to demo product list if not found.
 */

import React from "react";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { products, brands } from "@/db/schema";
import { ProductDetailClient } from "./ProductDetailClient";

// export const runtime = 'edge';
export const revalidate = 0; // Disable caching

interface PageProps {
  params: {
    id: string;
  };
}

// Fallback demo data lookup helper
const DEMO_PRODUCTS = [
  {
    id: "demo-1",
    brandId: "b-sportflex",
    brandName: "SportFlex",
    name: "Classic Runner Pro",
    description: "Premium running shoes built for speed and comfort with high-impact absorption.",
    price: 249900,
    colors: JSON.stringify(["Black", "White", "Navy Blue"]),
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop"
    ]),
    gender: "men",
    sizeStock: JSON.stringify({"40": 5, "41": 10, "42": 4}),
  },
  {
    id: "demo-2",
    brandId: "b-citystep",
    brandName: "CityStep",
    name: "Urban Street Walker",
    description: "Sleek leather-finish sneakers designed for everyday urban exploration and daily wear.",
    price: 179900,
    colors: JSON.stringify(["Brown", "Black"]),
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=600&fit=crop"
    ]),
    gender: "unisex",
    sizeStock: JSON.stringify({"39": 2, "40": 8, "41": 5, "42": 1}),
  },
  {
    id: "demo-3",
    brandId: "b-easywear",
    brandName: "EasyWear",
    name: "Comfort Glide Sandals",
    description: "Breathable and cushioned memory-foam sandals for ultimate summer leisure comfort.",
    price: 89900,
    colors: JSON.stringify(["Tan", "Black", "Brown"]),
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop"
    ]),
    gender: "women",
    sizeStock: JSON.stringify({"36": 4, "37": 6, "38": 3}),
  },
  {
    id: "demo-4",
    brandId: "b-sportflex",
    brandName: "SportFlex",
    name: "Elite Performance Trainer",
    description: "Cross-training athletic shoes for high-intensity gym workouts and heavy lifting.",
    price: 349900,
    colors: JSON.stringify(["Red", "Black", "White"]),
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop"
    ]),
    gender: "men",
    sizeStock: JSON.stringify({"41": 3, "42": 8, "43": 2}),
  },
  {
    id: "demo-5",
    brandId: "b-urbansole",
    brandName: "UrbanSole",
    name: "Canvas Sneaker Classic",
    description: "Retro canvas sneakers that never go out of style. Breathable upper, vulcanized sole.",
    price: 149900,
    colors: JSON.stringify(["White", "Navy", "Grey"]),
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop"
    ]),
    gender: "unisex",
    sizeStock: JSON.stringify({"38": 5, "39": 10, "40": 15, "41": 8, "42": 3}),
  },
  {
    id: "demo-6",
    brandId: "b-gracestep",
    brandName: "GraceStep",
    name: "Elegant Heel Pump",
    description: "Sophisticated formal heels for evening wear, weddings, and special events.",
    price: 299900,
    colors: JSON.stringify(["Black", "Red", "Beige"]),
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&h=600&fit=crop"
    ]),
    gender: "women",
    sizeStock: JSON.stringify({"35": 2, "36": 5, "37": 4}),
  },
  {
    id: "demo-7",
    brandId: "b-citystep",
    brandName: "CityStep",
    name: "Leather Oxford Classic",
    description: "Premium leather formal oxford dress shoes for men. Comfort footbed, sleek lace-up.",
    price: 399900,
    colors: JSON.stringify(["Brown", "Black"]),
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop"
    ]),
    gender: "men",
    sizeStock: JSON.stringify({"40": 4, "41": 6, "42": 5, "43": 1}),
  },
  {
    id: "demo-8",
    brandId: "b-sportflex",
    brandName: "SportFlex",
    name: "Sporty Running Lite",
    description: "Lightweight, breathable mesh running shoes with flex traction outsole.",
    price: 199900,
    colors: JSON.stringify(["Blue", "Pink", "Green"]),
    imageUrls: JSON.stringify([
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop"
    ]),
    gender: "women",
    sizeStock: JSON.stringify({"37": 6, "38": 8, "39": 4}),
  },
];

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = params;

  // 1. If it's a demo product ID, return immediately with demo details
  if (id.startsWith("demo-")) {
    const demoProd = DEMO_PRODUCTS.find((p) => p.id === id);
    if (!demoProd) notFound();
    return (
      <ProductDetailClient
        product={demoProd}
        brandName={demoProd.brandName}
      />
    );
  }

  let dbProduct: any = null;
  let brandName = "Brand";

  // 2. Fetch from Cloudflare D1
  try {
    const { env } = getCloudflareContext();
    if (env?.DB) {
      const db = getDb(env.DB);
      const results = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

      if (results && results.length > 0) {
        dbProduct = results[0];

        // Fetch brand details
        const brandResults = await db
          .select()
          .from(brands)
          .where(eq(brands.id, dbProduct.brandId))
          .limit(1);

        if (brandResults && brandResults.length > 0) {
          brandName = brandResults[0].name;
        }
      }
    }
  } catch (error) {
    console.warn("D1 query failed in PDP Server Component:", error);
  }

  // 3. Fallback to demo data if D1 fetch returned nothing (e.g. database unmigrated)
  if (!dbProduct) {
    const demoProd = DEMO_PRODUCTS.find((p) => p.id === id);
    if (demoProd) {
      return (
        <ProductDetailClient
          product={demoProd}
          brandName={demoProd.brandName}
        />
      );
    }
    // If truly not found anywhere
    notFound();
  }

  return (
    <ProductDetailClient
      product={dbProduct}
      brandName={brandName}
    />
  );
}
