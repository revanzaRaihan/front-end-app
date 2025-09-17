"use client";

import { useEffect, useState } from "react";
import { FaCog, FaShoppingCart, FaSignOutAlt, FaHeart, FaBoxOpen, FaBell, FaCreditCard } from "react-icons/fa";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ProtectedRoute from "@/components/protectedRoute";
import { useRouter } from "next/navigation";

type UserType = {
  name: string;
  email: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error();

        setUser({ name: data.data.name, email: data.data.email });
      } catch {
        setUser({ name: "Vivian Raihan", email: "user@gmail.com" });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm">Loading profile...</p>
        </div>
      </div>
    );

  if (!user) return null;

  const initial = user.name.charAt(0).toUpperCase();

  const options = [
    { name: "Settings", icon: <FaCog />, action: () => alert("Go to Settings") },
    { name: "Cart", icon: <FaShoppingCart />, action: () => alert("Go to Cart") },
    { name: "Orders", icon: <FaBoxOpen />, action: () => alert("Go to Orders") },
    { name: "Wishlist", icon: <FaHeart />, action: () => alert("Go to Wishlist") },
    { name: "Notifications", icon: <FaBell />, action: () => alert("Go to Notifications") },
    { name: "Payment", icon: <FaCreditCard />, action: () => alert("Go to Payment") },
    { name: "Logout", icon: <FaSignOutAlt />, action: () => {
      localStorage.removeItem("token");
      router.push("/login");
    }},
  ];

  return (
    <ProtectedRoute>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar
          variant="inset"
          user={{
            name: user.name,
            email: user.email,
            avatar: null,
          }}
        />
        <SidebarInset className="flex items-center justify-center p-4 bg-white min-h-[calc(100vh-48px)]">
          <div className="w-full max-w-md flex flex-col items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-3xl font-bold text-green-700">
              {initial}
            </div>

            {/* Name & Email */}
            <h1 className="text-2xl font-semibold text-gray-900 text-center">{user.name}</h1>
            <p className="text-gray-500 text-center text-sm">{user.email}</p>

            {/* Options Grid */}
            <div className="w-full grid grid-cols-3 gap-3 mt-6">
              {options.map((opt) => (
                <button
                  key={opt.name}
                  onClick={opt.action}
                  className="flex flex-col items-center justify-center gap-1 py-3 bg-white rounded-lg shadow-sm border border-green-50 hover:shadow-md hover:bg-green-50 transition text-sm"
                >
                  <div className="text-green-500 text-2xl">{opt.icon}</div>
                  <span className="text-gray-800">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
