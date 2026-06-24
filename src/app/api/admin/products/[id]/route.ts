/**
 * PUT /api/admin/products/[id] — Admin: updates an existing product.
 * DELETE /api/admin/products/[id] — Admin: deletes a product.
 */

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { products } from "@/db/schema";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    if (!brandId || !name?.trim() || !price || !gender) {
      return NextResponse.json(
        { error: "Brand, name, price, and gender are required" },
        { status: 400 }
      );
    }

    const priceInt = Math.round(Number(price));
    if (isNaN(priceInt) || priceInt <= 0) {
      return NextResponse.json({ error: "Price must be a valid number of paise" }, { status: 400 });
    }

    const { env } = getCloudflareContext();

    const colorsStr = typeof colors === "string" ? colors : JSON.stringify(colors || []);
    const imageUrlsStr = typeof imageUrls === "string" ? imageUrls : JSON.stringify(imageUrls || []);
    const sizeStockStr = typeof sizeStock === "string" ? sizeStock : JSON.stringify(sizeStock || {});

    if (!env?.DB) {
      return NextResponse.json({ success: true, message: "Mock product updated" });
    }

    const db = getDb(env.DB);

    await db
      .update(products)
      .set({
        brandId,
        name: name.trim(),
        description: description || "",
        price: priceInt,
        gender,
        colors: colorsStr,
        imageUrls: imageUrlsStr,
        sizeStock: sizeStockStr,
      })
      .where(eq(products.id, id));

    return NextResponse.json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Database update failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { env } = getCloudflareContext();

    if (!env?.DB) {
      return NextResponse.json({ success: true, message: "Mock product deleted" });
    }

    const db = getDb(env.DB);

    await db.delete(products).where(eq(products.id, id));

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Database deletion failed" }, { status: 500 });
  }
}
