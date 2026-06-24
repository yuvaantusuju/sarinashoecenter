/**
 * Root Layout — wraps the entire application.
 *
 * Provides:
 * - Inter font from Google Fonts
 * - CartProvider context
 * - Header + Footer (on non-admin routes)
 * - Cart drawer + Checkout modal
 * - SEO metadata
 */

import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";

export const metadata: Metadata = {
  title: "Sarina Shoe Center — Affordable Quality Footwear",
  description:
    "Discover affordable, high-quality everyday footwear at Sarina Shoe Center. Shop the latest styles for men and women with easy WhatsApp ordering.",
  keywords: ["shoes", "footwear", "affordable shoes", "men shoes", "women shoes", "Sarina Shoe Center"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-white antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
