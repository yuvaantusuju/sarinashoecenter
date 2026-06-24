/**
 * Homepage — Landing page for Sarina Shoe Center.
 *
 * Features:
 * - Hero section with brand tagline and CTA
 * - Featured products grid
 * - Why Choose Us section
 *
 * Since we may not have D1 available in local dev without wrangler,
 * this page uses demo data as a fallback when the database isn't available.
 */

import React from "react";
import Link from "next/link";
import { ArrowRight, Truck, Shield, Star, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeProducts } from "@/components/storefront/HomeProducts";

export default function HomePage() {
  return (
    <div>
      {/* ════════════════════════════════════════════════════════════════
          HERO SECTION
         ════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-black-950 text-white">
        {/* Background gradient decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative page-container py-20 md:py-32 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm text-orange-300 mb-8 animate-fade-in-up">
            <Footprints className="h-4 w-4" />
            <span>Premium Quality, Honest Prices</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl animate-fade-in-up">
            Step Into{" "}
            <span className="text-gradient bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Comfort
            </span>
            <br />
            Step Into Style
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg md:text-xl text-black-300 max-w-2xl animate-fade-in-up">
            Discover affordable, high-quality everyday footwear that keeps you
            moving. From casual walks to daily hustle — we&apos;ve got your feet covered.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in-up">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-orange-500 text-black-900 hover:bg-orange-400 font-semibold shadow-lg shadow-orange-500/25 px-8"
              >
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/products?gender=men">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Men&apos;s Collection
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { value: "500+", label: "Products" },
              { value: "10K+", label: "Happy Customers" },
              { value: "50+", label: "Top Brands" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-black-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          FEATURED PRODUCTS
         ════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="page-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-2">
                Featured Collection
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-black-900">
                Trending Right Now
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-black-600 hover:text-orange-600 transition-colors"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Product grid — client component that fetches products */}
          <HomeProducts />

          {/* Mobile "View All" */}
          <div className="mt-8 text-center sm:hidden">
            <Link href="/products">
              <Button variant="outline">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          WHY CHOOSE US
         ════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-black-50">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-2">
              Why Sarina?
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-black-900">
              Built on Trust, Worn with Pride
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Star className="h-6 w-6" />,
                title: "Premium Quality",
                description:
                  "Every pair is crafted with top-grade materials for durability and comfort that lasts.",
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Honest Pricing",
                description:
                  "No middlemen markups. Direct-to-customer pricing that keeps quality footwear affordable.",
              },
              {
                icon: <Truck className="h-6 w-6" />,
                title: "Easy WhatsApp Orders",
                description:
                  "Shop online, confirm via WhatsApp. Simple, personal, and hassle-free shopping experience.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="relative p-6 rounded-2xl bg-white border border-black-100 hover-lift group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-black-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-black-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          CTA BANNER
         ════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-black-900">
        <div className="page-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your Perfect Pair?
          </h2>
          <p className="text-lg text-black-300 mb-8 max-w-2xl mx-auto">
            Browse our collection and order in just a few taps. Quick delivery, easy returns.
          </p>
          <Link href="/products">
            <Button
              size="lg"
              className="bg-orange-500 text-black-900 hover:bg-orange-400 font-semibold shadow-lg shadow-orange-500/25 px-8"
            >
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
