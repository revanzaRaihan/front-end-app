"use client";

import { useState, useMemo, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

import { useProducts } from "@/hooks/useProducts";
import { Product, ProductPayload } from "@/services/products";
import { ProductForm } from "@/components/products/ProductForm";
import { DeleteConfirm } from "@/components/products/DeleteConfirmDialog";
import { useAlert } from "@/components/ui/global-alert";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useRouter } from "next/navigation";

export default function SellerProductPage() {
  const { products, addProduct, editProduct, removeProduct } = useProducts();
  const { showAlert } = useAlert();
  const { user, loading } = useAuthUser();
  const router = useRouter();

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

  // search & sort
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"name" | "price" | "stock">("name");

  // pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const sellerProducts = useMemo(
    () => products.filter((p) => p.user?.id === user?.id),
    [products, user]
  );

  const filteredProducts = useMemo(() => {
    let list = [...sellerProducts];
    if (search.trim())
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "price") return a.price - b.price;
      if (sort === "stock") return a.stock - b.stock;
      return 0;
    });
    return list;
  }, [sellerProducts, search, sort]);

  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  useEffect(() => setPage(1), [search, rowsPerPage]);

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

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  // Spinner
  if (loading || !user || !products) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  // 🚫 Kalau bukan seller
  if (user.role !== "seller") {
    return (
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Akses Ditolak</DialogTitle>
          </DialogHeader>

          {user.role === "viewer" && (
            <>
              <p>Halaman ini khusus Seller. Anda masuk sebagai <b>Viewer</b>.</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => router.push("/home")}>
                  Ke Home
                </Button>
                <Button variant="destructive" onClick={() => router.push("/login")}>
                  Ke Login
                </Button>
              </div>
            </>
          )}

          {user.role === "admin" && (
            <>
              <p>Halaman ini hanya untuk Seller. Anda masuk sebagai <b>Admin</b>.</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => router.push("/dashboard")}>
                  Ke Dashboard
                </Button>
                <Button variant="destructive" onClick={() => router.push("/login")}>
                  Ke Login
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
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
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(val) => setRowsPerPage(Number(val))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Tampilkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <Button onClick={() => setAddOpen(true)}>Tambah Produk</Button>
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
                <th className="p-3 border-b w-40">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product, idx) => (
                  <tr key={product.id} className="hover:bg-green-50 transition">
                    <td className="p-3 border-b">
                      {(page - 1) * rowsPerPage + idx + 1}
                    </td>
                    <td className="p-3 border-b">{product.name}</td>
                    <td className="p-3 border-b break-words">
                      {product.description || "-"}
                    </td>
                    <td className="p-3 border-b">
                      {formatRupiah(product.price)}
                    </td>
                    <td
                      className={`p-3 border-b font-medium ${
                        product.stock === 0
                          ? "text-red-600"
                          : product.stock < 10
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {product.stock}
                    </td>
                    <td className="p-3 border-b flex gap-2">
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <span>
            Halaman {page} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
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
      <DeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        product={productToDelete}
        onConfirm={handleDeleteConfirm}
      />
    </SidebarProvider>
  );
}
