// hooks/useRequireAuth.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useRequireAuth() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.replace("/login") // kalau gak ada token → login
    }
  }, [router])
}
