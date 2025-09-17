// components/ProtectedRoute.tsx
"use client"

import { useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"

interface Props {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      router.replace("/login")
    } else {
      setAuthorized(true)
    }
  }, [router])

  if (!authorized) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return <>{children}</>
}
