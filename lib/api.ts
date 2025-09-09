export interface ApiOptions extends RequestInit {
  headers?: HeadersInit;
  signal?: AbortSignal;
}

export async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const baseUrl = "http://127.0.0.1:8000/api";

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      cache: "no-store",
      ...options,
    });

    let data: any;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const errorMsg = data?.message || `${res.status} ${res.statusText}` || "API Error";
      throw new Error(errorMsg);
    }
    return data as T;
  } catch (err: any) {
    console.error("API Fetch Error:", err);
    throw new Error(err.message || "Unknown API error");
  }
}

