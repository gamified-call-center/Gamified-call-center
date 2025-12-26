"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronRight,
  Key,
  Mail,
} from "lucide-react";
import apiClient from "@/Utils/apiClient";

const COLORS = {
  primary: "hsl(220, 80%, 55%)",
  secondary: "hsl(280, 70%, 60%)",
  accent: "hsl(350, 85%, 60%)",
  neutral: "hsl(215, 25%, 27%)",
};

export default function ValidateResetTokenClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setValidating(false);
        setIsValid(false);
        setErrorMsg("Invalid reset link. No token provided.");
        return;
      }

      setValidating(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      try {
        const qs = new URLSearchParams({ token }).toString();
        const url = `${apiClient.URLS.forgotPassword}/validate-reset-token?${qs}`;
        const res = await apiClient.get(url);

        const body = res.body ?? res;
        const valid = body?.valid ?? body?.data?.valid;

        if (valid === true) {
          setIsValid(true);
        } else {
          setIsValid(false);
          setErrorMsg("Link expired (15-minute limit reached). Please request a new link.");
        }
      } catch {
        setIsValid(false);
        setErrorMsg("Link expired or invalid. Please request a new reset link.");
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!newPassword.trim()) {
      setErrorMsg("Please enter a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
        const url = `${apiClient.URLS.forgotPassword}/reset-password`;
      await apiClient.post(url, { token, newPassword });
      
      setSuccessMsg("Password updated successfully! Redirecting to login...");
      
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Decorative Background Elements */}
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

        {/* Main Card */}
        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden border border-white/40">
          {/* Header Section with Gradient */}
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
                    Reset Password
                  </h1>
                  <p className="text-white/90 text-sm sm:text-base  font-Gordita-Medium mt-1">
                    Think Insurance First
                  </p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 text-white"
              >
                <Key className="w-4 h-4 sm:w-5 sm:h-5" />
                <h2 className="text-lg sm:text-xl  font-Gordita-Bold">
                  {validating 
                    ? "Validating Link..." 
                    : isValid 
                      ? "Set New Password" 
                      : "Link Expired"
                  }
                </h2>
              </motion.div>
              
              <p className="mt-1 text-sm sm:text-base text-white/90">
                {validating 
                  ? "Please wait while we verify your reset link"
                  : isValid 
                    ? "Enter your new password below"
                    : "This password reset link has expired"
                }
              </p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Error Message */}
            {errorMsg && !validating && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm  font-Gordita-Medium text-red-700">{errorMsg}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm  font-Gordita-Medium text-emerald-700">{successMsg}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {validating ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600" style={{ color: COLORS.neutral }}>
                  Validating reset link...
                </p>
              </div>
            ) : isValid === false ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl  font-Gordita-Bold text-gray-800 mb-2">
                  Link Expired
                </h3>
                <p className="text-gray-600 mb-6">
                  This password reset link has expired. Please request a new link from the login page.
                </p>
                <button
                  onClick={() => router.push("/login")}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl  font-Gordita-Medium hover:shadow-lg transition-all"
                >
                  Return to Login
                </button>
              </motion.div>
            ) : isValid === true ? (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleReset}
              >
                {/* New Password Field */}
                <div className="mb-4 sm:mb-6">
                  <label
                    className="block text-sm  font-Gordita-Medium mb-2"
                    style={{ color: COLORS.neutral }}
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Lock
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        style={{ color: COLORS.primary }}
                      />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3 sm:py-4 bg-gray-50/70 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-sm sm:text-base"
                      style={
                        {
                          color: COLORS.neutral,
                          "--tw-ring-color": COLORS.primary,
                        } as React.CSSProperties
                      }
                      placeholder="Enter new password"
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      style={{ color: COLORS.primary }}
                      disabled={submitting}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Must be at least 8 characters long
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div className="mb-6 sm:mb-8">
                  <label
                    className="block text-sm  font-Gordita-Medium mb-2"
                    style={{ color: COLORS.neutral }}
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Lock
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        style={{ color: COLORS.primary }}
                      />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3 sm:py-4 bg-gray-50/70 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-sm sm:text-base"
                      style={
                        {
                          color: COLORS.neutral,
                          "--tw-ring-color": COLORS.primary,
                        } as React.CSSProperties
                      }
                      placeholder="Confirm new password"
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      style={{ color: COLORS.primary }}
                      disabled={submitting}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Reset Password Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl  font-Gordita-Bold text-white flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                    opacity: submitting ? 0.8 : 1,
                  }}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : null}
          </div>

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