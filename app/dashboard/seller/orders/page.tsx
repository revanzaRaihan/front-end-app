"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import ProtectedRoute from "@/components/protectedRoute";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// 🔹 Helper format harga
const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

// 🔹 Helper format tanggal
const formatTanggal = (dateString: string) =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long", // Senin, Selasa, ...
    day: "2-digit",
    month: "long", // Januari, Februari, ...
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));

// 🔹 Tipe data produk
type Product = {
  id: number;
  name: string;
  price: number;
};

// 🔹 Tipe data order sesuai OrderResource
type Order = {
  id: number;
  buyer: string;
  seller: string;
  product: Product;
  quantity: number;
  total: number;
  status: string;
  created_at: string;
};

export default function SellerOrdersPage() {
  const { user } = useAuthUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 🔹 Fetch orders seller
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ status: boolean; data: Order[] }>("/seller/orders", { method: "GET" });
      if (res.status) {
        setOrders(res.data);
      } else {
        setError("Gagal memuat pesanan.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat memuat pesanan.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Tandai order selesai
  const markAsCompleted = async (orderId: number) => {
    try {
      const res = await apiFetch<{ status: boolean; message: string }>(
        `/seller/orders/${orderId}/complete`,
        { method: "POST" }
      );
      if (res.status) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "completed" } : o)));
      } else {
        alert("Gagal menyelesaikan pesanan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat update pesanan.");
    }
  };

  useEffect(() => {
    if (user?.role === "seller") {
      fetchOrders();
    }
  }, [user]);

  if (!user) return null;

  // 🔹 Full page spinner saat loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  // 🔹 Pisahkan order
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const completedOrders = orders.filter((o) => o.status === "completed");

  return (
    <ProtectedRoute>
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
          <h1 className="text-3xl font-bold mb-6">Pesanan Masuk</h1>

          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 🔹 Kiri: Pending Orders */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-yellow-700">🕒 Pesanan Baru</h2>
                <div className="bg-white rounded-lg shadow p-4 max-h-[600px] overflow-y-auto">
                  {pendingOrders.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">Tidak ada pesanan baru.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {pendingOrders.map((order) => (
                        <div key={order.id} className="bg-gray-50 rounded-lg border p-4 flex flex-col justify-between">
                          <div className="mb-3">
                            <p className="font-semibold text-gray-700">
                              Pembeli: <span className="text-blue-600">{order.buyer}</span>
                            </p>
                            <p className="text-xs text-gray-400">
                              Dibuat: {formatTanggal(order.created_at)}
                            </p>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600 flex-1">
                            <p>
                              Produk: <span className="font-medium">{order.product?.name}</span>
                            </p>
                            <p>Jumlah: {order.quantity}</p>
                            <p>Harga Satuan: {formatRupiah(order.product?.price)}</p>
                            <p className="font-bold text-green-600 text-lg mt-2">{formatRupiah(order.total)}</p>
                          </div>

                          <div className="mt-4 flex flex-col gap-2">
                            <p className="text-sm text-center px-3 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700">
                              {order.status}
                            </p>
                            <Button size="sm" variant="default" onClick={() => markAsCompleted(order.id)}>
                              Tandai Selesai
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                                  Detail
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Detail Pesanan #{order.id}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2 text-sm text-gray-700">
                                  <p><strong>Pembeli:</strong> {order.buyer}</p>
                                  <p><strong>Penjual:</strong> {order.seller}</p>
                                  <p><strong>Produk:</strong> {order.product?.name}</p>
                                  <p><strong>Jumlah:</strong> {order.quantity}</p>
                                  <p><strong>Harga Satuan:</strong> {formatRupiah(order.product?.price)}</p>
                                  <p><strong>Total:</strong> {formatRupiah(order.total)}</p>
                                  <p><strong>Status:</strong> {order.status}</p>
                                  <p><strong>Dibuat:</strong> {formatTanggal(order.created_at)}</p>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 🔹 Kanan: Completed Orders */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-green-700">✅ Pesanan Selesai</h2>
                <div className="bg-white rounded-lg shadow p-4 max-h-[600px] overflow-y-auto">
                  {completedOrders.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">Belum ada pesanan selesai.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {completedOrders.map((order) => (
                        <div key={order.id} className="bg-gray-50 rounded-lg border p-4 flex flex-col justify-between">
                          <div className="mb-3">
                            <p className="font-semibold text-gray-700">
                              Pembeli: <span className="text-blue-600">{order.buyer}</span>
                            </p>
                            <p className="text-xs text-gray-400">
                              Dibuat: {formatTanggal(order.created_at)}
                            </p>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600 flex-1">
                            <p>
                              Produk: <span className="font-medium">{order.product?.name}</span>
                            </p>
                            <p>Jumlah: {order.quantity}</p>
                            <p>Harga Satuan: {formatRupiah(order.product?.price)}</p>
                            <p className="font-bold text-green-600 text-lg mt-2">{formatRupiah(order.total)}</p>
                          </div>

                          <div className="mt-4 flex flex-col gap-2">
                            <p className="text-sm text-center px-3 py-1 rounded-full font-medium bg-green-100 text-green-700">
                              {order.status}
                            </p>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                                  Detail
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Detail Pesanan #{order.id}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2 text-sm text-gray-700">
                                  <p><strong>Pembeli:</strong> {order.buyer}</p>
                                  <p><strong>Penjual:</strong> {order.seller}</p>
                                  <p><strong>Produk:</strong> {order.product?.name}</p>
                                  <p><strong>Jumlah:</strong> {order.quantity}</p>
                                  <p><strong>Harga Satuan:</strong> {formatRupiah(order.product?.price)}</p>
                                  <p><strong>Total:</strong> {formatRupiah(order.total)}</p>
                                  <p><strong>Status:</strong> {order.status}</p>
                                  <p><strong>Dibuat:</strong> {formatTanggal(order.created_at)}</p>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
