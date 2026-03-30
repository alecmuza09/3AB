"use client"

import React, { createContext, useContext, useEffect, useState, useMemo } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase-types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName?: string, phone?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (data: { full_name?: string; phone?: string; company?: string; address?: string }) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null
    try {
      return getSupabaseClient()
    } catch (error) {
      console.error("Error creating Supabase client:", error)
      return null
    }
  }, [])

  const isAdmin = profile?.role === "admin" || user?.email === "alecmuza09@gmail.com" || user?.email === "alec.muza@capacit.io"

  const loadProfile = async (userId: string) => {
    if (!supabase) return
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          // Perfil no existe — verificar antes de crear para no sobreescribir un admin
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle()

          if (existingProfile) {
            setProfile(existingProfile)
            return
          }

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
        } else {
          console.error("Error loading profile:", error)
        }
        return
      }

      setProfile(data)
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id)
    }
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let cancelled = false
    const AUTH_TIMEOUT_MS = 10000

    const timeoutId = setTimeout(() => {
      if (!cancelled) setLoading(false)
    }, AUTH_TIMEOUT_MS)

    // getSession carga la sesión inicial y espera el perfil antes de
    // quitar el spinner, así AdminGuard nunca ve loading=false con isAdmin=false
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (cancelled) return
        clearTimeout(timeoutId)
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        }
        if (!cancelled) setLoading(false)
      })
      .catch((err) => {
        if (!cancelled) {
          clearTimeout(timeoutId)
          console.error("Error obteniendo sesión:", err)
          setLoading(false)
        }
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return

      // INITIAL_SESSION ya lo maneja getSession() — ignorarlo aquí evita que
      // una sesión sin refrescar pise el estado y deje user=null con loading=false
      if (event === "INITIAL_SESSION") return

      // TOKEN_REFRESHED solo renueva el token; el perfil no cambia
      if (event === "TOKEN_REFRESHED") {
        if (session?.user) setUser(session.user)
        return
      }

      setUser(session?.user ?? null)
      if (session?.user) {
        await loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
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
        setUser(data.user)
        await loadProfile(data.user.id)
      }

      return { error: null }
    } catch (error: any) {
      return { error: error.message || "Error al iniciar sesión" }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string, phone?: string) => {
    if (!supabase) return { error: "Supabase no está inicializado" }
    
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://3abranding.com"

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: siteUrl,
          data: { full_name: fullName },
        },
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email || "",
          full_name: fullName || null,
          phone: phone || null,
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
    setUser(null)
    setProfile(null)
    if (!supabase) return
    try {
      await supabase.auth.signOut({ scope: "local" })
    } catch (e) {
      console.error("Error en signOut de Supabase:", e)
    }
  }

  const updateProfile = async (data: { full_name?: string; phone?: string; company?: string; address?: string }) => {
    if (!supabase || !user) return { error: "No hay sesión activa" }
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id)

      if (error) {
        return { error: error.message }
      }

      await loadProfile(user.id)
      return { error: null }
    } catch (error: any) {
      return { error: error.message || "Error al actualizar perfil" }
    }
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
        updateProfile,
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
