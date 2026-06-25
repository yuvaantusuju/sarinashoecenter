/**
 * PATCH /api/orders/[id] — Admin: updates order status (e.g., mark as "paid" or "shipped").
 */

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { orders } from "@/db/schema";



export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!status || !["pending_payment", "paid", "shipped"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const { env } = await getCloudflareContext({ async: true });

    if (!env?.DB) {
      console.warn("No DB binding, mock updating order status in dev mode.");
      return NextResponse.json({ success: true, message: `Mock status updated to ${status}` });
    }

    const db = getDb(env.DB);
    
    const updateResult = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id));

    return NextResponse.json({ success: true, message: `Order status updated to ${status}` });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json({ error: "Database update failed" }, { status: 500 });
  }
}
