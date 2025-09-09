import { apiFetch } from "@/lib/api";
import { boolean, number } from "zod";

export interface Product {
 id: number;
 name: string;
 description: string;
 price: number;
 stock: number;
 category: string;
 created_at: string;
 updated_at: string;
}

export type ProductPayload = Omit<Product, "id" | "created_at" | "updated_at">;

// List Produk
export const getProducts = async (): Promise<Product[]> =>{
    const res = await apiFetch<{status: boolean; message: string; data: Product[]; meta?: any;}>("/products");
    return res.data;
} 

// Detail Produk
export const getProduct = async (id: number): Promise<Product[]> =>{
    const res = await apiFetch<{status: boolean; message: string; data: Product[]}>(`/products/${id}`);
    return res.data;
} 

// Create Produk
export const createProduct = (data : ProductPayload) =>
    apiFetch<Product>("/products", {
        method: "POST",
        body: JSON.stringify(data),
    });


// Update Produk
export const updateProduct = (id: number, data: ProductPayload) =>
    apiFetch<Product>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    

// Hapus Produk
export const deleteProduct = (id: number) =>
    apiFetch<{message: string;}>(`/products${id}`, {
        method: "DELETE",
    });