"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, X, ShoppingCart, Search } from "lucide-react"
import { LoginDialog } from "@/components/auth/login-dialog"
import { UserMenu } from "@/components/auth/user-menu"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image src="/images/3a-logo.png" alt="3A Branding" width={120} height={40} className="h-8 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#categorias" className="text-sm font-medium hover:text-primary transition-colors">
              Categorías
            </a>
            <a href="#productos" className="text-sm font-medium hover:text-primary transition-colors">
              Productos
            </a>
            <a href="#personalizar" className="text-sm font-medium hover:text-primary transition-colors">
              Personalizar
            </a>
            <a href="#contacto" className="text-sm font-medium hover:text-primary transition-colors">
              Contacto
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <UserMenu />
            <LoginDialog />
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="h-4 w-4" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
            </Button>
            <Button className="bg-primary hover:bg-primary/90">Cotizar Ahora</Button>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <a href="#categorias" className="text-sm font-medium hover:text-primary transition-colors">
                Categorías
              </a>
              <a href="#productos" className="text-sm font-medium hover:text-primary transition-colors">
                Productos
              </a>
              <a href="#personalizar" className="text-sm font-medium hover:text-primary transition-colors">
                Personalizar
              </a>
              <a href="#contacto" className="text-sm font-medium hover:text-primary transition-colors">
                Contacto
              </a>
              <div className="flex items-center space-x-2 pt-4">
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
                <UserMenu />
                <LoginDialog />
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-4 w-4" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
                </Button>
              </div>
              <Button className="bg-primary hover:bg-primary/90 w-full">Cotizar Ahora</Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
