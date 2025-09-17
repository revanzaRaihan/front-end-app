import { apiFetch } from "@/lib/api";
import { boolean, number } from "zod";

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
  image?: string; // <-- tambahkan ini
}


export type ProductPayload = Omit<Product, "id" | "created_at" | "updated_at">;

// List Produk
export const getProducts = async (): Promise<Product[]> => {
  const res = await apiFetch<{status: boolean; message: string; data: Product[];}>("/auth/products");
  return res.data;
}

export const getProduct = async (id: number): Promise<Product> => {
  const res = await apiFetch<{status: boolean; message: string; data: Product}>(`/auth/products/${id}`);
  return res.data;
}

export const createProduct = (data: ProductPayload) =>
  apiFetch<Product>("/auth/products", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateProduct = (id: number, data: ProductPayload) =>
  apiFetch<Product>(`/auth/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteProduct = (id: number) =>
  apiFetch<{message: string;}>(`/auth/products/${id}`, {
    method: "DELETE",
  });
