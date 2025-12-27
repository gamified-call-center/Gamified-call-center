"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import apiClient from "@/Utils/apiClient";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { TextInput } from "@/commonComponents/form/TextInput";
import Button from "@/commonComponents/Button";
import { Field } from "@/commonComponents/form/Field";

const COLORS = {
  primary: "hsl(220, 80%, 55%)",
  secondary: "hsl(280, 70%, 60%)",
  accent: "hsl(350, 85%, 60%)",
  neutral: "hsl(215, 25%, 27%)",
  success: "hsl(142, 76%, 36%)",
  error: "hsl(0, 84%, 60%)",
  warning: "hsl(38, 92%, 50%)",
};

type ViewMode = "login" | "forgot";

interface ValidationError {
  field?: string;
  message: string;
}

export default function PremiumLogin({
  resetSuccess,
}: {
  resetSuccess?: boolean;
}) {
  const [view, setView] = useState<ViewMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [info, setInfo] = useState<string | null>(null);

  const router = useRouter();
  const { status } = useSession();

  const gradientStyle = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
    }),
    []
  );

  const validateLoginForm = useCallback((): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    if (!identifier.trim()) {
      validationErrors.push({
        field: "identifier",
        message: "Email or phone is required",
      });
    } else if (!/\S+@\S+\.\S+/.test(identifier) && !/^\d{10}$/.test(identifier.replace(/\D/g, ""))) {
      validationErrors.push({
        field: "identifier",
        message: "Please enter a valid email or 10-digit phone number",
      });
    }

    // if (!password) {
    //   validationErrors.push({ field: "password", message: "Password is required" });
    // } else if (password.length < 6) {
    //   validationErrors.push({
    //     field: "password",
    //     message: "Password must be at least 6 characters",
    //   });
    // }

    return validationErrors;
  }, [identifier, password]);

  const validateForgotForm = useCallback((): ValidationError[] => {
    if (!identifier.trim()) {
      return [{ field: "identifier", message: "Email is required to reset password" }];
    }

    if (!/\S+@\S+\.\S+/.test(identifier)) {
      return [{ field: "identifier", message: "Please enter a valid email address" }];
    }

    return [];
  }, [identifier]);

  // Effects
  useEffect(() => {
    if (resetSuccess) {
      setInfo("Password updated successfully. Please log in.");
      // Clear message after 5 seconds
      const timer = setTimeout(() => setInfo(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [resetSuccess]);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/aca/dashboard");
    }
  }, [status, router]);

  // Clear specific field error
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => prev.filter((error) => error.field !== fieldName));
  }, []);

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const validationErrors = validateLoginForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);
    setInfo(null);

    try {
      const res = await signIn("credentials", {
        identifier: identifier.trim(),
        password,
        redirect: false,
      });

      if (!res?.ok) {
        setErrors([
          {
            message:
              res?.error === "CredentialsSignin"
                ? "Invalid credentials. Please check your email/phone and password."
                : res?.error || "Login failed. Please try again.",
          },
        ]);
        return;
      }

      // Success - redirect to dashboard
      router.push("/aca/dashboard");
    } catch (err: any) {
      setErrors([
        {
          message:
            err?.message ||
            "An unexpected error occurred. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotLoading) return;

    const validationErrors = validateForgotForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setForgotLoading(true);
    setErrors([]);
    setInfo(null);

    try {
      await apiClient.post(
        `${apiClient.URLS.forgotPassword}/forgot-password`,
        {
          email: identifier.trim(),
        }
      );

      setInfo("Check your email for a verification link to reset your password.");
      
      // Clear success message after 8 seconds
      setTimeout(() => setInfo(null), 8000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to send reset link. Please try again.";
      
      setErrors([{ message }]);
    } finally {
      setForgotLoading(false);
    }
  };

  // Get error for specific field
  const getFieldError = useCallback(
    (fieldName: string) => {
      return errors.find((error) => error.field === fieldName)?.message;
    },
    [errors]
  );

  // Animations
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Decorative Background Elements */}
        <div className="absolute -top-6 -left-6 sm:-top-10 sm:-left-10 w-24 h-24 sm:w-40 sm:h-40 opacity-15">
          <motion.div
            className="absolute top-0 left-0 w-12 h-12 sm:w-20 sm:h-20 rounded-full"
            style={{
              background: `radial-gradient(circle, ${COLORS.primary}, transparent 70%)`,
            }}
          />
        </div>
        <div className="absolute -bottom-6 -right-6 sm:-bottom-10 sm:-right-10 w-24 h-24 sm:w-40 sm:h-40 opacity-15">
          <motion.div
            className="absolute bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 rounded-full"
            style={{
              background: `radial-gradient(circle, ${COLORS.secondary}, transparent 70%)`,
            }}
          />
        </div>

        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden border border-white/40">
          <div
            className="relative h-40 sm:h-48 p-6 sm:p-8 text-white"
            style={gradientStyle}
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
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                    Think Insurance First
                  </h1>
                  <p className="text-white/90 text-sm sm:text-base font-medium mt-1">
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
                  <h2 className="text-lg sm:text-xl font-bold">
                    {view === "login" ? "Welcome Back!" : "Reset Password"}
                  </h2>
                </motion.div>

                {view === "forgot" && (
                  <button
                    type="button"
                    onClick={() => {
                      setView("login");
                      setErrors([]);
                      setInfo(null);
                    }}
                    className="text-white/90 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors p-2 rounded-lg hover:bg-white/10"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </button>
                )}
              </div>

              <p className="mt-1 text-sm sm:text-base text-white/90">
                {view === "login"
                  ? "Sign in to access your dashboard"
                  : "Enter your email to receive a reset link"}
              </p>
            </motion.div>
          </div>

          {/* Form Body */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-6 sm:p-8"
          >
            {/* Global Messages */}
            <AnimatePresence>
              {errors.length > 0 && errors[0]?.field === undefined && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      {errors.map((error, index) => (
                        <p key={index} className="mb-1 last:mb-0">
                          {error.message}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {info && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p>{info}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email/Phone Field */}
            <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
              <Field
                label={view === "login" ? "Email or Phone" : "Email Address"}
                labelClassName="text-sm font-medium mb-2"
                required
                error={getFieldError("identifier")}
              >
                <TextInput
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    clearFieldError("identifier");
                  }}
                  placeholder={
                    view === "login"
                      ? "Enter email or phone number"
                      : "Enter your registered email"
                  }
                  required
                  type={view === "forgot" ? "email" : "text"}
                  leftIcon={
                    <Mail
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      style={{ color: COLORS.primary }}
                    />
                  }
                  containerClassName={`bg-gray-50/70 border ${
                    getFieldError("identifier")
                      ? "border-red-300 focus-within:border-red-500"
                      : "border-gray-200 focus-within:border-blue-500"
                  } rounded-lg sm:rounded-xl px-3 py-2 sm:py-3 transition-colors`}
                  inputClassName="bg-transparent placeholder-gray-500"
                />
              </Field>
            </motion.div>

            {view === "login" ? (
              <motion.form onSubmit={handleSubmit} variants={containerVariants}>
                {/* Password Field */}
                <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
                  <Field
                    label="Password"
                    labelClassName="text-sm font-medium mb-2"
                    required
                    error={getFieldError("password")}
                  >
                    <TextInput
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearFieldError("password");
                      }}
                      placeholder="Enter your password"
                      required
                      leftIcon={
                        <Lock
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          style={{ color: COLORS.primary }}
                        />
                      }
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="p-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          style={{ color: COLORS.primary }}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      }
                      containerClassName={`bg-gray-50/70 border ${
                        getFieldError("password")
                          ? "border-red-300 focus-within:border-red-500"
                          : "border-gray-200 focus-within:border-blue-500"
                      } rounded-lg sm:rounded-xl px-3 py-2 sm:py-3 transition-colors`}
                      inputClassName="bg-transparent placeholder-gray-500 pr-10"
                    />
                  </Field>
                </motion.div>

                {/* Remember & Forgot */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4"
                >
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          rememberMe
                            ? "border-transparent"
                            : "border-gray-300 group-hover:border-gray-400"
                        }`}
                        style={{
                          backgroundColor: rememberMe ? COLORS.primary : "transparent",
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
                      className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors"
                    >
                      Remember me
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot");
                      setErrors([]);
                      setInfo(null);
                    }}
                    className="text-sm font-medium flex items-center gap-1 group text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Forgot password?
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl font-bold text-white flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed"
                    style={gradientStyle}
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
                  </Button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.form onSubmit={handleForgotSubmit} variants={containerVariants}>
                <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Enter your email address and we will send you a link to reset your password.
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl font-bold text-white flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed"
                    style={gradientStyle}
                  >
                    {forgotLoading ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Reset Link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </motion.div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-4 sm:py-6 border-t border-gray-100 bg-gray-50/50">
            <p className="text-center text-xs sm:text-sm text-gray-500">
              © 2025 Think Insurance First. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}