/**
 * AdminOrdersPage — Order management dashboard for the administrator.
 * Facilitates tracking payments, shipping lifecycle, and contacting customers via WhatsApp.
 */

"use client";

import React, { useEffect, useState } from "react";
import { ClipboardList, Loader2, CheckCircle2, Truck, ExternalLink, Calendar, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  cartItemsSummary: string;
  totalPrice: number;
  status: "pending_payment" | "paid" | "shipped";
  createdAt: number;
}

export default function AdminOrdersPage() {
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrdersList(data.orders || []);
    } catch (err) {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    setError("");

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      // Update state locally
      setOrdersList((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus as any } : o))
      );
    } catch (err: any) {
      setError(err.message || "Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders by active tab
  const filteredOrders = React.useMemo(() => {
    if (activeTab === "all") return ordersList;
    return ordersList.filter((o) => o.status === activeTab);
  }, [ordersList, activeTab]);

  // Format date helper
  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp * 1000);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-black-900 tracking-tight flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-black-950" />
          <span>Customer Orders</span>
        </h1>
        <p className="text-black-500 mt-1">
          Review checkout request entries, verify payments, and handle shipments.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold animate-fade-in">
          {error}
        </div>
      )}

      {/* ── Status Tab Filter ──────────────────────────── */}
      <div className="flex border-b border-black-100 max-w-lg">
        {[
          { id: "all", label: "All Orders" },
          { id: "pending_payment", label: "Unpaid" },
          { id: "paid", label: "Paid / Process" },
          { id: "shipped", label: "Shipped" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all capitalize text-center ${
              activeTab === tab.id
                ? "border-orange-500 text-orange-600 font-bold"
                : "border-transparent text-black-400 hover:text-black-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Orders Display ─────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-black-300" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-black-100 rounded-2xl p-12 text-center text-black-400 shadow-sm">
          No orders found in this category.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const customerWaUrl = `https://wa.me/${order.customerPhone.replace(/\+/g, "")}`;
            
            return (
              <div
                key={order.id}
                className="bg-white border border-black-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-4 gap-6 items-start"
              >
                {/* Info Column */}
                <div className="space-y-3 lg:col-span-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-black-400">{order.id}</span>
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
                          : "Pending Payment"}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-black-950 text-lg leading-tight">
                      {order.customerName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-black-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1.5">
                    <p className="text-xs font-bold text-black-400 uppercase tracking-wider">
                      Delivery Address
                    </p>
                    <p className="text-sm text-black-600 leading-relaxed">
                      {order.deliveryAddress}
                    </p>
                  </div>
                </div>

                {/* Summary Column */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-black-400 uppercase tracking-wider">
                      Items Ordered
                    </p>
                    <div className="text-sm text-black-600 font-semibold space-y-1">
                      {order.cartItemsSummary.split(" | ").map((line, idx) => (
                        <div key={idx} className="line-clamp-2">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-black-50">
                    <p className="text-xs font-medium text-black-400">Total Price</p>
                    <p className="text-xl font-black text-black-950 mt-0.5">
                      {formatPrice(order.totalPrice)}
                    </p>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="flex flex-col gap-2 w-full">
                  <p className="text-xs font-bold text-black-400 uppercase tracking-wider mb-1">
                    Quick Actions
                  </p>

                  {/* Status update buttons */}
                  {order.status === "pending_payment" && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 rounded-xl"
                      disabled={updatingId === order.id}
                      onClick={() => handleUpdateStatus(order.id, "paid")}
                    >
                      {updatingId === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      <span>Confirm Payment</span>
                    </Button>
                  )}

                  {order.status === "paid" && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 rounded-xl"
                      disabled={updatingId === order.id}
                      onClick={() => handleUpdateStatus(order.id, "shipped")}
                    >
                      {updatingId === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <Truck className="h-4 w-4" />
                      )}
                      <span>Ship Order</span>
                    </Button>
                  )}

                  {/* WhatsApp Quick Link */}
                  <a
                    href={customerWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-colors font-semibold text-xs rounded-xl"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>WhatsApp Chat</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
