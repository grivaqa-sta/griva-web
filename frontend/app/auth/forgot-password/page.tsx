"use client";
import { authService } from "@/app/services/auth.service";
import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await authService.forgotPassword(email.trim());

      if (response.success) {
        setStatus("success");
        setMessage(response.message ?? "Password reset link sent to your email.");
      } else {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    } catch (err: unknown) {
      setStatus("error");
      const errorMessage =
        err instanceof Error ? err.message : "Unable to send reset link. Please try again.";
      setMessage(errorMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-[#EFF3F8] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm w-full max-w-md px-10 py-12">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-orange-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[1.75rem] font-black font-bold text-[#1a1a2e] text-center  mb-2">
          Forgot your password?
        </h1>
        <p className="text-sm text-gray-400 text-center mb-8">
          Enter your email and we'll send you a reset link.
        </p>

        {/* Success state */}
        {status === "success" ? (
          <div className="text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center mx-auto">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <p className="text-[#1a1a2e] font-semibold text-base">Check your inbox</p>
              <p className="text-sm text-gray-400 mt-1">{message}</p>
            </div>
            <button
              onClick={() => {
                setStatus("idle");
                setEmail("");
                setMessage("");
              }}
              className="text-orange-500 text-sm font-semibold hover:text-orange-600 transition-colors"
            >
              Send again
            </button>
          </div>
        ) : (
          <>
            {/* Email input */}
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") {
                    setStatus("idle");
                    setMessage("");
                  }
                }}
                onKeyDown={handleKeyDown}
                disabled={status === "loading"}
                className={`w-full px-4 py-4 rounded-xl border text-sm text-[#1a1a2e] placeholder-gray-300 outline-none transition-all
                  ${
                    status === "error"
                      ? "border-red-400 focus:border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-orange-400 bg-white"
                  }
                  disabled:opacity-60 disabled:cursor-not-allowed`}
              />
              {status === "error" && message && (
                <p className="text-red-500 text-xs mt-2 pl-1">{message}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={status === "loading"}
              className="w-full py-4 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-sm tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </>
        )}

        {/* Back to sign in */}
        <div className="mt-8 text-center">
          <a
            href="/auth/login"
            className="text-orange-500 text-sm font-semibold hover:text-orange-600 transition-colors"
          >
            ← Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}