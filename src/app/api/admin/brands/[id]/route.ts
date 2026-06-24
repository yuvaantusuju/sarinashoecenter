/**
 * PUT /api/admin/brands/[id] — Admin: updates an existing brand.
 * DELETE /api/admin/brands/[id] — Admin: deletes a brand.
 */

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { brands } from "@/db/schema";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, logoUrl } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const { env } = getCloudflareContext();

    if (!env?.DB) {
      return NextResponse.json({ success: true, message: "Mock brand updated" });
    }

    const db = getDb(env.DB);

    await db
      .update(brands)
      .set({
        name: name.trim(),
        logoUrl: logoUrl || "",
      })
      .where(eq(brands.id, id));

    return NextResponse.json({ success: true, message: "Brand updated successfully" });
  } catch (error) {
    console.error("Update brand error:", error);
    return NextResponse.json({ error: "Database update failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { env } = getCloudflareContext();

    if (!env?.DB) {
      return NextResponse.json({ success: true, message: "Mock brand deleted" });
    }

    const db = getDb(env.DB);

    await db.delete(brands).where(eq(brands.id, id));

    return NextResponse.json({ success: true, message: "Brand deleted successfully" });
  } catch (error) {
    console.error("Delete brand error:", error);
    return NextResponse.json({ error: "Database deletion failed" }, { status: 500 });
  }
}
