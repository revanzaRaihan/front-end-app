"use client"

import { useEffect, useState } from "react"
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Product,
  ProductPayload,
} from "@/services/products"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Ambil semua produk
  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (err) {
      console.error("Gagal mengambil data produk", err)
    } finally {
      setLoading(false)
    }
  }

  // Tambah produk
  const addProduct = async (payload: ProductPayload) => {
    await createProduct(payload)
    await fetchProducts()
  }

  // Edit produk
  const editProduct = async (id: number, payload: ProductPayload) => {
    await updateProduct(id, payload)
    await fetchProducts()
  }

  // Hapus produk
  const removeProduct = async (id: number) => {
    await deleteProduct(id)
    await fetchProducts()
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    addProduct,
    editProduct,
    removeProduct,
    fetchProducts, // ✅ sekarang ada
  }
}
