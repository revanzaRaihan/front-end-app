"use client";

import { useState, useMemo, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { useProducts } from "@/hooks/useProducts";
import { Product, ProductPayload } from "@/services/products";
import { ProductForm } from "@/components/products/ProductForm";
import { DeleteConfirm } from "@/components/products/DeleteConfirmDialog";
import { useAlert } from "@/components/ui/global-alert";
import { useAuthUser } from "@/hooks/useAuthUser";
import ProtectedRoute from "@/components/protectedRoute";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function ProductPage() {
  const { products, loading, addProduct, editProduct, removeProduct } = useProducts();
  const { showAlert } = useAlert();
  const { user } = useAuthUser();

  const [form, setForm] = useState<ProductPayload>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // 🔎 search & sort
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "price" | "stock">("name");

  // 📑 Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (search.trim() !== "") {
      list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.user?.name.toLowerCase().includes(search.toLowerCase()));
    }

    list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "price") return a.price - b.price;
      if (sort === "stock") return a.stock - b.stock;
      return 0;
    });

    return list;
  }, [products, search, sort]);

  // ⏳ Pagination slicing
  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // reset ke page 1 kalau search atau rowsPerPage berubah
  useEffect(() => {
    setPage(1);
  }, [search, rowsPerPage]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nama produk wajib diisi";
    if (form.price <= 0) newErrors.price = "Harga harus lebih dari 0";
    if (form.stock < 0) newErrors.stock = "Stok tidak boleh negatif";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await addProduct(form);
      setForm({ name: "", description: "", price: 0, stock: 0 });
      setAddOpen(false);
      showAlert("default", "Produk Ditambahkan", "Produk baru berhasil disimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedProduct) return;

    setIsSubmitting(true);
    try {
      await editProduct(selectedProduct.id, form);
      setForm({ name: "", description: "", price: 0, stock: 0 });
      setSelectedProduct(null);
      setEditOpen(false);
      showAlert("default", "Produk Diperbarui", "Data produk berhasil diperbarui.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    await removeProduct(productToDelete.id);
    setProductToDelete(null);
    setDeleteOpen(false);
    showAlert("destructive", "Produk Dihapus", "Produk berhasil dihapus.");
  };

  // role check
  const isAdmin = user?.role === "admin";

  // 💰 format rupiah tanpa dua nol
  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  // ⏳ Fullscreen spinner overlay with fade & check full UI render
  const [isReady, setIsReady] = useState(false);
  const [showSpinner, setShowSpinner] = useState(true);

  // menandakan UI sudah render pertama kali
  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  // sembunyikan spinner hanya jika loading selesai & UI sudah siap
  useEffect(() => {
    if (!loading && isReady) {
      const t = setTimeout(() => setShowSpinner(false), 400); // fade smooth
      return () => clearTimeout(t);
    }
  }, [loading, isReady]);

  if (showSpinner) {
    return (
      <div className={`fixed inset-0 flex flex-col items-center justify-center bg-white z-50 transition-opacity duration-500 ${loading || !isReady ? "opacity-100" : "opacity-0"}`}>
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Memuat data produk...</p>
      </div>
    );
  }

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
        {user && <AppSidebar variant="inset" user={user} />}

        <SidebarInset>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Daftar Produk</h1>

              <div className="flex gap-2">
                <Input placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} />

                <Select value={sort} onValueChange={(val: any) => setSort(val)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nama</SelectItem>
                    <SelectItem value="price">Harga</SelectItem>
                    <SelectItem value="stock">Stok</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={rowsPerPage.toString()} onValueChange={(val) => setRowsPerPage(Number(val))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Tampilkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>

                {isAdmin && (
                  <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild>
                      <Button variant="default">Tambah Produk</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah Produk Baru</DialogTitle>
                      </DialogHeader>
                      <ProductForm form={form} setForm={setForm} errors={errors} isSubmitting={isSubmitting} onSubmit={handleAddSubmit} />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Nama</th>
                    <th className="px-4 py-2 border">Deskripsi</th>
                    <th className="px-4 py-2 border">Harga</th>
                    <th className="px-4 py-2 border">Stok</th>
                    <th className="px-4 py-2 border">Seller</th>
                    {isAdmin && <th className="px-4 py-2 border">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-2 border">{product.name}</td>
                        <td className="px-4 py-2 border">{product.description}</td>
                        <td className="px-4 py-2 border">{formatRupiah(product.price)}</td>
                        <td className="px-4 py-2 border">{product.stock}</td>
                        <td className="px-4 py-2 border">{product.user?.name || "-"}</td>

                        {isAdmin && (
  <td className="px-4 py-2 border flex gap-2">
    <Button
      size="sm"
      onClick={() => {
        setSelectedProduct(product);
        setForm({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
        });
        setEditOpen(true);
      }}
    >
      Edit
    </Button>

    {/* Tombol Hapus dengan Dialog Konfirmasi */}
    <Dialog open={deleteOpen && productToDelete?.id === product.id} onOpenChange={setDeleteOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            setProductToDelete(product);
            setDeleteOpen(true);
          }}
        >
          Hapus
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
        </DialogHeader>
        <p>
          Apakah kamu yakin ingin menghapus produk{" "}
          <span className="font-semibold">{productToDelete?.name}</span>?
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await handleDeleteConfirm();
            }}
          >
            Hapus
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </td>
)}

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="px-4 py-6 text-center text-gray-500">
                        Tidak ada produk ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <p>
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Prev
                </Button>
                <Button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </SidebarInset>

        {/* Edit modal */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Produk</DialogTitle>
            </DialogHeader>
            {selectedProduct && <ProductForm form={form} setForm={setForm} errors={errors} isSubmitting={isSubmitting} onSubmit={handleEditSubmit} />}
          </DialogContent>
        </Dialog>

        {/* Delete modal */}
        {/* Delete modal */}
<DeleteConfirm
  open={deleteOpen}
  onOpenChange={setDeleteOpen}
  product={productToDelete}
  onConfirm={handleDeleteConfirm}
/>

      </SidebarProvider>
    </ProtectedRoute>
  );
}
