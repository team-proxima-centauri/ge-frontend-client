"use client";

import { useState, FormEvent } from "react";
import { Lock, Eye, EyeOff, Mail } from "lucide-react";
import { login } from "@/services/api";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login(email, password);
      if (response.success && response.data) {
        // Login successful, redirect to home page
        router.push("/");
      } else {
        setError(response.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex bg-gradient-to-br from-groceryease-bg to-accent-ivory">
      <div className="m-auto w-full max-w-md p-8">
        <div className="bg-groceryease-surface rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-groceryease-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-12 py-3 rounded-lg border border-groceryease-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-groceryease-border text-primary focus:ring-primary" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary-dark hover:text-primary transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="text-primary-dark hover:text-primary transition-colors font-semibold">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
