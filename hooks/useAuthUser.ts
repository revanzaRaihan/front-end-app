"use client";

import { useEffect, useState } from "react";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  role: "admin" | "seller" | "viewer"; // add role
}

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch user");
        }

        // ⚡ Expect backend to return role as part of the user object
        setUser(data.data);
      } catch (err: any) {
        setError(err.message);
        localStorage.removeItem("token");
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}
