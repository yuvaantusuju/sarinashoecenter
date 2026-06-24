/**
 * ClientLayout — Client-side wrapper that provides:
 * - CartProvider context
 * - Header with cart drawer toggle
 * - CartDrawer (slide-out)
 * - CheckoutModal
 * - Footer (hidden on admin routes)
 *
 * This is separated from the root layout because it uses "use client".
 */

"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CheckoutModal } from "@/components/cart/CheckoutModal";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Auto-open cart drawer when triggered via event
  React.useEffect(() => {
    const handleOpen = () => setCartOpen(true);
    window.addEventListener("open-cart", handleOpen);
    return () => window.removeEventListener("open-cart", handleOpen);
  }, []);

  // On admin routes, render children without storefront chrome
  if (isAdmin) {
    return <CartProvider>{children}</CartProvider>;
  }

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Header onCartOpen={() => setCartOpen(true)} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </CartProvider>
  );
}
