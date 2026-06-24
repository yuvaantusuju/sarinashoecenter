/**
 * ProductDetailClient — Stateful client-side interactive component for the PDP.
 * Manages photo gallery, color picking, size checking, quantity limit, and Cart addition.
 */

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Truck, RotateCcw, Plus, Minus, ShoppingBag } from "lucide-react";
import { ColorPicker } from "@/components/storefront/ColorPicker";
import { SizeSelector } from "@/components/storefront/SizeSelector";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatPrice, safeJsonParse } from "@/lib/utils";

interface Product {
  id: string;
  brandId: string;
  name: string;
  description: string | null;
  price: number;
  gender: string;
  colors: string;
  imageUrls: string;
  sizeStock: string;
}

interface ProductDetailClientProps {
  product: Product;
  brandName: string;
}

export function ProductDetailClient({ product, brandName }: ProductDetailClientProps) {
  const { addItem } = useCart();

  // Parse JSON columns
  const colorList = useMemo(() => safeJsonParse<string[]>(product.colors, []), [product.colors]);
  const imageList = useMemo(() => safeJsonParse<string[]>(product.imageUrls, []), [product.imageUrls]);
  const sizeStockMap = useMemo(
    () => safeJsonParse<Record<string, number>>(product.sizeStock, {}),
    [product.sizeStock]
  );

  // States
  const [selectedColor, setSelectedColor] = useState(colorList[0] || "");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Derive the active image. Since images map 1-to-1 to colors:
  const activeImage = useMemo(() => {
    const colorIndex = colorList.indexOf(selectedColor);
    if (colorIndex >= 0 && imageList[colorIndex]) {
      return imageList[colorIndex];
    }
    return imageList[0] || "";
  }, [selectedColor, colorList, imageList]);

  // Max quantity allowed for the selected size
  const maxQuantity = useMemo(() => {
    if (!selectedSize) return 1;
    return sizeStockMap[selectedSize] ?? 0;
  }, [selectedSize, sizeStockMap]);

  // Total stock across all sizes
  const isOutOfStockEntirely = useMemo(() => {
    return Object.values(sizeStockMap).reduce((sum, qty) => sum + qty, 0) <= 0;
  }, [sizeStockMap]);

  // Handle color click
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  // Handle size click
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setQuantity(1); // Reset quantity to 1 when changing size
  };

  // Add to cart action
  const handleAddToCart = () => {
    if (!selectedSize) return;

    addItem({
      productId: product.id,
      productName: product.name,
      brandName: brandName,
      color: selectedColor,
      size: selectedSize,
      quantity: quantity,
      price: product.price,
      imageUrl: activeImage,
    });

    // Trigger the auto-slide drawer opening event
    window.dispatchEvent(new Event("open-cart"));
  };

  return (
    <div className="bg-navy-50/20 py-8 min-h-screen">
      <div className="page-container">
        {/* ── Breadcrumb Navigation ────────────────────── */}
        <nav className="flex items-center gap-1.5 text-xs text-navy-400 font-medium mb-8">
          <Link href="/" className="hover:text-navy-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/products" className="hover:text-navy-900 transition-colors">
            Shop
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-navy-700 capitalize">{product.gender}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-navy-900 truncate">{product.name}</span>
        </nav>

        {/* ── Main Details Grid ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Photo Gallery (Left) */}
          <div className="space-y-4">
            <div className="aspect-square bg-white border border-navy-100 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-navy-200">
                  <ShoppingBag className="h-24 w-24" />
                </div>
              )}
            </div>

            {/* Thumbnail list (all product images) */}
            {imageList.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto py-1">
                {imageList.map((img, i) => {
                  const isActive = img === activeImage;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (colorList[i]) setSelectedColor(colorList[i]);
                      }}
                      className={`h-16 w-16 rounded-lg overflow-hidden border bg-white flex-shrink-0 transition-all ${
                        isActive ? "border-brand-500 ring-2 ring-brand-500/20" : "border-navy-200 hover:border-navy-400"
                      }`}
                    >
                      <img src={img} alt={`${product.name} preview`} className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details Column (Right) */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1.5">
                {brandName}
              </p>
              <h1 className="text-2xl md:text-4xl font-extrabold text-navy-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mt-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy-100 text-navy-800 capitalize">
                  {product.gender}
                </span>
                {isOutOfStockEntirely ? (
                  <span className="text-xs font-semibold text-red-500">Out of Stock</span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600">In Stock</span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="pb-4 border-b border-navy-100">
              <p className="text-3xl font-extrabold text-navy-900">{formatPrice(product.price)}</p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h2 className="text-sm font-semibold text-navy-800">Description</h2>
              <p className="text-sm text-navy-500 leading-relaxed">
                {product.description || "No description available for this shoe model."}
              </p>
            </div>

            {/* Color Swatches */}
            {colorList.length > 0 && (
              <ColorPicker
                colors={colorList}
                selectedColor={selectedColor}
                onColorSelect={handleColorSelect}
              />
            )}

            {/* Sizes */}
            {!isOutOfStockEntirely && (
              <SizeSelector
                sizeStock={sizeStockMap}
                selectedSize={selectedSize}
                onSizeSelect={handleSizeSelect}
              />
            )}

            {/* Quantity and CTA */}
            {!isOutOfStockEntirely && (
              <div className="space-y-4 pt-2">
                {selectedSize && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-navy-700">Quantity:</span>
                    <div className="flex items-center rounded-lg border border-navy-200 bg-white">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="p-2.5 text-navy-500 hover:text-navy-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-navy-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                        disabled={quantity >= maxQuantity}
                        className="p-2.5 text-navy-500 hover:text-navy-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  disabled={!selectedSize || maxQuantity <= 0}
                  onClick={handleAddToCart}
                  className={`w-full py-6 rounded-xl font-bold transition-all shadow-md ${
                    selectedSize
                      ? "bg-navy-900 text-white hover:bg-navy-850 hover:shadow-lg"
                      : "bg-navy-100 text-navy-400 border border-navy-200 cursor-not-allowed shadow-none"
                  }`}
                >
                  {isOutOfStockEntirely ? (
                    "Sold Out"
                  ) : !selectedSize ? (
                    "Select a Size"
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Add to Shopping Cart
                    </span>
                  )}
                </Button>
              </div>
            )}

            {/* Shipping & Returns highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-navy-100">
              {[
                { icon: <Truck className="h-5 w-5 text-brand-600" />, title: "Free Shipping", subtitle: "On orders above ₹999" },
                { icon: <RotateCcw className="h-5 w-5 text-brand-600" />, title: "Easy returns", subtitle: "14-day replacement" },
                { icon: <ShieldCheck className="h-5 w-5 text-brand-600" />, title: "Secure Checkout", subtitle: "WhatsApp verified" },
              ].map((item, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <div className="mt-0.5">{item.icon}</div>
                  <div>
                    <h4 className="text-xs font-bold text-navy-900 leading-tight">{item.title}</h4>
                    <p className="text-[10px] text-navy-400 mt-0.5 leading-tight">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
