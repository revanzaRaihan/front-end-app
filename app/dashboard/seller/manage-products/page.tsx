"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { apiFetch } from "@/lib/api";
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
};

export default function ManageProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ✅ Cek user
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.replace("/login");

      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Unauthorized");
        const result = await res.json();

        if (result.data.role === "admin") {
          return router.replace("/dashboard");
        }

        setUser(result.data);
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

  // ✅ Fetch produk milik seller
  const fetchProducts = async () => {
    if (!user) return;
    setLoadingProducts(true);
    try {
      const res = await apiFetch<{ status: boolean; message: string; data: ProductType[] }>(
        "/seller/products",
        { method: "GET" }
      );
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  // ✅ Hapus produk
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      await apiFetch(`/seller/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

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
          className={`relative w-full transition-opacity duration-700 ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-green-50">
                <tr>
                  <th className="p-3 border-b">#</th>
                  <th className="p-3 border-b">Nama Produk</th>
                  <th className="p-3 border-b">Harga</th>
                  <th className="p-3 border-b">Stok</th>
                  <th className="p-3 border-b">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loadingProducts ? (
                  <tr>
                    <td colSpan={5} className="p-3 text-center">
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-3 text-center">
                      Belum ada produk
                    </td>
                  </tr>
                ) : (
                  products.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-green-50 transition">
                      <td className="p-3 border-b">{idx + 1}</td>
                      <td className="p-3 border-b">{p.name}</td>
                      <td className="p-3 border-b">Rp {p.price.toLocaleString()}</td>
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
                      <td className="p-3 border-b space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/products/edit/${p.id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(p.id)}
                        >
                          Hapus
                        </Button>
                      </td>
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
