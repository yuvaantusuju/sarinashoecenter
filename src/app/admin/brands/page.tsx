/**
 * AdminBrandsPage — Management panel for the shoe brand registry.
 * Enables adding new brands and deleting existing ones with immediate state updates.
 */

"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Brand {
  id: string;
  name: string;
  logoUrl: string | null;
}

export default function AdminBrandsPage() {
  const [brandsList, setBrandsList] = useState<Brand[]>([]);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch brands
  const fetchBrands = async () => {
    try {
      const res = await fetch("/api/admin/brands");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBrandsList(data.brands || []);
    } catch (err) {
      setError("Failed to load brands.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Handle Create Brand
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), logoUrl: logoUrl.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create brand");
      }

      // Prepend brand to list
      setBrandsList((prev) => [data.brand, ...prev]);
      // Reset inputs
      setName("");
      setLogoUrl("");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Brand
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand? Products associated with this brand may lose details.")) return;

    setError("");

    try {
      const res = await fetch(`/api/admin/brands/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete brand");
      }

      // Filter out brand from list
      setBrandsList((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete brand.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-black-900 tracking-tight flex items-center gap-3">
          <Tag className="h-8 w-8 text-black-950" />
          <span>Brand Registry</span>
        </h1>
        <p className="text-black-500 mt-1">
          Manage shoe brands available in the storefront filters.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold animate-fade-in">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Create Brand Card */}
        <div className="bg-white border border-black-100 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-black-900">Add Brand</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="orange-name" className="text-xs font-semibold text-black-700">
                Brand Name
              </label>
              <Input
                id="orange-name"
                placeholder="e.g. Nike"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="orange-logo" className="text-xs font-semibold text-black-700">
                Logo URL (Optional)
              </label>
              <Input
                id="orange-logo"
                placeholder="e.g. https://...logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
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
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Brand
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Brands List Table */}
        <div className="lg:col-span-2 bg-white border border-black-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-black-100">
            <h2 className="text-lg font-bold text-black-900">Registered Brands</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-black-300" />
            </div>
          ) : brandsList.length === 0 ? (
            <div className="p-8 text-center text-black-400">No brands registered. Add one using the form.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-black-50/50 text-black-400 border-b border-black-100">
                    <th className="px-6 py-3 font-semibold text-xs uppercase">Brand Name</th>
                    <th className="px-6 py-3 font-semibold text-xs uppercase">ID</th>
                    <th className="px-6 py-3 font-semibold text-xs uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black-50">
                  {brandsList.map((brand) => (
                    <tr key={brand.id} className="hover:bg-black-50/20">
                      <td className="px-6 py-4 font-bold text-black-950 flex items-center gap-3">
                        {brand.logoUrl && (
                          <img
                            src={brand.logoUrl}
                            alt={`${brand.name} logo`}
                            className="h-6 w-6 object-contain rounded"
                          />
                        )}
                        <span>{brand.name}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-black-400">
                        {brand.id}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(brand.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete brand"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
