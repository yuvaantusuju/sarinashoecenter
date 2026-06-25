/**
 * GET /api/admin/products — Lists all products.
 * POST /api/admin/products — Admin: creates a new product.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { generateId } from "@/lib/utils";



export const revalidate = 0;

// Fallback products list for development
const DEMO_PRODUCTS = [
  {
    id: "demo-1",
    brandId: "b-sportflex",
    brandName: "SportFlex",
    name: "Classic Runner Pro",
    description: "Premium running shoes built for speed and comfort.",
    price: 249900,
    gender: "men",
    colors: JSON.stringify(["Black", "White", "Navy Blue"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"]),
    sizeStock: JSON.stringify({"40": 5, "41": 10, "42": 4}),
  },
  {
    id: "demo-2",
    brandId: "b-citystep",
    brandName: "CityStep",
    name: "Urban Street Walker",
    description: "Sleek sneakers designed for everyday urban exploration.",
    price: 179900,
    gender: "unisex",
    colors: JSON.stringify(["Brown", "Black"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop"]),
    sizeStock: JSON.stringify({"39": 2, "40": 8, "41": 5, "42": 1}),
  },
  {
    id: "demo-3",
    brandId: "b-easywear",
    brandName: "EasyWear",
    name: "Comfort Glide Sandals",
    description: "Breathable and cushioned sandals for ultimate summer comfort.",
    price: 89900,
    gender: "women",
    colors: JSON.stringify(["Tan", "Black", "Brown"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&h=600&fit=crop"]),
    sizeStock: JSON.stringify({"36": 4, "37": 6, "38": 3}),
  },
  {
    id: "demo-4",
    brandId: "b-sportflex",
    brandName: "SportFlex",
    name: "Elite Performance Trainer",
    description: "Cross-training athletic shoes for high-intensity workouts.",
    price: 349900,
    gender: "men",
    colors: JSON.stringify(["Red", "Black", "White"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop"]),
    sizeStock: JSON.stringify({"41": 3, "42": 8, "43": 2}),
  },
];

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });

    if (!env?.DB) {
      // Return demo products if D1 is not bound
      return NextResponse.json({ products: DEMO_PRODUCTS });
    }

    const db = getDb(env.DB);
    const productList = await db.select().from(products);

    return NextResponse.json({ products: productList });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      brandId,
      name,
      description,
      price,
      gender,
      colors,
      imageUrls,
      sizeStock,
    } = await req.json();

    // Validations
    if (!brandId || !name?.trim() || !price || !gender) {
      return NextResponse.json(
        { error: "Brand, name, price, and gender are required" },
        { status: 400 }
      );
    }

    // Force price to number (integer paise)
    const priceInt = Math.round(Number(price));
    if (isNaN(priceInt) || priceInt <= 0) {
      return NextResponse.json({ error: "Price must be a valid number of paise" }, { status: 400 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const newProductId = `prod-${generateId().slice(0, 8)}`;

    // Prepare JSON fields safely (stringified arrays/objects)
    const colorsStr = typeof colors === "string" ? colors : JSON.stringify(colors || []);
    const imageUrlsStr = typeof imageUrls === "string" ? imageUrls : JSON.stringify(imageUrls || []);
    const sizeStockStr = typeof sizeStock === "string" ? sizeStock : JSON.stringify(sizeStock || {});

    if (!env?.DB) {
      console.warn("No DB binding, mock creating product.");
      return NextResponse.json({
        success: true,
        product: {
          id: newProductId,
          brandId,
          name: name.trim(),
          description: description || "",
          price: priceInt,
          gender,
          colors: colorsStr,
          imageUrls: imageUrlsStr,
          sizeStock: sizeStockStr,
        },
      });
    }

    const db = getDb(env.DB);

    await db.insert(products).values({
      id: newProductId,
      brandId,
      name: name.trim(),
      description: description || "",
      price: priceInt,
      gender,
      colors: colorsStr,
      imageUrls: imageUrlsStr,
      sizeStock: sizeStockStr,
    });

    return NextResponse.json({
      success: true,
      product: {
        id: newProductId,
        brandId,
        name: name.trim(),
        description: description || "",
        price: priceInt,
        gender,
        colors: colorsStr,
        imageUrls: imageUrlsStr,
        sizeStock: sizeStockStr,
      },
    });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Database insert failed" }, { status: 500 });
  }
}
