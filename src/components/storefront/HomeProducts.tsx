/**
 * HomeProducts — Client component that fetches and displays featured products on the homepage.
 * Falls back to demo data if the API isn't available.
 */

"use client";

import React, { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import { Loader2 } from "lucide-react";

interface ProductData {
  id: string;
  name: string;
  brandName: string;
  price: number;
  colors: string;
  imageUrls: string;
  gender: string;
}

// Demo products shown when DB is not available
const DEMO_PRODUCTS: ProductData[] = [
  {
    id: "demo-1",
    name: "Classic Runner Pro",
    brandName: "SportFlex",
    price: 249900,
    colors: JSON.stringify(["Black", "White", "Navy Blue"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"]),
    gender: "men",
  },
  {
    id: "demo-2",
    name: "Urban Street Walker",
    brandName: "CityStep",
    price: 179900,
    colors: JSON.stringify(["Brown", "Black"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop"]),
    gender: "unisex",
  },
  {
    id: "demo-3",
    name: "Comfort Glide Sandals",
    brandName: "EasyWear",
    price: 89900,
    colors: JSON.stringify(["Tan", "Black", "Brown"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&h=600&fit=crop"]),
    gender: "women",
  },
  {
    id: "demo-4",
    name: "Elite Performance Trainer",
    brandName: "SportFlex",
    price: 349900,
    colors: JSON.stringify(["Red", "Black", "White"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop"]),
    gender: "men",
  },
  {
    id: "demo-5",
    name: "Canvas Sneaker Classic",
    brandName: "UrbanSole",
    price: 149900,
    colors: JSON.stringify(["White", "Navy", "Grey"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop"]),
    gender: "unisex",
  },
  {
    id: "demo-6",
    name: "Elegant Heel Pump",
    brandName: "GraceStep",
    price: 299900,
    colors: JSON.stringify(["Black", "Red", "Beige"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=600&fit=crop"]),
    gender: "women",
  },
  {
    id: "demo-7",
    name: "Leather Oxford Classic",
    brandName: "CityStep",
    price: 399900,
    colors: JSON.stringify(["Brown", "Black"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&h=600&fit=crop"]),
    gender: "men",
  },
  {
    id: "demo-8",
    name: "Sporty Running Lite",
    brandName: "SportFlex",
    price: 199900,
    colors: JSON.stringify(["Blue", "Pink", "Green"]),
    imageUrls: JSON.stringify(["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop"]),
    gender: "women",
  },
];

export function HomeProducts() {
  const [products, setProducts] = useState<ProductData[]>(DEMO_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch real products from the API
    fetch("/api/admin/products")
      .then((res) => {
        if (!res.ok) throw new Error("API not available");
        return res.json();
      })
      .then((data) => {
        if (data.products && data.products.length > 0) {
          // Map to include brandName
          const mapped = data.products.slice(0, 8).map((p: any) => ({
            id: p.id,
            name: p.name,
            brandName: p.brandName || "Brand",
            price: p.price,
            colors: p.colors,
            imageUrls: p.imageUrls || p.image_urls,
            gender: p.gender,
          }));
          setProducts(mapped);
        }
      })
      .catch(() => {
        // Use demo data — already set as default
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-black-300" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
