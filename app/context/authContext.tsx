"use client"

import { createContext, useContext, ReactNode } from "react"
import { useAuthUser } from "@/hooks/useAuthUser"

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, error } = useAuthUser()
  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
