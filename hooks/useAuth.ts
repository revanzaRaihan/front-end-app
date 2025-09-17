"use client";

import { useEffect, useState } from "react";
import { getProfile, User } from "@/services/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token"); // disimpan saat login
    if (!token) {
      setLoading(false);
      return;
    }

    getProfile(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
