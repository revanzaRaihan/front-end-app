"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useAuthUser } from "@/hooks/useAuthUser";
import { SiteHeaderHome } from "@/components/site-header-home";
import ProtectedRoute from "@/components/protectedRoute";
import { FaInfoCircle, FaShoppingCart } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const { products, loading } = useProducts();
  const { user } = useAuthUser();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "lowStock" | "outOfStock">("all");
  const [cartCount, setCartCount] = useState(0);

  // 🔥 state untuk kontrol dialog akses
  const [showDialog, setShowDialog] = useState(false);

  // 🔔 state untuk notifikasi
  const [notif, setNotif] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // Cek role user
  useEffect(() => {
    if (!user) return;
    if (user.role !== "viewer") {
      setShowDialog(true);
    }
  }, [user]);

  // Fetch cart count hanya kalau viewer
  const fetchCartCount = async () => {
    try {
      const res = await apiFetch<{ status: boolean; data: any[] }>("/cart", {
        method: "GET",
      });
      if (res.status) {
        setCartCount(res.data.length);
      }
    } catch (err) {
      console.error("Gagal ambil cart:", err);
    }
  };

  useEffect(() => {
    if (user?.role === "viewer") {
      fetchCartCount();
    }
  }, [user]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    if (filter === "lowStock") list = list.filter((p) => p.stock > 0 && p.stock < 10);
    if (filter === "outOfStock") list = list.filter((p) => p.stock === 0);
    return list;
  }, [products, search, filter]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price);

  const addToCart = async (productId: number, productName: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNotif({ open: true, message: "Silakan login terlebih dahulu" });
      return;
    }

    try {
      const res = await apiFetch<{ status: boolean; data?: any }>("/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });

      if (res.status) {
        setNotif({
          open: true,
          message: `${productName} berhasil ditambahkan ke keranjang`,
        });
        fetchCartCount(); // update badge cart
      } else {
        setNotif({
          open: true,
          message: `Gagal menambahkan ${productName} ke keranjang`,
        });
      }
    } catch (err) {
      console.error(err);
      setNotif({
        open: true,
        message: "Terjadi kesalahan saat menambahkan ke keranjang",
      });
    }
  };

  return (
    <ProtectedRoute>
      {/* 🔥 Dialog blokir akses selain viewer */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600">
              Akses Ditolak
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 mb-4">
            Anda tidak memiliki akses ke halaman ini. Silakan kembali ke halaman Dashboard atau Login.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push("/login")}>
              Login
            </Button>
            <Button onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🔔 Dialog Notifikasi Global */}
      <Dialog open={notif.open} onOpenChange={(open) => setNotif({ ...notif, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notifikasi</DialogTitle>
          </DialogHeader>
          <p>{notif.message}</p>
          <DialogFooter className="flex justify-end">
            <Button onClick={() => setNotif({ ...notif, open: false })}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Hanya render isi kalau viewer */}
      {user?.role === "viewer" && (
        <div className="min-h-screen flex flex-col bg-white text-gray-900 overflow-hidden">
          <SiteHeaderHome cartCount={cartCount} />

          <main className="flex-1 overflow-hidden">
            {loading ? (
              <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 text-lg">Loading products...</p>
              </div>
            ) : (
              <div className="space-y-16 pb-24">
                {/* Hero Section */}
                <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                    alt="Hero Banner"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="relative z-10 text-center text-white px-6">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
                      Premium Collection
                    </h1>
                    <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto leading-relaxed">
                      Experience luxury shopping with curated products designed to enhance your lifestyle.
                    </p>
                    <Link
                      href="/products"
                      className="bg-white text-green-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition"
                    >
                      Shop Now
                    </Link>
                  </div>
                </section>

                {/* Filter & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 px-6 max-w-7xl mx-auto">
                  <Input
                    placeholder="Cari produk..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  <Select value={filter} onValueChange={(val) => setFilter(val as any)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter Produk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Produk</SelectItem>
                      <SelectItem value="lowStock">Hampir Habis (&lt;10)</SelectItem>
                      <SelectItem value="outOfStock">Stok Habis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Produk Grid */}
                <section className="px-6 max-w-7xl mx-auto">
                  {filteredProducts.length === 0 ? (
                    <p className="text-center text-gray-500">Produk tidak ditemukan</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filteredProducts.map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          formatPrice={formatPrice}
                          addToCart={addToCart}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="bg-gray-100 text-gray-700 px-6 py-12 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">About Us</h3>
                <p className="leading-relaxed text-sm">
                  We are a premium e-commerce brand dedicated to bringing high-quality products to your doorstep.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Contact</h3>
                <p className="leading-relaxed text-sm">
                  Email: support@premiumshop.com <br />
                  Phone: +62 812 3456 7890 <br />
                  Address: Jalan Raya Luxury No. 88, Jakarta, Indonesia
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Newsletter</h3>
                <form className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
            <div className="mt-8 text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Premium Shop. All rights reserved.
            </div>
          </footer>
        </div>
      )}
    </ProtectedRoute>
  );
}

// Product Card dengan dialog konfirmasi Add to Cart
function ProductCard({
  product,
  formatPrice,
  addToCart,
}: {
  product: any;
  formatPrice: (price: number) => string;
  addToCart: (productId: number, productName: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="group bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden transition flex flex-col">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
          <img
            src={product.image || "https://via.placeholder.com/300"}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-4 text-center flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-medium text-gray-900 group-hover:text-green-700 transition tracking-tight">
              {product.name}
            </h3>
            <p className="mt-1 text-green-700 font-bold text-md">{formatPrice(product.price)}</p>
          </div>
          <div className="flex justify-center gap-2 mt-2">
            <Link
              href={`/products/${product.id}`}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-green-700 transition"
            >
              <FaInfoCircle /> Detail
            </Link>
            <button
              className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-green-700 transition"
              onClick={() => setOpen(true)}
            >
              <FaShoppingCart /> Add
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 Dialog Konfirmasi Tambah Keranjang */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah ke Keranjang</DialogTitle>
          </DialogHeader>
          <p>
            Apakah Anda yakin ingin menambahkan{" "}
            <span className="font-semibold">{product.name}</span> ke keranjang?
          </p>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                addToCart(product.id, product.name);
                setOpen(false);
              }}
            >
              Ya, Tambahkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
