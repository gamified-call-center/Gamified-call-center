"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import apiClient from "@/Utils/apiClient";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/user";
import { useEffect } from "react";

const COLORS = {
  primary: "hsl(220, 80%, 55%)",
  secondary: "hsl(280, 70%, 60%)",
  accent: "hsl(350, 85%, 60%)",
  neutral: "hsl(215, 25%, 27%)",
};

type ViewMode = "login" | "forgot";

export default function PremiumLogin({ resetSuccess }: { resetSuccess?: boolean }) {
  const [view, setView] = useState<ViewMode>("login");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const router = useRouter();
  const login = useAuthStore.getState().login;



  useEffect(() => {
    if (resetSuccess) {
      setInfo("Password updated successfully. Please log in.");
    }
  }, [resetSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setInfo(null);

    try {
      const response = await apiClient.post(apiClient.URLS.login, {
        email,
        password,
      });

      const token = response.body?.message;
      const user = response.body?.data;

      if (!token || !user) throw new Error("Invalid login response");

      login(token, user);
      router.push("/aca/dashboard");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Invalid email or password";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotLoading) return;

    setForgotLoading(true);
    setError(null);
    setInfo(null);

    try {
      const res = await apiClient.post(
        `${apiClient.URLS.forgotPassword}/forgot-password`,
        { email }
      );

      setInfo(
        "Check your email for a verification link to reset your password."
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to send reset link. Please try again.";
      setError(message);
    } finally {
      setForgotLoading(false);
    }
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Decorative */}
        <div className="absolute -top-6 -left-6 sm:-top-10 sm:-left-10 w-24 h-24 sm:w-40 sm:h-40 opacity-20">
          <motion.div
            animate={floatingAnimation}
            className="absolute top-0 left-0 w-12 h-12 sm:w-20 sm:h-20 rounded-full"
            style={{
              background: `radial-gradient(circle, ${COLORS.primary}, transparent 70%)`,
            }}
          />
        </div>
        <div className="absolute -bottom-6 -right-6 sm:-bottom-10 sm:-right-10 w-24 h-24 sm:w-40 sm:h-40 opacity-20">
          <motion.div
            animate={{
              ...floatingAnimation,
              transition: { ...floatingAnimation.transition, delay: 1 },
            }}
            className="absolute bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 rounded-full"
            style={{
              background: `radial-gradient(circle, ${COLORS.secondary}, transparent 70%)`,
            }}
          />
        </div>

        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden border border-white/40">
          {/* Header */}
          <div
            className="relative h-40 sm:h-48 p-6 sm:p-8 text-white"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
            }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute -top-12 -right-12 sm:-top-20 sm:-right-20 w-32 h-32 sm:w-40 sm:h-40 rounded-full opacity-20"
                style={{ backgroundColor: COLORS.accent }}
              />
              <div
                className="absolute top-1/2 left-1/4 w-20 h-20 sm:w-32 sm:h-32 rounded-full opacity-20"
                style={{ backgroundColor: COLORS.accent }}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl  font-Gordita-Bold tracking-tight">
                    Think Insurance First
                  </h1>
                  <p className="text-white/90 text-sm sm:text-base  font-Gordita-Medium mt-1">
                    Trusted Tools for Trusted Advisors
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2 text-white"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  <h2 className="text-lg sm:text-xl  font-Gordita-Bold">
                    {view === "login" ? "Welcome Back!" : "Forgot Password"}
                  </h2>
                </motion.div>

                {view === "forgot" && (
                  <button
                    type="button"
                    onClick={() => {
                      setView("login");
                      setError(null);
                      setInfo(null);
                    }}
                    className="text-white/90 hover:text-white flex items-center gap-1 text-sm  font-Gordita-Medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
              </div>

              <p className="mt-1 text-sm sm:text-base">
                {view === "login"
                  ? "Sign in to continue"
                  : "We’ll email you a reset link"}
              </p>
            </motion.div>
          </div>

          {/* Body */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-6 sm:p-8"
          >
            {/* Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}
            {info && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"
              >
                {info}
              </motion.div>
            )}

            {/* Shared Email Field */}
            <div className="mb-4 sm:mb-6">
              <label
                className="block text-sm  font-Gordita-Medium mb-2"
                style={{ color: COLORS.neutral }}
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Mail
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    style={{ color: COLORS.primary }}
                  />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 bg-gray-50/70 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-sm sm:text-base"
                  style={
                    {
                      color: COLORS.neutral,
                      "--tw-ring-color": COLORS.primary,
                    } as React.CSSProperties
                  }
                  required
                />
              </div>
            </div>

            {/* Login view */}
            {view === "login" ? (
              <motion.form onSubmit={handleSubmit}>
                {/* Password Field */}
                <div className="mb-4 sm:mb-6">
                  <label
                    className="block text-sm  font-Gordita-Medium mb-2"
                    style={{ color: COLORS.neutral }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Lock
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        style={{ color: COLORS.primary }}
                      />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3 sm:py-4 bg-gray-50/70 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-sm sm:text-base"
                      style={
                        {
                          color: COLORS.neutral,
                          "--tw-ring-color": COLORS.primary,
                        } as React.CSSProperties
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      style={{ color: COLORS.primary }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${rememberMe ? "border-transparent" : "border-gray-300"
                          }`}
                        style={{
                          backgroundColor: rememberMe
                            ? COLORS.primary
                            : "transparent",
                        }}
                      >
                        {rememberMe && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span
                      className="ml-3 text-sm"
                      style={{ color: COLORS.neutral }}
                    >
                      Remember me
                    </span>
                  </label>

                  {/* Toggle to forgot view */}
                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot");
                      setError(null);
                      setInfo(null);
                    }}
                    className="text-sm  font-Gordita-Medium flex items-center gap-1"
                    style={{ color: COLORS.primary }}
                  >
                    Forgot password?{" "}
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>

                {/* Sign In */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl  font-Gordita-Bold text-white flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                    opacity: isLoading ? 0.8 : 1,
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              // Forgot view
              <motion.form onSubmit={handleForgotSubmit}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl  font-Gordita-Bold text-white flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                    opacity: forgotLoading ? 0.8 : 1,
                  }}
                >
                  {forgotLoading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending…</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </motion.div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-4 sm:py-6 border-t border-gray-100">
            <p className="text-center text-xs sm:text-sm text-gray-500">
              © 2025 Think Insurance First. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
