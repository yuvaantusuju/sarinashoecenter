/**
 * CheckoutModal — Captures customer details before placing order.
 *
 * Collects: Name, Phone, Shipping Address.
 * On submit: calls /api/orders, then redirects to WhatsApp.
 */

"use client";

import React, { useState } from "react";
import { X, Loader2, MessageCircle } from "lucide-react";
import { useCart, type CartItem } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice, cn } from "@/lib/utils";
import { redirectToWhatsApp, type CartItemForWhatsApp } from "@/lib/whatsapp";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, totalPrice, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Validate phone number (Indian format)
  const isPhoneValid = /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!isPhoneValid) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Send order to the API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: phone.trim(),
          deliveryAddress: address.trim(),
          items: cart.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            brandName: item.brandName,
            color: item.color,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            imageUrl: item.imageUrl,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to place order. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Build WhatsApp redirect items
      const whatsappItems: CartItemForWhatsApp[] = cart.map((item) => ({
        productName: item.productName,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      }));

      // Clear cart and close modal
      clearCart();
      onClose();

      // Redirect to WhatsApp
      redirectToWhatsApp(data.orderId, name.trim(), whatsappItems, totalPrice);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-black-100">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <MessageCircle className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-black-900">Complete Your Order</h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-black-400 hover:bg-black-50 hover:text-black-900 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="checkout-name" className="text-sm font-medium text-black-700">
                Full Name
              </label>
              <Input
                id="checkout-name"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="checkout-phone" className="text-sm font-medium text-black-700">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black-400">
                  +91
                </span>
                <Input
                  id="checkout-phone"
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-12"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label htmlFor="checkout-address" className="text-sm font-medium text-black-700">
                Delivery Address
              </label>
              <Textarea
                id="checkout-address"
                placeholder="House/Flat no., Street, Area, City, PIN Code"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg animate-fade-in">
                {error}
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-black-50 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-sm text-black-500">
                <span>Items ({cart.length})</span>
                <span className="font-medium text-black-900">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-black-900 pt-2 border-t border-black-200">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Confirm & Open WhatsApp
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
