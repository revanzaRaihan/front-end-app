"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type UserType = {
  name: string;
  email: string;
  avatar?: string | null;
};

type StatType = {
  title: string;
  value: string | number;
};

type ProductType = {
  name: string;
  price: number;
  stock: number;
  image?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const validateUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          router.replace("/login");
        } else {
          const result = await res.json();
          setUser({
            name: result.data.name,
            email: result.data.email,
            avatar: result.data.avatar,
          });
        }
      } catch {
        localStorage.removeItem("token");
        router.replace("/login");
      } finally {
        setIsChecking(false);
        setTimeout(() => setFadeIn(true), 100); // trigger fade-in
      }
    };

    validateUser();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const stats: StatType[] = [
    { title: "Total Products", value: 42 },
    { title: "Total Orders", value: 128 },
    { title: "Total Users", value: 56 },
    { title: "Revenue", value: "$12,345" },
  ];

  const products: ProductType[] = [
    { name: "Laptop", price: 15000000, stock: 10, image: "/images/laptop.jpg" },
    { name: "Monitor", price: 2500000, stock: 5, image: "/images/monitor.jpg" },
    { name: "Keyboard", price: 500000, stock: 20, image: "/images/keyboard.jpg" },
    { name: "Mouse", price: 250000, stock: 0, image: "/images/mouse.jpg" },
  ];

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset className="w-full p-6">
        <SiteHeader />

        <div
          className={`relative w-full flex flex-col gap-8 transition-opacity duration-700 ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Soft blur background */}
          <div className="absolute top-10 left-1/4 w-56 h-56 bg-green-200/30 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-10 right-1/4 w-40 h-40 bg-green-300/20 rounded-full blur-2xl -z-10"></div>

          {/* Hero / Welcome Banner */}
          <div className="bg-green-50 rounded-lg p-8 flex flex-col md:flex-row items-center justify-between shadow-lg">
            <div>
              <h1 className="text-3xl font-bold text-green-700 mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-green-600 text-lg">
                Check out the latest products and updates.
              </p>
            </div>
            <img
              src="/images/hero-banner.png"
              alt="Ecommerce Hero"
              className="w-48 mt-4 md:mt-0"
            />
          </div>

          {/* Stats Highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow p-6 hover:shadow-xl transition flex flex-col justify-between cursor-pointer"
              >
                <span className="text-sm text-gray-500">{s.title}</span>
                <span className="text-2xl font-bold text-green-700">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow hover:shadow-xl transition flex flex-col overflow-hidden"
              >
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4 flex flex-col flex-1">
                  <h2 className="text-lg font-semibold mb-2">{p.name}</h2>
                  <p className="text-green-700 font-bold text-xl mb-2">
                    Rp {p.price.toLocaleString()}
                  </p>
                  <p
                    className={`mb-4 font-medium ${
                      p.stock === 0
                        ? "text-red-600"
                        : p.stock < 10
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {p.stock === 0 ? "Out of Stock" : `${p.stock} in stock`}
                  </p>
                  <button
                    disabled={p.stock === 0}
                    className={`mt-auto py-2 px-4 rounded-lg text-white font-semibold ${
                      p.stock === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    } transition`}
                  >
                    {p.stock === 0 ? "Unavailable" : "View Product"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
