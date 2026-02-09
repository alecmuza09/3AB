"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Users,
  Package,
  ShoppingBag,
  Settings,
  BookOpen,
  Phone,
  ShoppingCart,
  Search,
  Menu,
  X,
  Bot,
  Shield,
  Calculator,
} from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { LoginDialog } from "@/components/auth/login-dialog"
import { UserMenu } from "@/components/auth/user-menu"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const { getItemCount } = useCart()
  const { isAdmin, user, signOut } = useAuth()
  const router = useRouter()
  const cartCount = getItemCount()

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      window.location.href = "/"
    }
  }

  const menuItems = [
    { icon: Home, label: "Inicio", href: "/" },
    { icon: Users, label: "Nosotros", href: "/nosotros" },
    { icon: Package, label: "Productos", href: "/productos" },
    { icon: ShoppingBag, label: "Pedidos", href: "/pedidos" },
    { icon: Settings, label: "Servicios", href: "/servicios" },
    { icon: BookOpen, label: "Catálogos", href: "/catalogos" },
    { icon: Calculator, label: "Cotizador", href: "/cotizador" },
    { icon: Bot, label: "Asistente IA", href: "/asistente" },
    { icon: Phone, label: "Contacto", href: "/contacto" },
    { icon: Shield, label: "Administración", href: "/admin", isAdmin: true },
  ].filter((item) => {
    // Ocultar opciones de admin si el usuario no es administrador
    if (item.isAdmin && !isAdmin) {
      return false
    }
    return true
  })

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white border-b border-sidebar-border shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Link href="/">
            <Image src="/images/3a-logo.png" alt="3A Branding" width={100} height={32} className="h-8 w-auto" />
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`
        fixed left-0 top-0 z-40 h-full w-64 bg-sidebar border-r border-sidebar-border
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <Image src="/images/3a-logo.png" alt="3A Branding" width={120} height={40} className="h-8 w-auto" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      item.isAdmin
                        ? "text-primary hover:bg-primary/10 border border-primary/20"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.isAdmin && (
                      <Badge variant="secondary" className="ml-auto text-xs bg-primary text-white">
                        Admin
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <UserMenu />
              <LoginDialog />
              <Link href="/carrito" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" size="sm" className="relative" aria-label="Abrir carrito">
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 min-w-[1.25rem] rounded-full p-0 text-xs bg-primary">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
            <Link href="/asistente" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Bot className="h-4 w-4 mr-2" />
                Asistente IA
              </Button>
            </Link>
            {user && (
              <Button
                variant="outline"
                className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground mt-2"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {signingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
