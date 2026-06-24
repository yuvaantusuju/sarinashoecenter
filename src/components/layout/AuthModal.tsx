/**
 * AuthModal — Premium login/register modal triggered from the header.
 * Features a tabbed interface with smooth transitions and rich styling.
 */

"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, Phone, KeyRound, User, Loader2, Footprints, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type Tab = "login" | "register";

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState(""); // email or phone number
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Reset on open/close
  useEffect(() => {
    if (authModalOpen) {
      setError("");
      setLoading(false);
      setShowPassword(false);
    }
  }, [authModalOpen]);

  // Reset error on tab switch
  useEffect(() => {
    setError("");
    setShowPassword(false);
  }, [activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");

    const result = await login(loginIdentifier, loginPassword);

    if (!result.success) {
      setError(result.error || "Login failed.");
    } else {
      // Clear form
      setLoginIdentifier("");
      setLoginPassword("");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");

    const result = await register(regName, regEmail, regPhone, regPassword);

    if (!result.success) {
      setError(result.error || "Registration failed.");
    } else {
      // Clear form
      setRegName("");
      setRegEmail("");
      setRegPhone("");
      setRegPassword("");
    }
    setLoading(false);
  };

  if (!authModalOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setAuthModalOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-black-100 overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-black-400 hover:bg-black-100 hover:text-black-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header with logo */}
          <div className="pt-8 pb-4 px-8 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black-950 text-orange-500 shadow-lg">
                <Footprints className="h-6 w-6" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-black-900">
              {activeTab === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-black-400 mt-1">
              {activeTab === "login"
                ? "Sign in to your Sarina account"
                : "Join Sarina Shoe Center today"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mx-8 bg-black-50 rounded-xl p-1 mb-6">
            {(["login", "register"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200",
                  activeTab === tab
                    ? "bg-white text-black-900 shadow-sm"
                    : "text-black-400 hover:text-black-600"
                )}
              >
                {tab === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-8 mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium animate-fade-in">
              {error}
            </div>
          )}

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="px-8 pb-8 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="auth-login-identifier" className="text-xs font-semibold text-black-700">
                  Email or Phone Number (+977)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black-400" />
                  <Input
                    id="auth-login-identifier"
                    type="text"
                    placeholder="Enter email or phone number"
                    className="pl-10 h-11 bg-black-50/50 border-black-200 focus:border-orange-500"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="auth-login-password" className="text-xs font-semibold text-black-700">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black-400" />
                  <Input
                    id="auth-login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 bg-black-50/50 border-black-200 focus:border-orange-500"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black-400 hover:text-black-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full bg-black-950 text-white hover:bg-black-900 font-semibold shadow-md py-6 rounded-xl mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <p className="text-center text-xs text-black-400 pt-2">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className="text-orange-600 font-semibold hover:text-orange-700"
                >
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="px-8 pb-8 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="auth-reg-name" className="text-xs font-semibold text-black-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black-400" />
                  <Input
                    id="auth-reg-name"
                    type="text"
                    placeholder="Enter your name"
                    className="pl-10 h-11 bg-black-50/50 border-black-200 focus:border-orange-500"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="auth-reg-email" className="text-xs font-semibold text-black-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black-400" />
                  <Input
                    id="auth-reg-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-11 bg-black-50/50 border-black-200 focus:border-orange-500"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="auth-reg-phone" className="text-xs font-semibold text-black-700">
                  Phone Number (Nepal +977 only)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black-400" />
                  <Input
                    id="auth-reg-phone"
                    type="tel"
                    placeholder="e.g. 98xxxxxxxx or +97798xxxxxxxx"
                    className="pl-10 h-11 bg-black-50/50 border-black-200 focus:border-orange-500"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                  />
                </div>
                <p className="text-[10px] text-black-400">Must start with +977 or be a 10-digit number starting with 9</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="auth-reg-password" className="text-xs font-semibold text-black-700">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black-400" />
                  <Input
                    id="auth-reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    className="pl-10 pr-10 h-11 bg-black-50/50 border-black-200 focus:border-orange-500"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black-400 hover:text-black-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full bg-orange-500 text-black-900 hover:bg-orange-400 font-semibold shadow-md shadow-orange-500/25 py-6 rounded-xl mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <p className="text-center text-xs text-black-400 pt-2">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-orange-600 font-semibold hover:text-orange-700"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
