/**
 * CartDrawer — Slide-out cart panel.
 *
 * Shows all cart items with quantity controls, total price,
 * and a "Place Order via WhatsApp" button that opens the checkout modal.
 */

"use client";

import React from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { cart, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* ── Drawer Panel ──────────────────────────────── */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-black-900" />
            <h2 className="text-lg font-semibold text-black-900">
              Your Cart
              {totalItems > 0 && (
                <span className="ml-2 text-sm font-normal text-black-400">
                  ({totalItems} {totalItems === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-black-400 hover:bg-black-50 hover:text-black-900 transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black-50 mb-4">
                <ShoppingBag className="h-10 w-10 text-black-300" />
              </div>
              <p className="text-black-500 font-medium">Your cart is empty</p>
              <p className="text-sm text-black-400 mt-1">
                Browse our collection and add your favorites!
              </p>
              <Button variant="outline" className="mt-4" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.color}-${item.size}`}
                  className="flex gap-4 p-3 rounded-xl bg-black-50/50 animate-fade-in"
                >
                  {/* Product Image */}
                  <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-black-100 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-black-300">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-black-900 truncate">
                      {item.productName}
                    </h3>
                    <p className="text-xs text-black-400 mt-0.5">
                      {item.brandName} · {item.color} · Size {item.size}
                    </p>
                    <p className="text-sm font-bold text-black-900 mt-1">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.color, item.size, item.quantity - 1)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-black-200 text-black-500 hover:bg-black-100 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-black-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.color, item.size, item.quantity + 1)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-black-200 text-black-500 hover:bg-black-100 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId, item.color, item.size)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — Total + Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-black-100 px-6 py-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black-500">Subtotal</span>
              <span className="text-lg font-bold text-black-900">{formatPrice(totalPrice)}</span>
            </div>
            <Button
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
              onClick={onCheckout}
            >
              <span>Place Order via WhatsApp</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-[11px] text-center text-black-400">
              You&apos;ll be redirected to WhatsApp to confirm payment
            </p>
          </div>
        )}
      </div>
    </>
  );
}
