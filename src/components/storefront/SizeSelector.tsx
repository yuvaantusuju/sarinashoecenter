/**
 * SizeSelector — Interactive size grid for the PDP.
 *
 * Parses the size_stock JSON object to display available sizes.
 * Out-of-stock sizes are visually disabled. Selected size is highlighted.
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  /** Size → quantity mapping, e.g. { "38": 5, "39": 0, "40": 10 } */
  sizeStock: Record<string, number>;
  selectedSize: string;
  onSizeSelect: (size: string) => void;
}

export function SizeSelector({ sizeStock, selectedSize, onSizeSelect }: SizeSelectorProps) {
  // Sort sizes numerically
  const sizes = Object.keys(sizeStock).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-black-700">Size:</span>
        {selectedSize && (
          <span className="text-sm text-black-500">
            EU {selectedSize}
            {sizeStock[selectedSize] !== undefined && sizeStock[selectedSize] <= 3 && sizeStock[selectedSize] > 0 && (
              <span className="text-orange-500 ml-1">
                (Only {sizeStock[selectedSize]} left!)
              </span>
            )}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const stock = sizeStock[size] ?? 0;
          const isOutOfStock = stock <= 0;
          const isSelected = size === selectedSize;

          return (
            <button
              key={size}
              onClick={() => !isOutOfStock && onSizeSelect(size)}
              disabled={isOutOfStock}
              className={cn(
                "relative h-11 min-w-[3rem] px-3 rounded-lg text-sm font-medium transition-all duration-200",
                "border",
                isSelected
                  ? "bg-black-900 text-white border-black-900 shadow-md"
                  : isOutOfStock
                    ? "bg-black-50 text-black-300 border-black-100 cursor-not-allowed line-through"
                    : "bg-white text-black-700 border-black-200 hover:border-black-400 hover:bg-black-50"
              )}
              aria-label={
                isOutOfStock
                  ? `Size ${size} — Out of stock`
                  : `Select size ${size}`
              }
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
