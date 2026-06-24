/**
 * ProductListingClient — Interactive product search, filtering, and sorting page.
 * Handles client-side state for instantaneous updates.
 */

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, ArrowUpDown, X, Tag } from "lucide-react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

interface Brand {
  id: string;
  name: string;
  logoUrl: string | null;
}

interface ProductListingClientProps {
  initialProducts: Product[];
  initialBrands: Brand[];
  searchParams: { gender?: string; brand?: string; search?: string };
}

// Fallback demo brands if database is empty
const DEMO_BRANDS = [
  { id: "b-sportflex", name: "SportFlex" },
  { id: "b-citystep", name: "CityStep" },
  { id: "b-easywear", name: "EasyWear" },
  { id: "b-urbansole", name: "UrbanSole" },
  { id: "b-gracestep", name: "GraceStep" },
];

// Fallback demo products if database is empty
const DEMO_PRODUCTS = [
  {
    id: "demo-1",
    brandId: "b-sportflex",
    name: "Classic Runner Pro",
    description: "Premium running shoes built for speed and comfort.",
    price: 249900,
    colors: JSON.stringify(["Black", "White", "Navy Blue"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"]),
    gender: "men",
    sizeStock: JSON.stringify({"40": 5, "41": 10, "42": 4}),
  },
  {
    id: "demo-2",
    brandId: "b-citystep",
    name: "Urban Street Walker",
    description: "Sleek sneakers designed for everyday urban exploration.",
    price: 179900,
    colors: JSON.stringify(["Brown", "Black"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop"]),
    gender: "unisex",
    sizeStock: JSON.stringify({"39": 2, "40": 8, "41": 5, "42": 1}),
  },
  {
    id: "demo-3",
    brandId: "b-easywear",
    name: "Comfort Glide Sandals",
    description: "Breathable and cushioned sandals for ultimate summer comfort.",
    price: 89900,
    colors: JSON.stringify(["Tan", "Black", "Brown"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&h=600&fit=crop"]),
    gender: "women",
    sizeStock: JSON.stringify({"36": 4, "37": 6, "38": 3}),
  },
  {
    id: "demo-4",
    brandId: "b-sportflex",
    name: "Elite Performance Trainer",
    description: "Cross-training athletic shoes for high-intensity workouts.",
    price: 349900,
    colors: JSON.stringify(["Red", "Black", "White"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop"]),
    gender: "men",
    sizeStock: JSON.stringify({"41": 3, "42": 8, "43": 2}),
  },
  {
    id: "demo-5",
    brandId: "b-urbansole",
    name: "Canvas Sneaker Classic",
    description: "Retro canvas sneakers that never go out of style.",
    price: 149900,
    colors: JSON.stringify(["White", "Navy", "Grey"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop"]),
    gender: "unisex",
    sizeStock: JSON.stringify({"38": 5, "39": 10, "40": 15, "41": 8, "42": 3}),
  },
  {
    id: "demo-6",
    brandId: "b-gracestep",
    name: "Elegant Heel Pump",
    description: "Sophisticated formal heels for evening wear and special occasions.",
    price: 299900,
    colors: JSON.stringify(["Black", "Red", "Beige"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=600&fit=crop"]),
    gender: "women",
    sizeStock: JSON.stringify({"35": 2, "36": 5, "37": 4}),
  },
  {
    id: "demo-7",
    brandId: "b-citystep",
    name: "Leather Oxford Classic",
    description: "Premium leather formal oxford shoes for men.",
    price: 399900,
    colors: JSON.stringify(["Brown", "Black"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=600&fit=crop"]),
    gender: "men",
    sizeStock: JSON.stringify({"40": 4, "41": 6, "42": 5, "43": 1}),
  },
  {
    id: "demo-8",
    brandId: "b-sportflex",
    name: "Sporty Running Lite",
    description: "Lightweight, breathable mesh running shoes.",
    price: 199900,
    colors: JSON.stringify(["Blue", "Pink", "Green"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop"]),
    gender: "women",
    sizeStock: JSON.stringify({"37": 6, "38": 8, "39": 4}),
  },
];

export function ProductListingClient({
  initialProducts,
  initialBrands,
  searchParams,
}: ProductListingClientProps) {
  // Use DB data if present, otherwise fall back to demo data
  const hasDbData = initialProducts && initialProducts.length > 0;
  const productsList = hasDbData ? initialProducts : DEMO_PRODUCTS;
  const brandsList = initialBrands && initialBrands.length > 0 ? initialBrands : DEMO_BRANDS;

  // Build a fast lookup for Brand Name by Brand ID
  const brandMap = useMemo(() => {
    const map = new Map<string, string>();
    brandsList.forEach((b) => map.set(b.id, b.name));
    return map;
  }, [brandsList]);

  // Map products to include brandName
  const productsWithBrand = useMemo(() => {
    return productsList.map((p) => ({
      ...p,
      brandName: brandMap.get(p.brandId) || "Brand",
    }));
  }, [productsList, brandMap]);

  // State
  const [search, setSearch] = useState(searchParams.search || "");
  const [genderFilter, setGenderFilter] = useState<string>(searchParams.gender || "all");
  const [brandFilter, setBrandFilter] = useState<string>(searchParams.brand || "all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync with searchParams if they change
  useEffect(() => {
    if (searchParams.gender) setGenderFilter(searchParams.gender);
    if (searchParams.brand) setBrandFilter(searchParams.brand);
    if (searchParams.search) setSearch(searchParams.search);
  }, [searchParams]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch("");
    setGenderFilter("all");
    setBrandFilter("all");
    setSortBy("featured");
  };

  // Filtered and Sorted list
  const processedProducts = useMemo(() => {
    let result = [...productsWithBrand];

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q)
      );
    }

    // Gender filter
    if (genderFilter !== "all") {
      result = result.filter((p) => p.gender.toLowerCase() === genderFilter.toLowerCase());
    }

    // Brand filter
    if (brandFilter !== "all") {
      result = result.filter((p) => p.brandId === brandFilter);
    }

    // Sort
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [productsWithBrand, search, genderFilter, brandFilter, sortBy]);

  const activeFilterCount =
    (genderFilter !== "all" ? 1 : 0) + (brandFilter !== "all" ? 1 : 0) + (search ? 1 : 0);

  return (
    <div className="bg-black-50/50 min-h-screen py-8">
      <div className="page-container">
        {/* ── Page Header ──────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-black-900 tracking-tight">
            Our Shoe Collection
          </h1>
          <p className="text-black-500 mt-2">
            Explore styles designed for comfort, priced for value.
          </p>
        </div>

        {/* ── Search & Filter Controls ────────────────── */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black-400" />
            <Input
              id="search-products"
              type="text"
              placeholder="Search by product name or brand..."
              className="pl-10 h-11 bg-white border-black-200 focus:border-orange-500 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-black-400 hover:text-black-900"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {/* Mobile Filter Trigger */}
            <Button
              variant="outline"
              className="lg:hidden h-11 rounded-xl bg-white border-black-200 text-black-700 flex gap-2 items-center px-4"
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <Badge className="bg-orange-500 text-black-950 font-bold ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {/* Sort Dropdown */}
            <div className="relative flex-shrink-0">
              <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black-400 pointer-events-none" />
              <select
                id="sort-products"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 h-11 bg-white border border-black-200 text-sm font-medium text-black-700 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* ── Sidebar Filters (Desktop) ───────────────── */}
          <aside className="hidden lg:block bg-white border border-black-100 rounded-2xl p-6 space-y-6 shadow-sm sticky top-24">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-black-100">
              <h2 className="font-semibold text-black-900 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-orange-600" />
                <span>Filters</span>
              </h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Gender Filter */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-black-400 uppercase tracking-wider">
                Gender
              </h3>
              <div className="flex flex-col gap-1.5">
                {[
                  { value: "all", label: "All Collections" },
                  { value: "men", label: "Men" },
                  { value: "women", label: "Women" },
                  { value: "unisex", label: "Unisex" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setGenderFilter(item.value)}
                    className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                      genderFilter === item.value
                        ? "bg-orange-500/10 text-orange-700 font-semibold"
                        : "text-black-600 hover:bg-black-50 hover:text-black-950"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-black-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3 w-3" />
                <span>Brand</span>
              </h3>
              <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
                <button
                  onClick={() => setBrandFilter("all")}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                    brandFilter === "all"
                      ? "bg-orange-500/10 text-orange-700 font-semibold"
                      : "text-black-600 hover:bg-black-50 hover:text-black-950"
                  }`}
                >
                  All Brands
                </button>
                {brandsList.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => setBrandFilter(brand.id)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                      brandFilter === brand.id
                        ? "bg-orange-500/10 text-orange-700 font-semibold"
                        : "text-black-600 hover:bg-black-50 hover:text-black-950"
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Mobile Filters Drawer/Dropdown ──────────── */}
          {showFiltersMobile && (
            <div className="lg:hidden bg-white border border-black-100 rounded-2xl p-6 space-y-6 shadow-md animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-black-100">
                <h2 className="font-semibold text-black-900">Filter Options</h2>
                <button
                  onClick={() => setShowFiltersMobile(false)}
                  className="p-1 rounded-lg text-black-400 hover:bg-black-50 hover:text-black-950"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-black-400 uppercase tracking-wider">
                  Gender
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "men", label: "Men" },
                    { value: "women", label: "Women" },
                    { value: "unisex", label: "Unisex" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setGenderFilter(item.value)}
                      className={`px-4 py-2 text-sm rounded-xl border transition-colors ${
                        genderFilter === item.value
                          ? "bg-orange-500 border-orange-500 text-black-950 font-bold"
                          : "border-black-200 text-black-600 hover:bg-black-50"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-black-400 uppercase tracking-wider">
                  Brands
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setBrandFilter("all")}
                    className={`px-4 py-2 text-sm rounded-xl border transition-colors ${
                      brandFilter === "all"
                        ? "bg-orange-500 border-orange-500 text-black-950 font-bold"
                        : "border-black-200 text-black-600 hover:bg-black-50"
                    }`}
                  >
                    All Brands
                  </button>
                  {brandsList.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => setBrandFilter(brand.id)}
                      className={`px-4 py-2 text-sm rounded-xl border transition-colors ${
                        brandFilter === brand.id
                          ? "bg-orange-500 border-orange-500 text-black-950 font-bold"
                          : "border-black-200 text-black-600 hover:bg-black-50"
                      }`}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-black-100">
                <Button
                  className="flex-1 bg-black-900 text-white"
                  onClick={() => setShowFiltersMobile(false)}
                >
                  Apply Filters
                </Button>
                {activeFilterCount > 0 && (
                  <Button variant="outline" className="flex-1" onClick={handleResetFilters}>
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ── Product Grid ────────────────────────────── */}
          <div className="lg:col-span-3">
            {processedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-black-100 rounded-2xl p-8 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black-50 text-black-400 mb-4">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-black-900">No Shoes Found</h3>
                <p className="text-sm text-black-500 mt-1 max-w-sm">
                  We couldn&apos;t find any products matching your filters. Try checking spelling or resetting tags.
                </p>
                <Button className="mt-6 bg-orange-500 text-black-900 hover:bg-orange-400 font-semibold" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Result count */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-black-500 font-medium">
                    Showing {processedProducts.length} {processedProducts.length === 1 ? "product" : "products"}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {processedProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
