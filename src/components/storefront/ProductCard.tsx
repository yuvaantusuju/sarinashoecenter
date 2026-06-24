/**
 * ProductCard — Reusable product listing card.
 *
 * Shows product image, brand badge, name, price, and available colors.
 * Entire card is clickable and navigates to the PDP.
 */

"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, safeJsonParse } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  brandName: string;
  price: number;
  colors: string; // Stringified JSON array
  imageUrls: string; // Stringified JSON array
  gender: string;
}

// Color name → CSS color mapping for swatch display
const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a",
  white: "#ffffff",
  red: "#ef4444",
  blue: "#3b82f6",
  "navy blue": "#1e3a5f",
  navy: "#1e3a5f",
  green: "#22c55e",
  brown: "#92400e",
  tan: "#d2b48c",
  grey: "#6b7280",
  gray: "#6b7280",
  pink: "#ec4899",
  orange: "#f97316",
  yellow: "#eab308",
  purple: "#a855f7",
  beige: "#f5f5dc",
  maroon: "#800000",
  olive: "#808000",
  teal: "#14b8a6",
  coral: "#ff7f50",
};

export function ProductCard({
  id,
  name,
  brandName,
  price,
  colors,
  imageUrls,
  gender,
}: ProductCardProps) {
  const colorList = safeJsonParse<string[]>(colors, []);
  const imageList = safeJsonParse<string[]>(imageUrls, []);
  const mainImage = imageList[0] || "";

  return (
    <Link href={`/products/${id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-white border border-black-100 hover-lift">
        {/* ── Image ───────────────────────────────────── */}
        <div className="relative aspect-square bg-black-50 overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-black-200">
              <ShoppingBag className="h-16 w-16" />
            </div>
          )}

          {/* Gender badge */}
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 capitalize bg-white/90 backdrop-blur-sm text-black-700"
          >
            {gender}
          </Badge>
        </div>

        {/* ── Details ─────────────────────────────────── */}
        <div className="p-4 space-y-2">
          {/* Brand */}
          <p className="text-xs font-medium text-orange-600 uppercase tracking-wider">
            {brandName}
          </p>

          {/* Name */}
          <h3 className="text-sm font-semibold text-black-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {name}
          </h3>

          {/* Price + Colors */}
          <div className="flex items-center justify-between pt-1">
            <p className="text-lg font-bold text-black-900">{formatPrice(price)}</p>

            {/* Color swatches */}
            {colorList.length > 0 && (
              <div className="flex items-center gap-1">
                {colorList.slice(0, 4).map((color) => (
                  <div
                    key={color}
                    className="h-4 w-4 rounded-full border border-black-200"
                    style={{
                      backgroundColor:
                        COLOR_MAP[color.toLowerCase()] || "#94a3b8",
                    }}
                    title={color}
                  />
                ))}
                {colorList.length > 4 && (
                  <span className="text-[10px] text-black-400 ml-0.5">
                    +{colorList.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
