import { apiFetch, getCurrentUser, User } from "@/lib/api";

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  user?: User;
}

// Payload for creating/updating products
export type ProductPayload = Omit<Product, "id" | "created_at" | "updated_at">;

// 🔹 Helper → tentukan prefix berdasarkan role user via /auth/me
async function getRolePrefix(): Promise<"admin" | "seller"> {
  try {
    const user = await getCurrentUser();
    return user.role === "admin" ? "admin" : "seller";
  } catch (err) {
    console.error("Gagal ambil role user:", err);
    return "seller"; // fallback kalau gagal
  }
}

// 🔹 List all products (public)
export const getProducts = async (): Promise<Product[]> => {
  const res = await apiFetch<{
    status: boolean;
    message: string;
    data: Product[];
  }>("/products");
  return res.data;
};

// 🔹 Get single product (public)
export const getProduct = async (id: number): Promise<Product> => {
  const res = await apiFetch<{
    status: boolean;
    message: string;
    data: Product;
  }>(`/products/${id}`);
  return res.data;
};

// 🔹 Create product (seller/admin)
export const createProduct = async (data: ProductPayload) => {
  const prefix = await getRolePrefix();
  return apiFetch<Product>(`/${prefix}/products`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// 🔹 Update product
export const updateProduct = async (id: number, data: ProductPayload) => {
  const prefix = await getRolePrefix();
  return apiFetch<Product>(`/${prefix}/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// 🔹 Delete product
export const deleteProduct = async (id: number) => {
  const prefix = await getRolePrefix();
  return apiFetch<{ message: string }>(`/${prefix}/products/${id}`, {
    method: "DELETE",
  });
};
