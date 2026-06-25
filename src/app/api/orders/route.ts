/**
 * GET /api/orders — Admin only: lists all orders.
 * POST /api/orders — Public: places an order, checks and decrements stock in a transaction.
 */

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { orders, products } from "@/db/schema";
import { generateId, safeJsonParse } from "@/lib/utils";



export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const { customerName, customerPhone, deliveryAddress, items } = await req.json();

    // 1. Validation
    if (!customerName?.trim() || !customerPhone?.trim() || !deliveryAddress?.trim() || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required checkout fields or cart items" },
        { status: 400 }
      );
    }

    const { env } = await getCloudflareContext({ async: true });

    // 2. Local fallback if D1 database is not bound
    if (!env?.DB) {
      console.warn("DB binding not found. Processing mock order checkout.");
      const orderId = `ord-${generateId().slice(0, 8)}`;
      return NextResponse.json({
        success: true,
        orderId,
        message: "Demo order created (No DB). Redirecting to WhatsApp.",
      });
    }

    const db = getDb(env.DB);
    const orderId = `ord-${generateId().slice(0, 8)}`;

    // 3. Process inside a Drizzle Transaction to guarantee stock integrity
    const result = await db.transaction(async (tx) => {
      let totalPriceSum = 0;
      const summaryLines: string[] = [];

      for (const item of items) {
        // Fetch product
        const prodResult = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (prodResult.length === 0) {
          throw new Error(`Product ${item.productName} not found`);
        }

        const productRow = prodResult[0];
        const stockMap = safeJsonParse<Record<string, number>>(productRow.sizeStock, {});

        const requestedSize = String(item.size);
        const currentStock = stockMap[requestedSize] ?? 0;

        if (currentStock < item.quantity) {
          throw new Error(
            `Inadequate stock for ${productRow.name} (Size ${requestedSize}). Only ${currentStock} left.`
          );
        }

        // Decrement stock
        stockMap[requestedSize] = currentStock - item.quantity;

        // Update product stock in DB
        await tx
          .update(products)
          .set({ sizeStock: JSON.stringify(stockMap) })
          .where(eq(products.id, productRow.id));

        // Tally price and construct item summary
        totalPriceSum += productRow.price * item.quantity;
        summaryLines.push(
          `${item.quantity}x ${productRow.name} (${item.color}, Size ${item.size})`
        );
      }

      // Insert Order
      await tx.insert(orders).values({
        id: orderId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        cartItemsSummary: summaryLines.join(" | "),
        totalPrice: totalPriceSum,
        status: "pending_payment",
        createdAt: Math.floor(Date.now() / 1000),
      });

      return { orderId };
    });

    return NextResponse.json({ success: true, orderId: result.orderId });
  } catch (error: any) {
    console.error("Checkout order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to place order. Database error." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });

    if (!env?.DB) {
      // Mock orders list for admin dashboard local dev
      return NextResponse.json({
        orders: [
          {
            id: "ord-demo1",
            customerName: "Rahul Sharma",
            customerPhone: "9876543210",
            deliveryAddress: "Apartment 4B, Sector 15, Noida, UP",
            cartItemsSummary: "1x Classic Runner Pro (Black, Size 42)",
            totalPrice: 249900,
            status: "pending_payment",
            createdAt: Math.floor(Date.now() / 1000) - 3600,
          },
          {
            id: "ord-demo2",
            customerName: "Priya Patel",
            customerPhone: "9988776655",
            deliveryAddress: "Flat 102, Shanti Kunj, Bandra, Mumbai",
            cartItemsSummary: "1x Elegant Heel Pump (Red, Size 36) | 1x Comfort Glide Sandals (Tan, Size 37)",
            totalPrice: 389800,
            status: "paid",
            createdAt: Math.floor(Date.now() / 1000) - 86400,
          },
        ],
      });
    }

    const db = getDb(env.DB);
    const orderList = await db.select().from(orders);

    // Sort by createdAt descending
    orderList.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({ orders: orderList });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
