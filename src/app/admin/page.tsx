/**
 * AdminDashboard — Overview metrics for the shoe store administration.
 * Displays total revenue, orders tracking, and recent activity log.
 */

import React from "react";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { orders, products } from "@/db/schema";
import { formatPrice } from "@/lib/utils";
import {
  TrendingUp,
  ClipboardList,
  Clock,
  ShoppingBag,
  ArrowRight,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";


export const revalidate = 0;

export default async function AdminDashboardPage() {
  let orderList: any[] = [];
  let productCount = 0;

  try {
    const { env } = await getCloudflareContext({ async: true });
    if (env?.DB) {
      const db = getDb(env.DB);
      orderList = await db.select().from(orders);
      const prodList = await db.select().from(products);
      productCount = prodList.length;
    } else {
      // Dev fallbacks if D1 isn't bound yet
      orderList = [
        {
          id: "ord-demo1",
          customerName: "Rahul Sharma",
          customerPhone: "9876543210",
          deliveryAddress: "Apartment 4B, Sector 15, Noida, UP",
          cartItemsSummary: "1x Classic Runner Pro (Black, Size 42)",
          totalPrice: 249900,
          status: "pending_payment",
          createdAt: Math.floor(Date.now() / 1000) - 3600,
        },
        {
          id: "ord-demo2",
          customerName: "Priya Patel",
          customerPhone: "9988776655",
          deliveryAddress: "Flat 102, Shanti Kunj, Bandra, Mumbai",
          cartItemsSummary: "1x Elegant Heel Pump (Red, Size 36) | 1x Comfort Glide Sandals (Tan, Size 37)",
          totalPrice: 389800,
          status: "paid",
          createdAt: Math.floor(Date.now() / 1000) - 86400,
        },
      ];
      productCount = 8;
    }
  } catch (error) {
    console.error("Dashboard DB fetch error:", error);
  }

  // Calculate Stats
  const totalRevenue = orderList
    .filter((o) => o.status !== "pending_payment")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const pendingPaymentCount = orderList.filter((o) => o.status === "pending_payment").length;
  const processingCount = orderList.filter((o) => o.status === "paid").length;
  const completedCount = orderList.filter((o) => o.status === "shipped").length;

  const recentOrders = orderList.slice(0, 5);

  const statCards = [
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      description: "From paid and shipped orders",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Total Orders",
      value: orderList.length.toString(),
      description: "All time placed orders",
      icon: ClipboardList,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Pending Payment",
      value: pendingPaymentCount.toString(),
      description: "Requires payment confirmation",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      title: "Active Products",
      value: productCount.toString(),
      description: "Items in catalog",
      icon: ShoppingBag,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-black-900 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-black-500 mt-1">
          Store performance metrics and administrative tools.
        </p>
      </div>

      {/* ── Stats Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 bg-white border border-black-100 rounded-2xl shadow-sm flex items-start justify-between`}
            >
              <div className="space-y-2">
                <p className="text-sm font-semibold text-black-400">{card.title}</p>
                <h3 className="text-2xl font-black text-black-900">{card.value}</h3>
                <p className="text-xs text-black-500 leading-none">{card.description}</p>
              </div>
              <div className={`p-3 rounded-xl border ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Recent Activity Section ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (Table) */}
        <div className="lg:col-span-2 bg-white border border-black-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-black-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-black-900">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              Manage Orders
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-black-400">No orders placed yet.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-black-50/50 text-black-400 border-b border-black-100">
                    <th className="px-6 py-3 font-semibold text-xs uppercase">Customer</th>
                    <th className="px-6 py-3 font-semibold text-xs uppercase">Items Summary</th>
                    <th className="px-6 py-3 font-semibold text-xs uppercase">Total</th>
                    <th className="px-6 py-3 font-semibold text-xs uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-black-50/20">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-black-950">{order.customerName}</div>
                        <div className="text-[11px] text-black-400 mt-0.5">{order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-black-600">
                        {order.cartItemsSummary}
                      </td>
                      <td className="px-6 py-4 font-bold text-black-950">
                        {formatPrice(order.totalPrice)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            order.status === "shipped"
                              ? "default"
                              : order.status === "paid"
                                ? "secondary"
                                : "outline"
                          }
                          className={
                            order.status === "shipped"
                              ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                              : order.status === "paid"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-50"
                          }
                        >
                          {order.status === "shipped"
                            ? "Shipped"
                            : order.status === "paid"
                              ? "Paid"
                              : "Unpaid"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Administration shortcuts card */}
        <div className="bg-white border border-black-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-black-900">Admin Actions</h2>
            <p className="text-sm text-black-400 leading-relaxed">
              Use these shortcuts to manage the inventory catalog, handle new shoes brand acquisitions, and view pending sales.
            </p>
            <div className="space-y-2 pt-2">
              <Link href="/admin/products" className="flex items-center justify-between p-3.5 bg-black-50 rounded-xl hover:bg-orange-500/10 text-black-700 hover:text-orange-700 font-semibold text-sm transition-colors group">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Manage Footwear Catalog
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link href="/admin/brands" className="flex items-center justify-between p-3.5 bg-black-50 rounded-xl hover:bg-orange-500/10 text-black-700 hover:text-orange-700 font-semibold text-sm transition-colors group">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Manage Brands Registry
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-black-100 text-center text-xs text-black-400">
            Authenticated as Admin
          </div>
        </div>
      </div>
    </div>
  );
}
