"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { User, LogOut, Settings, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export function UserMenu() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative hover:bg-primary/10 transition-colors"
          aria-label="Menú de usuario"
        >
          <User className="h-4 w-4" />
          {isAdmin && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-white">
              A
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{profile?.full_name || user.email}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            {isAdmin && (
              <Badge variant="secondary" className="w-fit mt-1 bg-primary text-white">
                <Shield className="h-3 w-3 mr-1" />
                Administrador
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => router.push("/perfil")}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          Mi Perfil
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => router.push("/pedidos")}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          Mis Pedidos
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => router.push("/admin")}
              className="cursor-pointer"
            >
              <Shield className="mr-2 h-4 w-4" />
              Panel de Administración
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut} 
          disabled={loading}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer font-medium"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {loading ? "Cerrando sesión..." : "Cerrar Sesión"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


