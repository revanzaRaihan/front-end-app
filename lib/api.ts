export interface ApiOptions extends RequestInit {
  headers?: HeadersInit;
  signal?: AbortSignal;
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const baseUrl = "http://127.0.0.1:8000/api";

  // 🔹 Ambil token dari localStorage (kalau ada)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      cache: "no-store",
      ...options,
    });

    let data: T | null = null;
    try {
      data = await res.json();
    } catch (jsonErr) {
      // Kalau response bukan JSON, biarkan data null
      console.warn("API response is not JSON:", jsonErr);
    }

    if (!res.ok) {
      const errorMsg =
        (data as any)?.message ||
        `${res.status} ${res.statusText}` ||
        "API Error";
      throw new Error(errorMsg);
    }

    return data as T;
  } catch (err: any) {
    console.error("API Fetch Error:", err);
    throw new Error(err?.message || "Unknown API error");
  }
}

// 🔹 Tipe data User sesuai backend
export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "seller" | "viewer";
}

// 🔹 Helper untuk ambil data user yang sedang login (/me)
export const getCurrentUser = async (): Promise<User> => {
  const res = await apiFetch<{
    status: boolean;
    message: string;
    data: User;
  }>("/auth/me");

  return res.data;
};
