export interface User {
  name: string;
  email: string;
  avatar?: string | null;
}

const API_URL = "http://127.0.0.1:8000/api";

export async function getProfile(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Gagal ambil profil user");
  return res.json();
}
