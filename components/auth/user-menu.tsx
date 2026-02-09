"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { User, LogOut, Settings, Shield, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function UserMenu() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    setLoading(true)
    setOpen(false)
    try {
      await signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      setLoading(false)
      window.location.href = "/"
    }
  }

  const handleNavigate = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "relative hover:bg-red-50 transition-colors text-gray-700 hover:text-[#DC2626]",
          open && "bg-red-50 text-[#DC2626]"
        )}
        aria-label="Menú de usuario"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        <User className="h-4 w-4" />
        <ChevronDown className={cn("h-4 w-4 ml-0.5 transition-transform", open && "rotate-180")} />
        {isAdmin && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-[#DC2626] text-white">
            A
          </Badge>
        )}
      </Button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 z-[100] rounded-md border bg-white p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
          role="menu"
        >
          <div className="px-2 py-2 border-b">
            <p className="text-sm font-medium truncate">{profile?.full_name || user.email}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            {isAdmin && (
              <Badge variant="secondary" className="w-fit mt-1 bg-[#DC2626] text-white text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Administrador
              </Badge>
            )}
          </div>
          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
              onClick={() => handleNavigate("/perfil")}
            >
              <User className="mr-2 h-4 w-4" />
              Mi Perfil
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
              onClick={() => handleNavigate("/pedidos")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Mis Pedidos
            </button>
            {isAdmin && (
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                onClick={() => handleNavigate("/admin")}
              >
                <Shield className="mr-2 h-4 w-4" />
                Configuración de Admin
              </button>
            )}
          </div>
          <div className="border-t py-1">
            <button
              type="button"
              role="menuitem"
              disabled={loading}
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {loading ? "Cerrando sesión..." : "Cerrar Sesión"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
