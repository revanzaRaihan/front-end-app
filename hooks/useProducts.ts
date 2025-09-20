"use client";

import { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Product,
  ProductPayload,
} from "@/services/products";

interface ProductPaginationMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [meta, setMeta] = useState<ProductPaginationMeta>({
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
  });

  // 🔹 Fetch products
  const fetchProducts = async (page: number = 1, perPage: number = meta.perPage) => {
    setLoading(true);
    try {
      const data = await getProducts();

      // kalau backend belum ada pagination, kita bikin pseudo-meta
      setProducts(data);
      setMeta({
        total: data.length,
        perPage,
        currentPage: page,
        lastPage: Math.ceil(data.length / perPage) || 1,
      });
    } catch (err) {
      console.error("Gagal mengambil data produk", err);
      setProducts([]);
      setMeta({ total: 0, perPage, currentPage: 1, lastPage: 1 });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Add a new product
  const addProduct = async (payload: ProductPayload) => {
    try {
      await createProduct(payload);
      await fetchProducts(1); // reload first page setelah add
    } catch (err) {
      console.error("Gagal menambahkan produk", err);
      throw err;
    }
  };

  // 🔹 Edit product
  const editProduct = async (id: number, payload: ProductPayload) => {
    try {
      await updateProduct(id, payload);
      await fetchProducts(meta.currentPage);
    } catch (err) {
      console.error("Gagal memperbarui produk", err);
      throw err;
    }
  };

  // 🔹 Delete product
  const removeProduct = async (id: number) => {
    try {
      await deleteProduct(id);
      const nextPage =
        products.length === 1 && meta.currentPage > 1
          ? meta.currentPage - 1
          : meta.currentPage;
      await fetchProducts(nextPage);
    } catch (err) {
      console.error("Gagal menghapus produk", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    meta,
    fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
  };
}
