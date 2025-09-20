"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaGoogle, FaGithub, FaEye, FaEyeSlash } from "react-icons/fa";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isLogin ? "http://127.0.0.1:8000/api/auth/login" : "http://127.0.0.1:8000/api/auth/register";

      const body = isLogin ? { email, password } : { name, email, password, password_confirmation: passwordConfirmation };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      // ✅ Ambil token secara aman
      // ✅ Ambil token secara aman
      const token = data.data?.access_token ?? data.data?.token?.access_token;
      if (!token) {
        setError("Login/Register gagal: token tidak tersedia");
        return;
      }

      // Simpan token
      localStorage.setItem("token", token);

      // Ambil role user
      const role = data.data?.user?.role;

      // Redirect sesuai role
      if (role === "viewer") {
        router.push("/home");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05 },
    }),
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-white px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="flex w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Side */}
        <div className="hidden md:flex w-1/2 flex-col justify-center items-center bg-gradient-to-br from-green-200 to-green-100 p-10 relative">
          <div className="absolute top-6 left-6 text-xl font-bold text-green-700">udoo!!</div>
          <h1 className="text-4xl font-bold text-green-800 mb-4">{isLogin ? "Hello, welcome!" : "Join us!"}</h1>
          <p className="text-green-700 text-center">
            {isLogin ? "Manage your products easily and quickly 🚀 Everything you need, right at your fingertips." : "Create your account and manage your products easily 🚀 Everything you need, right at your fingertips."}
          </p>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 -z-10 rounded-2xl"></div>

          {/* Toggle buttons */}
          <div className="flex justify-center gap-4 mb-6 relative z-10">
            <button onClick={() => setIsLogin(true)} className={`px-4 py-2 rounded-lg font-semibold ${isLogin ? "bg-green-600 text-white" : "bg-white text-green-600 border"}`}>
              Login
            </button>
            <button onClick={() => setIsLogin(false)} className={`px-4 py-2 rounded-lg font-semibold ${!isLogin ? "bg-green-600 text-white" : "bg-white text-green-600 border"}`}>
              Register
            </button>
          </div>

          {/* Animated Form Container */}
          <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }} className="relative z-10">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form key="login" onSubmit={handleSubmit} initial="hidden" animate="visible" exit="exit" variants={formVariants} transition={{ duration: 0.3 }} className="flex flex-col gap-4" autoComplete="off">
                  {[email, password].map((_, i) => (
                    <motion.div key={i} custom={i} variants={inputVariants}>
                      {i === 0 ? (
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                        />
                      ) : (
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form key="register" onSubmit={handleSubmit} initial="hidden" animate="visible" exit="exit" variants={formVariants} transition={{ duration: 0.3 }} className="flex flex-col gap-4" autoComplete="off">
                  {[name, email, password, passwordConfirmation].map((_, i) => (
                    <motion.div key={i} custom={i} variants={inputVariants}>
                      {i === 0 && (
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                        />
                      )}
                      {i === 1 && (
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                        />
                      )}
                      {i === 2 && (
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      )}
                      {i === 3 && (
                        <div className="relative">
                          <input
                            type={showPasswordConfirm ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus
:ring-2 focus:ring-green-400 transition"
                          />
                          <button type="button" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                            {showPasswordConfirm ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? "Registering..." : "Register"}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="flex items-center gap-2 my-6">
              <div className="flex-grow h-px bg-gray-300"></div>
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>

            {/* Social Login */}
            <div className="flex gap-4">
              <motion.button whileHover={{ y: -2 }} className="flex items-center justify-center gap-2 w-1/2 border py-3 rounded-lg hover:bg-red-50 transition">
                <FaGoogle className="text-red-500" /> Google
              </motion.button>
              <motion.button whileHover={{ y: -2 }} className="flex items-center justify-center gap-2 w-1/2 border py-3 rounded-lg hover:bg-gray-50 transition">
                <FaGithub className="text-gray-700" /> GitHub
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
