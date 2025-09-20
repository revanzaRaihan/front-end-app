"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { useProducts } from "@/hooks/useProducts";
import { Product, ProductPayload } from "@/services/products";
import { ProductForm } from "@/components/products/ProductForm";
import { DeleteConfirm } from "@/components/products/DeleteConfirmDialog";
import { useAlert } from "@/components/ui/global-alert";
import { useAuthUser } from "@/hooks/useAuthUser";
import ProtectedRoute from "@/components/protectedRoute";

export default function ProductPage() {
  const router = useRouter();
  const { products, loading, meta, fetchProducts, addProduct, editProduct, removeProduct } = useProducts();
  const { showAlert } = useAlert();
  const { user, loading: loadingUser } = useAuthUser();

  // form state
  const [form, setForm] = useState<ProductPayload>({ name: "", description: "", price: 0, stock: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // modal states
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // selected product states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // search & sort
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "price" | "stock">("name");

  // redirect viewer ke home
  useEffect(() => {
    if (!loadingUser && user?.role === "viewer") {
      router.replace("/");
    }
  }, [user, loadingUser, router]);

  // filtering & sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.user?.name.toLowerCase().includes(query)
      );
    }
    list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "price") return a.price - b.price;
      if (sort === "stock") return a.stock - b.stock;
      return 0;
    });
    return list;
  }, [products, search, sort]);

  // pagination
  const paginatedProducts = useMemo(() => {
    const start = (meta.currentPage - 1) * meta.perPage;
    const end = start + meta.perPage;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, meta]);

  // validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nama produk wajib diisi";
    if (form.price <= 0) newErrors.price = "Harga harus lebih dari 0";
    if (form.stock < 0) newErrors.stock = "Stok tidak boleh negatif";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // handlers
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

  const isAdmin = user?.role === "admin";

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  // Loading spinner jika user atau products sedang load
  if (loadingUser || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          className="animate-spin h-12 w-12 text-green-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>
    );
  }

  if (!user || user.role === "viewer") return null;

  return (
    <ProtectedRoute>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" user={user} />

        <SidebarInset className="p-6">
          {/* Header & Controls */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold">Daftar Produk</h1>

            <div className="flex flex-wrap gap-2 items-center">
              <Input
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="md:w-64"
              />

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

              {isAdmin && (
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                  <DialogTrigger asChild>
                    <Button>Tambah Produk</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Produk Baru</DialogTitle>
                    </DialogHeader>
                    <ProductForm
                      form={form}
                      setForm={setForm}
                      errors={errors}
                      isSubmitting={isSubmitting}
                      onSubmit={handleAddSubmit}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Tabel Produk */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-green-50">
                <tr>
                  <th className="p-3 border-b w-12">#</th>
                  <th className="p-3 border-b w-48">Nama</th>
                  <th className="p-3 border-b">Deskripsi</th>
                  <th className="p-3 border-b w-32">Harga</th>
                  <th className="p-3 border-b w-20">Stok</th>
                  {user.role !== "seller" && <th className="p-3 border-b w-40">Seller</th>}
                  {isAdmin && <th className="p-3 border-b w-40">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={user.role !== "seller" ? 7 : 6} className="p-4 text-center text-gray-500">
                      Tidak ada produk ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-green-50 transition">
                      <td className="p-3 border-b">{(meta.currentPage - 1) * meta.perPage + idx + 1}</td>
                      <td className="p-3 border-b">{p.name}</td>
                      <td className="p-3 border-b break-words">{p.description}</td>
                      <td className="p-3 border-b">{formatRupiah(p.price)}</td>
                      <td className={`p-3 border-b font-medium ${
                        p.stock === 0 ? "text-red-600" : p.stock < 10 ? "text-yellow-600" : "text-green-600"
                      }`}>
                        {p.stock}
                      </td>
                      {user.role !== "seller" && <td className="p-3 border-b">{p.user?.name || "-"}</td>}
                      {isAdmin && (
                        <td className="p-3 border-b flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(p);
                              setForm({
                                name: p.name,
                                description: p.description,
                                price: p.price,
                                stock: p.stock,
                              });
                              setEditOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Dialog open={deleteOpen && productToDelete?.id === p.id} onOpenChange={setDeleteOpen}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setProductToDelete(p);
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
                                Apakah kamu yakin ingin menghapus <span className="font-semibold">{productToDelete?.name}</span>?
                              </p>
                              <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Batal</Button>
                                <Button variant="destructive" onClick={handleDeleteConfirm}>Hapus</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" size="sm" disabled={meta.currentPage === 1} onClick={() => fetchProducts(meta.currentPage - 1)}>Prev</Button>
            <span>Halaman {meta.currentPage} dari {meta.lastPage}</span>
            <Button variant="outline" size="sm" disabled={meta.currentPage === meta.lastPage} onClick={() => fetchProducts(meta.currentPage + 1)}>Next</Button>
          </div>
        </SidebarInset>

        {/* Edit Modal */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Produk</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <ProductForm
                form={form}
                setForm={setForm}
                errors={errors}
                isSubmitting={isSubmitting}
                onSubmit={handleEditSubmit}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Modal */}
        <DeleteConfirm open={deleteOpen} onOpenChange={setDeleteOpen} product={productToDelete} onConfirm={handleDeleteConfirm} />
      </SidebarProvider>
    </ProtectedRoute>
  );
}
