/**
 * ColorPicker — Interactive color swatch selector for the PDP.
 *
 * Displays color circles that the user can click to select a color.
 * The selected color controls which product image is displayed.
 */

"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Color name → CSS color mapping
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

interface ColorPickerProps {
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export function ColorPicker({ colors, selectedColor, onColorSelect }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-black-700">Color:</span>
        <span className="text-sm text-black-500 capitalize">{selectedColor}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const isSelected = color === selectedColor;
          const bgColor = COLOR_MAP[color.toLowerCase()] || "#94a3b8";
          const isLight =
            color.toLowerCase() === "white" ||
            color.toLowerCase() === "beige" ||
            color.toLowerCase() === "yellow";

          return (
            <button
              key={color}
              onClick={() => onColorSelect(color)}
              className={cn(
                "relative h-10 w-10 rounded-full transition-all duration-200",
                "ring-offset-2 hover:scale-110",
                isSelected
                  ? "ring-2 ring-orange-500 scale-110"
                  : "ring-1 ring-black-200 hover:ring-black-400"
              )}
              style={{ backgroundColor: bgColor }}
              title={color}
              aria-label={`Select color: ${color}`}
            >
              {isSelected && (
                <Check
                  className={cn(
                    "absolute inset-0 m-auto h-4 w-4",
                    isLight ? "text-black-900" : "text-white"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
