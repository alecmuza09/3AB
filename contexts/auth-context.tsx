"use client"

import React, { createContext, useContext, useEffect, useState, useMemo } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase-types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Crear cliente de Supabase de forma segura solo en el cliente
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null
    try {
      return createSupabaseClient()
    } catch (error) {
      console.error("Error creating Supabase client:", error)
      return null
    }
  }, [])

  const isAdmin = profile?.role === "admin"

  // Cargar perfil del usuario
  const loadProfile = async (userId: string) => {
    if (!supabase) return
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Error loading profile:", error)
        // Si no existe el perfil, crearlo
        if (error.code === "PGRST116") {
          const { data: userData } = await supabase.auth.getUser()
          if (userData.user) {
            const { error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: userData.user.id,
                email: userData.user.email || "",
                full_name: userData.user.user_metadata?.full_name || null,
                role: "customer",
              })

            if (!insertError) {
              const { data: newProfile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single()
              setProfile(newProfile)
            }
          }
        }
        return
      }

      setProfile(data)
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  // Refrescar perfil
  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id)
    }
  }

  // Inicializar autenticación
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      }
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: "Supabase no está inicializado" }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        await loadProfile(data.user.id)
      }

      return { error: null }
    } catch (error: any) {
      return { error: error.message || "Error al iniciar sesión" }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) return { error: "Supabase no está inicializado" }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        // Crear perfil automáticamente
        await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email || "",
          full_name: fullName || null,
          role: "customer",
        })

        await loadProfile(data.user.id)
      }

      return { error: null }
    } catch (error: any) {
      return { error: error.message || "Error al registrar usuario" }
    }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


