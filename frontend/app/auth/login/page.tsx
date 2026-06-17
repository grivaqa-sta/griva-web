"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import { authService } from "@/app/services/auth.service";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ← added
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // ← reset error at start (like AdminLoginPage)
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      if (response && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        login({ name: response.user?.name || email.split("@")[0], email });

        if (response.user?.role === "customer" ) {
          router.push("/account");
        } else if(response.user?.role === "admin") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setError("admin can not use these credentials");
        }
      } else {
        setError("Invalid credentials");
      }
    } catch {
      // ← removed unused `err` variable (like AdminLoginPage)
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold">
            Sign in
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="rounded-md  space-y-4">
            {/* Email — unchanged */}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password — added show/hide toggle */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"} // ← dynamic type
                autoComplete="current-password"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-3 pr-11 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Eye toggle button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading} // ← disabled during load (like AdminLoginPage)
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-md shadow-orange-500/10 transition-colors"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          {/* Bottom row — Forgot Password + Create Account */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => router.push("/auth/forgot-password")} // ← added
              className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
            <Link
              href="/auth/register-account"
              className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
              Create New Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}