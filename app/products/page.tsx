"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useProducts } from "@/hooks/useProducts";
import { Product, ProductPayload } from "@/services/products";
import { ProductForm } from "@/components/products/ProductForm";
import { DeleteConfirm } from "@/components/products/DeleteConfirmDialog";
import { Breadcrumbs } from "@/components/products/Breadcrumbs";
import { useAlert } from "@/components/ui/global-alert";
import { useAuthUser } from "@/hooks/useAuthUser";
import ProtectedRoute from "@/components/protectedRoute";

export default function ProductPage() {
  const { products, loading, addProduct, editProduct, removeProduct } = useProducts();
  const { showAlert } = useAlert();
  const user = useAuthUser();

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

  return (
    <ProtectedRoute>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        {user && (
          <AppSidebar
            variant="inset"
            user={{
              name: user.user?.name || "",
              email: user.user?.email || "",
              avatar: user.user?.avatar ?? null,
            }}
          />
        )}

        <SidebarInset>
          <SiteHeader />

          {/* Loading Spinner */}
          {loading ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 text-lg">Loading products...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 py-6">
              {/* Action bar */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 lg:px-6">
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Tambah Produk</Button>
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

                <Breadcrumbs />
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 lg:px-6">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-lg shadow hover:shadow-xl transition flex flex-col overflow-hidden"
                  >
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <h2 className="text-lg font-semibold mb-2">{p.name}</h2>
                      <p className="text-green-700 font-bold text-xl mb-2">
                        Rp {p.price.toLocaleString()}
                      </p>
                      <p
                        className={`mb-4 font-medium ${
                          p.stock === 0
                            ? "text-red-600"
                            : p.stock < 10
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {p.stock === 0 ? "Out of Stock" : `${p.stock} in stock`}
                      </p>
                      <div className="mt-auto flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProduct(p);
                            setForm({
                              name: p.name,
                              description: p.description || "",
                              price: p.price,
                              stock: p.stock,
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
                            setProductToDelete(p);
                            setDeleteOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SidebarInset>

        {/* Edit Modal */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Produk</DialogTitle>
            </DialogHeader>
            <ProductForm
              form={form}
              setForm={setForm}
              errors={errors}
              isSubmitting={isSubmitting}
              onSubmit={handleEditSubmit}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Modal */}
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
