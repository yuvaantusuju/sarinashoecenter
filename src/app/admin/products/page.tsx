/**
 * AdminProductsPage — Management interface for the shoe inventory catalog.
 * Supports adding products with color lists, image arrays, and size stock mapping,
 * as well as deleting products.
 */

"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Package, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface Brand {
  id: string;
  name: string;
}

export default function AdminProductsPage() {
  // Inventory Lists
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [brandsList, setBrandsList] = useState<Brand[]>([]);

  // Form Fields
  const [brandId, setBrandId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceRupees, setPriceRupees] = useState("");
  const [gender, setGender] = useState("unisex");
  const [colorsRaw, setColorsRaw] = useState(""); // e.g. "Black, White, Red"
  const [imageUrlsRaw, setImageUrlsRaw] = useState(""); // e.g. url1\nurl2
  const [sizeStockRaw, setSizeStockRaw] = useState(""); // e.g. "40:10, 41:5, 42:8"

  // UX states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load products and brands
  const fetchData = async () => {
    try {
      const [prodRes, brandRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/brands"),
      ]);

      if (!prodRes.ok || !brandRes.ok) throw new Error();

      const prodData = await prodRes.json();
      const brandData = await brandRes.json();

      setProductsList(prodData.products || []);
      setBrandsList(brandData.brands || []);

      if (brandData.brands?.length > 0) {
        setBrandId(brandData.brands[0].id);
      }
    } catch (err) {
      setError("Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helpers to format fields
  const parseColors = (raw: string): string[] => {
    return raw
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c !== "");
  };

  const parseImageUrls = (raw: string): string[] => {
    return raw
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url !== "");
  };

  const parseSizeStock = (raw: string): Record<string, number> => {
    const result: Record<string, number> = {};
    if (!raw.trim()) return result;

    raw.split(",").forEach((part) => {
      const [size, stock] = part.split(":");
      if (size && stock) {
        const parsedSize = size.trim();
        const parsedStock = parseInt(stock.trim());
        if (parsedSize && !isNaN(parsedStock)) {
          result[parsedSize] = parsedStock;
        }
      }
    });

    return result;
  };

  // Submit product creation
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!brandId) {
      setError("Please register and select a brand first.");
      return;
    }

    const price = Math.round(parseFloat(priceRupees) * 100); // rupees to paise
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    const colors = parseColors(colorsRaw);
    const imageUrls = parseImageUrls(imageUrlsRaw);
    const sizeStock = parseSizeStock(sizeStockRaw);

    if (colors.length === 0) {
      setError("Please specify at least one color.");
      return;
    }
    if (imageUrls.length === 0) {
      setError("Please specify at least one image URL.");
      return;
    }
    if (Object.keys(sizeStock).length === 0) {
      setError("Please specify sizes and stock quantities (e.g. 40:10, 41:5).");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          name: name.trim(),
          description: description.trim(),
          price,
          gender,
          colors,
          imageUrls,
          sizeStock,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      setProductsList((prev) => [data.product, ...prev]);
      setSuccess("Product created successfully!");

      // Clear fields
      setName("");
      setDescription("");
      setPriceRupees("");
      setColorsRaw("");
      setImageUrlsRaw("");
      setSizeStockRaw("");
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This action is irreversible.")) return;

    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete product");
      }

      setProductsList((prev) => prev.filter((p) => p.id !== id));
      setSuccess("Product deleted successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to delete product.");
    }
  };

  // Map brandName for table display
  const brandMap = React.useMemo(() => {
    const map = new Map<string, string>();
    brandsList.forEach((b) => map.set(b.id, b.name));
    return map;
  }, [brandsList]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-black-900 tracking-tight flex items-center gap-3">
          <Package className="h-8 w-8 text-black-950" />
          <span>Product Catalog</span>
        </h1>
        <p className="text-black-500 mt-1">
          Add new shoe models and manage stock counts.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold animate-fade-in">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold animate-fade-in">
          {success}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Create Product Card */}
        <div className="bg-white border border-black-100 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-black-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-600" />
            <span>Create Footwear Listing</span>
          </h2>

          <form onSubmit={handleCreateProduct} className="space-y-4">
            {/* Brand Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="prod-brand" className="text-xs font-semibold text-black-700">
                Brand
              </label>
              {brandsList.length === 0 ? (
                <div className="text-xs text-black-400">
                  No brands registered. Go register a brand first!
                </div>
              ) : (
                <select
                  id="prod-brand"
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-black-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {brandsList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="prod-name" className="text-xs font-semibold text-black-700">
                Shoe Name
              </label>
              <Input
                id="prod-name"
                placeholder="e.g. Air Force 1 '07"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="prod-description" className="text-xs font-semibold text-black-700">
                Description
              </label>
              <Textarea
                id="prod-description"
                placeholder="Marketing details and materials description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Price & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="prod-price" className="text-xs font-semibold text-black-700">
                  Price (INR Rupees)
                </label>
                <Input
                  id="prod-price"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1999"
                  value={priceRupees}
                  onChange={(e) => setPriceRupees(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="prod-gender" className="text-xs font-semibold text-black-700">
                  Gender Category
                </label>
                <select
                  id="prod-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-black-200 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-1.5">
              <label htmlFor="prod-colors" className="text-xs font-semibold text-black-700">
                Colors (Comma separated)
              </label>
              <Input
                id="prod-colors"
                placeholder="Black, White, Navy Blue"
                value={colorsRaw}
                onChange={(e) => setColorsRaw(e.target.value)}
                required
              />
            </div>

            {/* Image URLs */}
            <div className="space-y-1.5">
              <label htmlFor="prod-images" className="text-xs font-semibold text-black-700 flex justify-between">
                <span>Image URLs</span>
                <span className="text-[10px] text-black-400 font-normal">One per line, matches colors</span>
              </label>
              <Textarea
                id="prod-images"
                placeholder="https://...img-black.jpg&#10;https://...img-white.jpg"
                value={imageUrlsRaw}
                onChange={(e) => setImageUrlsRaw(e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Size Stock */}
            <div className="space-y-1.5">
              <label htmlFor="prod-stock" className="text-xs font-semibold text-black-700 flex justify-between">
                <span>Size Stock Mapping</span>
                <span className="text-[10px] text-black-400 font-normal">Format: size:qty, size:qty</span>
              </label>
              <Input
                id="prod-stock"
                placeholder="40:10, 41:5, 42:12, 43:3"
                value={sizeStockRaw}
                onChange={(e) => setSizeStockRaw(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-black-950 text-white hover:bg-black-900 font-semibold rounded-xl"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Save Product
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Products Table (Desktop) */}
        <div className="xl:col-span-2 bg-white border border-black-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-black-100">
            <h2 className="text-lg font-bold text-black-900">Inventory Items</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-black-300" />
            </div>
          ) : productsList.length === 0 ? (
            <div className="p-8 text-center text-black-400">No footwear cataloged yet. Use the form to add products.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-black-50/50 text-black-400 border-b border-black-100">
                    <th className="px-6 py-3 font-semibold text-xs uppercase">Product</th>
                    <th className="px-6 py-3 font-semibold text-xs uppercase">Brand</th>
                    <th className="px-6 py-3 font-semibold text-xs uppercase">Price</th>
                    <th className="px-6 py-3 font-semibold text-xs uppercase">Gender</th>
                    <th className="px-6 py-3 font-semibold text-xs uppercase">Stock</th>
                    <th className="px-6 py-3 font-semibold text-xs uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black-50">
                  {productsList.map((product) => {
                    const firstImage = safeJsonParse<string[]>(product.imageUrls, [])[0];
                    const stock = safeJsonParse<Record<string, number>>(product.sizeStock, {});
                    
                    return (
                      <tr key={product.id} className="hover:bg-black-50/20">
                        {/* Product Image + Name */}
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="h-10 w-10 rounded overflow-hidden bg-black-50 border flex-shrink-0">
                            {firstImage ? (
                              <img
                                src={firstImage}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-black-300">
                                <Package className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-black-950 line-clamp-1">{product.name}</div>
                            <div className="text-[10px] text-black-400 font-mono mt-0.5">{product.id}</div>
                          </div>
                        </td>

                        {/* Brand */}
                        <td className="px-6 py-4 text-black-600 font-medium">
                          {brandMap.get(product.brandId) || "Brand"}
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4 font-bold text-black-950">
                          {formatPrice(product.price)}
                        </td>

                        {/* Gender */}
                        <td className="px-6 py-4 capitalize text-black-600">
                          {product.gender}
                        </td>

                        {/* Stock Summarized */}
                        <td className="px-6 py-4 text-xs">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {Object.entries(stock).map(([sz, qty]) => (
                              <span
                                key={sz}
                                className={`px-1.5 py-0.5 rounded font-semibold text-[10px] border ${
                                  qty <= 0
                                    ? "bg-red-50 text-red-600 border-red-100"
                                    : qty <= 3
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                }`}
                              >
                                {sz}:{qty}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Delete action */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
