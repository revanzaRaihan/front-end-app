"use client";


import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";


import { useProducts } from "@/hooks/useProducts";
import { Product, ProductPayload } from "@/services/products";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductForm } from "@/components/products/ProductForm";
import { DeleteConfirm } from "@/components/products/DeleteConfirmDialog";
import { Breadcrumbs } from "@/components/products/Breadcrumbs";
import { useAlert } from "@/components/ui/global-alert";


export default function ProductPage() {
 const { products, loading, addProduct, editProduct, removeProduct } = useProducts();
 const { showAlert } = useAlert();


 // Form state
 const [form, setForm] = useState<ProductPayload>({ name: "", description: "", price: 0, stock: 0 });
 const [errors, setErrors] = useState<Record<string, string>>({});
 const [isSubmitting, setIsSubmitting] = useState(false);


 // Dialog state
 const [addOpen, setAddOpen] = useState(false);
 const [editOpen, setEditOpen] = useState(false);
 const [deleteOpen, setDeleteOpen] = useState(false);
 const [detailOpen, setDetailOpen] = useState(false); // 🆕


 // Selected product states
 const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
 const [productToDelete, setProductToDelete] = useState<Product | null>(null);
 const [detailProduct, setDetailProduct] = useState<Product | null>(null); // 🆕


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
   <SidebarProvider
     style={
       {
         "--sidebar-width": "calc(var(--spacing) * 72)",
         "--header-height": "calc(var(--spacing) * 12)",
       } as React.CSSProperties
     }
   >
     <AppSidebar variant="inset" />
     <SidebarInset>
       <SiteHeader />
       <div className="flex flex-1 flex-col">
         <div className="@container/main flex flex-1 flex-col gap-2">
           <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
             <div className="px-4 lg:px-6">
               <div className="flex items-center justify-between mb-4">
                 {/* Dialog Tambah */}
                 <Dialog open={addOpen} onOpenChange={setAddOpen}>
                   <DialogTrigger asChild>
                     <Button variant="outline">Tambah Product</Button>
                   </DialogTrigger>
                   <DialogContent>
                     <DialogHeader>
                       <DialogTitle>Tambah Produk Baru</DialogTitle>
                       <DialogDescription>Isi data produk di bawah, lalu klik simpan.</DialogDescription>
                     </DialogHeader>
                     <ProductForm form={form} setForm={setForm} errors={errors} isSubmitting={isSubmitting} onSubmit={handleAddSubmit} />
                   </DialogContent>
                 </Dialog>


                 <Breadcrumbs />
               </div>


               {loading ? (
                 <p>Loading...</p>
               ) : (
                 <ProductTable
                   products={products}
                   onDetail={(product) => {
                     // 🆕 Tambah detail handler
                     setDetailProduct(product);
                     setDetailOpen(true);
                   }}
                   onEdit={(product) => {
                     setSelectedProduct(product);
                     setForm({
                       name: product.name,
                       description: product.description || "",
                       price: product.price,
                       stock: product.stock,
                     });
                     setEditOpen(true);
                   }}
                   onDelete={(product) => {
                     setProductToDelete(product);
                     setDeleteOpen(true);
                   }}
                 />
               )}
             </div>
           </div>
         </div>
       </div>
     </SidebarInset>


     {/* Dialog Edit */}
     <Dialog open={editOpen} onOpenChange={setEditOpen}>
       <DialogContent>
         <DialogHeader>
           <DialogTitle>Edit Produk</DialogTitle>
           <DialogDescription>Ubah data produk di bawah, lalu klik simpan.</DialogDescription>
         </DialogHeader>
         <ProductForm form={form} setForm={setForm} errors={errors} isSubmitting={isSubmitting} onSubmit={handleEditSubmit} />
       </DialogContent>
     </Dialog>


     {/* Dialog Delete */}
     <DeleteConfirm open={deleteOpen} onOpenChange={setDeleteOpen} product={productToDelete} onConfirm={handleDeleteConfirm} />


     {/* Dialog Detail */}
     <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
       <DialogContent>
         <DialogHeader>
           <DialogTitle>Detail Produk</DialogTitle>
           <DialogDescription>Informasi lengkap produk yang dipilih.</DialogDescription>
         </DialogHeader>
         {detailProduct && (
           <div className="space-y-2">
             <p>
               <strong>Nama:</strong> {detailProduct.name}
             </p>
             <p>
               <strong>Deskripsi:</strong> {detailProduct.description || "-"}
             </p>
             <p>
               <strong>Harga:</strong> Rp {detailProduct.price.toLocaleString()}
             </p>
             <p>
               <strong>Stok:</strong> {detailProduct.stock}
             </p>
             <p>
               <strong>Dibuat:</strong> {detailProduct.created_at}
             </p>
             <p>
               <strong>Diupdate:</strong> {detailProduct.updated_at}
             </p>
           </div>
         )}
       </DialogContent>
     </Dialog>
   </SidebarProvider>
 );
}