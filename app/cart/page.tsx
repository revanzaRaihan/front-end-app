"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import ProtectedRoute from "@/components/protectedRoute";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { SiteHeaderHome } from "@/components/site-header-home";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

type CartItem = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image?: string | null;
  };
};

export default function CartPage() {
  const { user } = useAuthUser();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ status: boolean; data: CartItem[] }>("/cart", {
        method: "GET",
      });

      if (res.status) setCartItems(res.data);
      else setError("Gagal memuat keranjang.");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat memuat keranjang.");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id: number) => {
    if (!confirm("Yakin ingin menghapus item ini?")) return;

    try {
      await apiFetch(`/cart/${id}`, { method: "DELETE" });
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus item keranjang.");
    }
  };

  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }, [cartItems]);

  useEffect(() => {
    if (!user) return;

    if (user.role === "viewer") {
      fetchCart();
    } else {
      setShowDialog(true);
    }
  }, [user]);

  if (!user) return null;

  // kalau role bukan viewer, tampilkan dialog akses ditolak
  if (user.role !== "viewer") {
    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Akses Ditolak</DialogTitle>
            <DialogDescription>
              Anda tidak memiliki akses ke halaman ini.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="secondary" onClick={() => router.push("/dashboard")}>
              Ke Dashboard
            </Button>
            <Button variant="destructive" onClick={() => router.push("/login")}>
              Ke Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <SiteHeaderHome cartCount={cartItems.length} />

        <main className="flex-1 p-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Keranjang Belanja</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center mt-20">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Loading cart...</p>
            </div>
          ) : error ? (
            <p className="text-center text-red-500 mt-20">{error}</p>
          ) : cartItems.length === 0 ? (
            <p className="text-center text-gray-500 mt-20">Keranjang kosong</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="w-full table-fixed bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="w-2/5 p-4 text-left">Produk</th>
                      <th className="w-1/6 p-4 text-left">Harga</th>
                      <th className="w-1/6 p-4 text-left">Jumlah</th>
                      <th className="w-1/6 p-4 text-left">Subtotal</th>
                      <th className="w-1/12 p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id} className="border-b last:border-b-0">
                        <td className="p-4 flex items-center gap-4">
                          <img
                            src={item.product.image || "https://via.placeholder.com/80"}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <span className="font-medium">{item.product.name}</span>
                        </td>
                        <td className="p-4">{formatPrice(item.product.price)}</td>
                        <td className="p-4">{item.quantity}</td>
                        <td className="p-4 font-bold">
                          {formatPrice(item.product.price * item.quantity)}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            Hapus
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-xl font-bold">
                  Total:{" "}
                  <span className="text-green-700">{formatPrice(totalPrice)}</span>
                </div>
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => alert("Checkout belum diimplementasikan")}
                >
                  Checkout
                </Button>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
