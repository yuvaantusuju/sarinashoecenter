/**
 * AdminLogin — Secure login form for the administrative area.
 * Validates credentials via /api/auth/login and sets cookie.
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Footprints, KeyRound, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Authentication failed.");
        setLoading(false);
        return;
      }

      // Successful login
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white border border-black-100 rounded-2xl shadow-xl space-y-6">
      {/* ── Logo & Title ──────────────────────────────── */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black-950 text-orange-500">
          <Footprints className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-black-900">Admin Portal</h1>
        <p className="text-sm text-black-400">
          Sign in to manage Sarina Shoe Center
        </p>
      </div>

      {/* ── Error Banner ──────────────────────────────── */}
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium animate-fade-in">
          {error}
        </div>
      )}

      {/* ── Login Form ────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-xs font-semibold text-black-700">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black-400" />
            <Input
              id="login-email"
              type="email"
              placeholder="admin@sarinashoes.com"
              className="pl-10 h-11 bg-black-50/50 border-black-200 focus:border-orange-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="login-password" className="text-xs font-semibold text-black-700">
            Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black-400" />
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              className="pl-10 h-11 bg-black-50/50 border-black-200 focus:border-orange-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full bg-black-950 text-white hover:bg-black-900 font-semibold shadow-md py-6 rounded-xl mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
              Verifying...
            </>
          ) : (
            "Access Dashboard"
          )}
        </Button>
      </form>
    </div>
  );
}
