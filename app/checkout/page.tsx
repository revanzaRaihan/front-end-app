"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import ProtectedRoute from "@/components/protectedRoute";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { SiteHeaderHome } from "@/components/site-header-home";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  MapPin,
  CreditCard,
  ShoppingCart,
  Loader2,
} from "lucide-react";

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

export default function CheckoutPage() {
  const { user } = useAuthUser();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // dialogs
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);

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

  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }, [cartItems]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const handleCheckout = async () => {
    setConfirmDialog(false);
    if (cartItems.length === 0) return;

    setSubmitting(true);
    try {
      // 🔹 kirim order ke backend
      const res = await apiFetch<{ status: boolean; message: string }>(
        "/checkout",
        {
          method: "POST",
          body: JSON.stringify({
            total_amount: totalPrice,
            items: cartItems.map((item) => ({
              product_id: item.product.id,
              quantity: item.quantity,
            })),
          }),
        }
      );

      if (!res.status) {
        throw new Error(res.message || "Checkout gagal");
      }

      // 🔹 kosongkan cart setelah sukses
      await apiFetch("/cart/clear", { method: "POST" });
      setCartItems([]);

      setSubmitting(false);
      setSuccessDialog(true);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role === "viewer") {
      fetchCart();
    } else {
      router.push("/dashboard");
    }
  }, [user]);

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <SiteHeaderHome cartCount={cartItems.length} />

        <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-green-600" /> Checkout
          </h1>

          {loading ? (
            <div className="text-center py-20">Memuat data keranjang...</div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : cartItems.length === 0 ? (
            <p className="text-gray-500">Keranjang kosong.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bagian kiri: Info pembeli */}
              <div className="md:col-span-2 bg-white border shadow-sm p-6 rounded-lg space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-green-700">
                  <User className="w-6 h-6" /> Informasi Pembeli
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b pb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <span>{user.name}</span>
                  </div>
                  <div className="flex items-center gap-3 border-b pb-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 border-b pb-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>Alamat default pengguna (dummy)</span>
                  </div>
                  <div className="flex items-center gap-3 border-b pb-2">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span>Metode pembayaran dipilih saat checkout</span>
                  </div>
                </div>
              </div>

              {/* Bagian kanan: Ringkasan belanja */}
              <div className="bg-white border shadow-sm p-6 rounded-lg flex flex-col h-[480px]">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-green-700" /> Ringkasan Pesanan
                </h2>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity} × {item.product.name}
                        </span>
                        <span className="font-medium">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-200 my-3"></div>
                <div className="flex justify-between text-sm">
                  <span>Ongkir</span>
                  <span>Gratis</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2">
                  <span>Total</span>
                  <span className="text-green-700">{formatPrice(totalPrice)}</span>
                </div>
                <Button
                  size="lg"
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white w-full"
                  onClick={() => setConfirmDialog(true)}
                >
                  Buat Pesanan
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Dialog Konfirmasi */}
        <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Checkout</DialogTitle>
              <DialogDescription>
                Apakah anda yakin ingin melanjutkan checkout dengan total{" "}
                <span className="font-semibold">{formatPrice(totalPrice)}</span>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setConfirmDialog(false)}>
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleCheckout}
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ya, Lanjutkan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Sukses */}
        <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Checkout Berhasil 🎉</DialogTitle>
              <DialogDescription>
                Produk anda sudah berhasil di-checkout.  
                Seller akan segera memproses pesanan anda.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => {
                  setSuccessDialog(false);
                  router.push("/cart");
                }}
              >
                Tutup
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
