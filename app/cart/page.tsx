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
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

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

  // dialog states
  const [accessDialog, setAccessDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; id?: number }>({ open: false });
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

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
    try {
      await apiFetch(`/cart/${id}`, { method: "DELETE" });
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      setErrorDialog({ open: true, message: "Gagal menghapus item keranjang." });
    }
  };

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  );

  useEffect(() => {
    if (!user) return;

    if (user.role === "viewer") {
      fetchCart();
    } else {
      setAccessDialog(true);
    }
  }, [user]);

  if (!user) return null;

  if (user.role !== "viewer") {
    return (
      <Dialog open={accessDialog} onOpenChange={setAccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Akses Ditolak</DialogTitle>
            <DialogDescription>Anda tidak memiliki akses ke halaman ini.</DialogDescription>
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <SiteHeaderHome cartCount={cartItems.length} />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <h1 className="text-3xl font-bold mb-6">Keranjang Belanja</h1>

          {/* Spinner loading */}
          {loading && (
            <div className="fixed inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50">
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading cart...</p>
            </div>
          )}

          {/* Error text */}
          {error && !loading && <p className="text-center text-red-500 mt-20">{error}</p>}

          {/* Konten utama */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tabel Produk */}
              <div className="md:col-span-2">
                <div className="shadow-sm border bg-white h-[500px] flex flex-col">
                  {cartItems.length === 0 ? (
                    <div className="flex items-center justify-center flex-1 text-gray-500">
                      Keranjang kosong
                    </div>
                  ) : (
                    <div className="overflow-y-auto flex-1">
                      <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                          <tr>
                            <th className="w-12 p-3 text-center">No</th>
                            <th className="w-2/5 p-3 text-left">Produk</th>
                            <th className="w-32 p-3 text-center">Jumlah</th>
                            <th className="w-32 p-3 text-right">Harga</th>
                            <th className="w-16 p-3 text-center"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartItems.map((item, index) => (
                            <tr key={item.id} className="border-t">
                              <td className="p-3 text-center">{index + 1}</td>
                              <td className="p-3 flex items-center gap-3">
                                <img
                                  src={item.product.image || "https://via.placeholder.com/60"}
                                  alt={item.product.name}
                                  className="w-14 h-14 object-cover border"
                                />
                                <span className="font-medium truncate max-w-[200px]">
                                  {item.product.name}
                                </span>
                              </td>
                              <td className="p-3 text-center">{item.quantity}</td>
                              <td className="p-3 text-right font-semibold">
                                {formatPrice(item.product.price * item.quantity)}
                              </td>
                              <td className="p-3 text-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setConfirmDialog({ open: true, id: item.id })}
                                >
                                  <Trash2 className="w-5 h-5 text-red-500" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white border shadow-sm p-6 flex flex-col h-[300px] w-full md:w-[320px]">
                <h2 className="text-xl font-bold mb-2">Summary</h2>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between text-sm py-2">
                  <span>Total Produk</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="flex justify-between text-sm py-2">
                  <span>Ongkir</span>
                  <span>Gratis</span>
                </div>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between text-lg font-bold py-2">
                  <span>Total</span>
                  <span className="text-green-700">{formatPrice(totalPrice)}</span>
                </div>
                <Button
                  size="lg"
                  className="mt-auto bg-green-600 hover:bg-green-700 text-white w-full"
                  onClick={() => router.push("/checkout")}
                >
                  Checkout
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Dialog Konfirmasi Hapus */}
        <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi</DialogTitle>
              <DialogDescription>Yakin ingin menghapus item ini dari keranjang?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setConfirmDialog({ open: false })}>
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirmDialog.id) removeItem(confirmDialog.id);
                  setConfirmDialog({ open: false });
                }}
              >
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Error */}
        <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog((prev) => ({ ...prev, open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
              <DialogDescription>{errorDialog.message}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setErrorDialog({ open: false, message: "" })}>Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
