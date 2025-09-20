"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { apiFetch } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type UserType = {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  role: "admin" | "seller" | "viewer";
};

type ProductType = {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
  user?: { id: number; name: string; role: string };
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ✅ Validasi user
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.replace("/login");

      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (!res.ok) throw new Error("Unauthorized");

        const result = await res.json();
        const fetchedUser: UserType = result.data;

        if (fetchedUser.role === "viewer") {
          setUser(fetchedUser);
          setShowDialog(true);
        } else {
          setUser(fetchedUser);
        }
      } catch {
        localStorage.removeItem("token");
        router.replace("/login");
      } finally {
        setIsChecking(false);
        setTimeout(() => setFadeIn(true), 100);
      }
    };

    fetchUser();
  }, [router]);

  // ✅ Fetch products sesuai role
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user || user.role === "viewer") return;
      setLoadingProducts(true);

      try {
        const url = user.role === "seller" ? "/seller/products" : "/products";
        const res = await apiFetch<{ status: boolean; message: string; data: ProductType[] }>(
          url,
          { method: "GET" }
        );
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [user]);

  // ✅ Hitung ringkasan
  const stats = useMemo(() => {
    const total = products.length;
    const habis = products.filter((p) => p.stock === 0).length;
    const hampirHabis = products.filter((p) => p.stock > 0 && p.stock < 10).length;
    const totalStok = products.reduce((sum, p) => sum + p.stock, 0);

    return { total, habis, hampirHabis, totalStok };
  }, [products]);

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // 🚫 Dialog untuk viewer
  if (user.role === "viewer") {
    return (
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Akses Ditolak</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Halaman ini khusus Seller/Admin. Anda masuk sebagai <b>Viewer</b>.
          </p>
          <DialogFooter className="flex gap-2 mt-4">
            <Button variant="secondary" onClick={() => router.push("/home")}>
              Ke Home
            </Button>
            <Button variant="destructive" onClick={() => router.push("/login")}>
              Ke Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // ✅ Halaman dashboard untuk admin & seller
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset className="w-full p-6">
        <div
          className={`relative w-full flex flex-col gap-8 transition-opacity duration-700 ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* User Info */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-gray-600">
                Role: <span className="font-medium">{user.role}</span>
              </p>
              <p className="text-gray-600">Email: {user.email}</p>
            </div>
            {user.avatar && (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover mt-4 md:mt-0"
              />
            )}
          </div>

          {/* Statistik Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500">Total Produk</p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500">Stok Habis</p>
              <h3 className="text-2xl font-bold text-red-600">{stats.habis}</h3>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500">Hampir Habis (&lt;10)</p>
              <h3 className="text-2xl font-bold text-yellow-600">
                {stats.hampirHabis}
              </h3>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-500">Total Stok</p>
              <h3 className="text-2xl font-bold text-green-600">{stats.totalStok}</h3>
            </div>
          </div>

          {/* Produk terbaru */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">Produk Terbaru</h3>
              <button
                onClick={() => router.push("/products")}
                className="text-green-600 hover:underline text-sm"
              >
                Lihat Semua
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-green-50">
                <tr>
                  <th className="p-3 border-b">#</th>
                  <th className="p-3 border-b">Nama Produk</th>
                  <th className="p-3 border-b">Harga</th>
                  <th className="p-3 border-b">Stok</th>
                  {user.role !== "seller" && (
                    <th className="p-3 border-b">Seller</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loadingProducts ? (
                  <tr>
                    <td
                      colSpan={user.role === "seller" ? 4 : 5}
                      className="p-3 text-center"
                    >
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={user.role === "seller" ? 4 : 5}
                      className="p-3 text-center"
                    >
                      No products available
                    </td>
                  </tr>
                ) : (
                  [...products].slice(0, 5).map((p, idx) => (
                    <tr key={p.id} className="hover:bg-green-50 transition">
                      <td className="p-3 border-b">{idx + 1}</td>
                      <td className="p-3 border-b">{p.name}</td>
                      <td className="p-3 border-b">
                        Rp {p.price.toLocaleString()}
                      </td>
                      <td
                        className={`p-3 border-b font-medium ${
                          p.stock === 0
                            ? "text-red-600"
                            : p.stock < 10
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {p.stock}
                      </td>
                      {user.role !== "seller" && (
                        <td className="p-3 border-b">
                          {p.user?.name || "-"}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
