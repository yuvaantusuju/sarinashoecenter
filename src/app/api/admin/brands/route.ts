/**
 * GET /api/admin/brands — Lists all shoe brands.
 * POST /api/admin/brands — Admin only: creates a new shoe brand.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { brands } from "@/db/schema";
import { generateId } from "@/lib/utils";

export const revalidate = 0;
export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });

    if (!env?.DB) {
      // Return demo brands in development fallback
      return NextResponse.json({
        brands: [
          { id: "b-sportflex", name: "SportFlex", logoUrl: "" },
          { id: "b-citystep", name: "CityStep", logoUrl: "" },
          { id: "b-easywear", name: "EasyWear", logoUrl: "" },
          { id: "b-urbansole", name: "UrbanSole", logoUrl: "" },
          { id: "b-gracestep", name: "GraceStep", logoUrl: "" },
        ],
      });
    }

    const db = getDb(env.DB);
    const brandList = await db.select().from(brands);

    return NextResponse.json({ brands: brandList });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, logoUrl } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const newBrandId = `orange-${generateId().slice(0, 8)}`;

    if (!env?.DB) {
      console.warn("No DB binding, mock creating brand.");
      return NextResponse.json({
        success: true,
        brand: { id: newBrandId, name: name.trim(), logoUrl: logoUrl || "" },
      });
    }

    const db = getDb(env.DB);

    await db.insert(brands).values({
      id: newBrandId,
      name: name.trim(),
      logoUrl: logoUrl || "",
    });

    return NextResponse.json({
      success: true,
      brand: { id: newBrandId, name: name.trim(), logoUrl: logoUrl || "" },
    });
  } catch (error) {
    console.error("Create brand error:", error);
    return NextResponse.json({ error: "Database insert failed" }, { status: 500 });
  }
}
