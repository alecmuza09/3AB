"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  X,
  ShoppingCart,
  Bot,
  User,
} from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { UserMenu } from "@/components/auth/user-menu"

export function TopHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { getItemCount } = useCart()
  const { user } = useAuth()
  const cartCount = getItemCount()

  const menuItems = [
    { label: "Inicio", href: "/" },
    { label: "Productos", href: "/productos" },
    { label: "Servicios", href: "/servicios" },
    { label: "Pedidos", href: "/pedidos" },
    { label: "Catálogos", href: "/catalogos" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "Contacto", href: "/contacto" },
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname?.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/images/3a-logo.png" 
              alt="3A Branding" 
              width={120} 
              height={40} 
              className="h-8 w-auto" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                  isActive(item.href)
                    ? "text-[#DC2626] bg-red-50"
                    : "text-gray-600 hover:text-[#DC2626] hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link href="/asistente">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-[#DC2626]">
                <Bot className="h-4 w-4 mr-2" />
                Asistente IA
              </Button>
            </Link>
            
            {user ? (
              <UserMenu />
            ) : (
              <Link href="/perfil">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-700 hover:text-[#DC2626]"
                >
                  <User className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </Button>
              </Link>
            )}
            
            <Link href="/carrito">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] rounded-full p-0 text-xs bg-[#DC2626] text-white">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link href="/cotizador">
              <Button size="sm" className="bg-[#DC2626] hover:bg-[#B91C1C] text-white">
                Cotizar
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t py-4">
            <nav className="flex flex-col space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                    isActive(item.href)
                      ? "text-[#DC2626] bg-red-50"
                      : "text-gray-600 hover:text-[#DC2626] hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center space-x-2 pt-4 border-t">
                <Link href="/asistente" onClick={() => setIsMenuOpen(false)} className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full">
                    <Bot className="h-4 w-4 mr-2" />
                    Asistente IA
                  </Button>
                </Link>
                {user ? (
                  <UserMenu />
                ) : (
                  <Link href="/perfil" onClick={() => setIsMenuOpen(false)} className="flex-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Iniciar Sesión
                    </Button>
                  </Link>
                )}
                <Link href="/carrito" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] rounded-full p-0 text-xs bg-[#DC2626] text-white">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </div>
              <Link href="/cotizador" onClick={() => setIsMenuOpen(false)}>
                <Button size="sm" className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white">
                  Cotizar
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
