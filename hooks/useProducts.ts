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

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 🔹 Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Gagal mengambil data produk", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Add a new product
  const addProduct = async (payload: ProductPayload) => {
    try {
      await createProduct(payload);
      await fetchProducts();
    } catch (err) {
      console.error("Gagal menambahkan produk", err);
      throw err;
    }
  };

  // 🔹 Edit an existing product
  const editProduct = async (id: number, payload: ProductPayload) => {
    try {
      await updateProduct(id, payload);
      await fetchProducts();
    } catch (err) {
      console.error("Gagal memperbarui produk", err);
      throw err;
    }
  };

  // 🔹 Remove a product
  const removeProduct = async (id: number) => {
    try {
      await deleteProduct(id);
      await fetchProducts();
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
    fetchProducts, // expose fetch for manual refresh
    addProduct,
    editProduct,
    removeProduct,
  };
}
