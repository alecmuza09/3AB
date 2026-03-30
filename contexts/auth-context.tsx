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
  
  // Crear cliente de Supabase de forma segura solo en el cliente
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
        // Si no existe la fila en profiles, crearla como customer
        // Solo si el error es definitivamente "no existe" (PGRST116)
        if (error.code === "PGRST116") {
          const { data: userData } = await supabase.auth.getUser()
          if (userData.user) {
            // Verificar una segunda vez antes de insertar para evitar
            // crear un perfil customer sobre uno admin existente
            const { data: existingProfile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .maybeSingle()

            if (existingProfile) {
              setProfile(existingProfile)
              return
            }

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
          // Reintentar una vez después de 1.5s para cubrir errores de red transitorios
          // y evitar que profile quede null indefinidamente (lo que causa spinner infinito)
          setTimeout(async () => {
            if (!supabase) return
            const { data: retryData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .maybeSingle()
            if (retryData) setProfile(retryData)
          }, 1500)
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

  // Inicializar autenticación (con timeout para no quedarse colgado)
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let cancelled = false
    const AUTH_TIMEOUT_MS = 10000

    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        setLoading(false)
      }
    }, AUTH_TIMEOUT_MS)

    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (cancelled) return
        clearTimeout(timeoutId)
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        }
        if (!cancelled) {
          setLoading(false)
        }
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
      setUser(session?.user ?? null)

      if (session?.user) {
        // TOKEN_REFRESHED solo renueva el access token; el perfil no cambia.
        // Recargar el perfil en ese evento puede causar que un error de red
        // sobreescriba el rol del admin con "customer".
        if (event !== 'TOKEN_REFRESHED') {
          await loadProfile(session.user.id)
        }
      } else {
        setProfile(null)
      }

      if (!cancelled) {
        setLoading(false)
      }
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

      // Setear user y cargar perfil directamente aquí para que el estado
      // sea correcto antes de que se cierre el modal y se navegue a /admin.
      // onAuthStateChange también lo hará (SIGNED_IN), pero ese camino tiene
      // un hueco de ~300ms donde user!=null y profile=null (isAdmin=false).
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
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        // Crear perfil automáticamente como cliente
        await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email || "",
          full_name: fullName || null,
          phone: phone || null,
          role: "customer", // Siempre se crea como cliente
        })

        await loadProfile(data.user.id)
      }

      return { error: null }
    } catch (error: any) {
      return { error: error.message || "Error al registrar usuario" }
    }
  }

  const signOut = async () => {
    if (!supabase) {
      // Sin cliente, limpiar estado manualmente como fallback
      setUser(null)
      setProfile(null)
      return
    }
    try {
      await supabase.auth.signOut({ scope: "local" })
      // El evento SIGNED_OUT de onAuthStateChange limpia user y profile.
      // No hacer setUser(null) aquí para evitar que AdminGuard redirija
      // antes de que window.location.href ejecute la navegación correcta.
    } catch (e) {
      console.error("Error en signOut de Supabase:", e)
      // Si falló el signOut, limpiar estado manualmente para que la UI
      // no muestre al usuario como logueado
      setUser(null)
      setProfile(null)
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


