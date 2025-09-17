"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaGoogle, FaGithub, FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      localStorage.setItem("token", data.data.access_token);
      router.push("/dashboard");
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-white px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Left Side */}
        <div className="hidden md:flex w-1/2 flex-col justify-center items-center bg-gradient-to-br from-green-200 to-green-100 p-10 relative">
          <div className="absolute top-6 left-6 text-xl font-bold text-green-700">
            udoo!!
          </div>
          <h1 className="text-4xl font-bold text-green-800 mb-4">Hello, welcome!</h1>
          <p className="text-green-700 text-center">
            Manage your products easily and quickly 🚀  
            Everything you need, right at your fingertips.
          </p>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-green-300/40 rounded-full blur-2xl"></div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-10 relative">
          {/* Soft green gradient + blur circles */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 -z-10 rounded-2xl"></div>
          <div className="absolute top-10 left-1/4 w-32 h-32 bg-green-200/30 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-10 right-1/4 w-24 h-24 bg-green-300/20 rounded-full blur-2xl -z-10"></div>

          <h2 className="text-2xl font-semibold text-green-700 mb-6 text-center">
            Login to udoo!!
          </h2>

          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-4 relative z-10"
            autoComplete="off"
          >
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              name="email-login"
              autoComplete="off"
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />

            {/* Password Input with toggle */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password-login"
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center font-medium">{error}</p>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-2 my-6 relative z-10">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* Social Login */}
          <div className="flex gap-4 relative z-10">
            <motion.button
              whileHover={{ y: -2 }}
              className="flex items-center justify-center gap-2 w-1/2 border py-3 rounded-lg hover:bg-red-50 transition"
            >
              <FaGoogle className="text-red-500" /> Google
            </motion.button>
            <motion.button
              whileHover={{ y: -2 }}
              className="flex items-center justify-center gap-2 w-1/2 border py-3 rounded-lg hover:bg-gray-50 transition"
            >
              <FaGithub className="text-gray-700" /> GitHub
            </motion.button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6 relative z-10">
            Don’t have an account?{" "}
            <a href="/register" className="text-green-600 hover:underline">
              Register
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
