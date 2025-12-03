"use client"

import { Sidebar } from "@/components/sidebar"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Search, Filter, Star, ShoppingCart, Palette } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getAllProductsForDisplay } from "@/lib/all-products"
import { WooCommerceProduct } from "@/lib/woocommerce-products"
import { useState, useMemo } from "react"

export default function ProductosPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Mapa de colores para swatches
  const colorMap: Record<string, string> = {
    "negro": "#000000",
    "black": "#000000",
    "blanco": "#FFFFFF",
    "white": "#FFFFFF",
    "rojo": "#DC2626",
    "red": "#DC2626",
    "azul": "#2563EB",
    "blue": "#2563EB",
    "verde": "#16A34A",
    "green": "#16A34A",
    "amarillo": "#EAB308",
    "yellow": "#EAB308",
    "naranja": "#EA580C",
    "orange": "#EA580C",
    "rosa": "#EC4899",
    "pink": "#EC4899",
    "morado": "#9333EA",
    "purple": "#9333EA",
    "gris": "#6B7280",
    "gray": "#6B7280",
    "café": "#92400E",
    "brown": "#92400E",
    "beige": "#D4B896",
    "navy": "#1E3A8A",
    "marino": "#1E3A8A",
  }

  const getColorHex = (colorName: string): string => {
    const normalized = colorName.toLowerCase().trim()
    return colorMap[normalized] || "#9CA3AF"
  }

  const categories = [
    "Todos",
    "Antiestrés",
    "Bar",
    "Belleza",
    "Bolsas",
    "Calendarios",
    "Deportes",
    "Ecológicos",
    "Escritura",
    "Folders",
    "Gafetes",
    "Gorras",
    "Hogar",
    "Mochilas",
    "Oficina",
    "Pines",
    "Placas",
    "Playeras",
    "Plumas",
    "Portarretratos",
    "Reconocimientos",
    "Relojes",
    "Salud",
    "Tarjetas de Presentación",
    "Tazas",
    "Tecnología",
    "Termos",
    "Textiles",
    "USB",
    "Vasos",
  ]

  // Obtener todos los productos (legacy + WooCommerce)
  const allProducts = getAllProductsForDisplay()

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    let filtered = allProducts

    // Filtrar por categoría
    if (selectedCategory !== "Todos") {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [allProducts, selectedCategory, searchTerm])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <WhatsappButton />

      <main className="md:ml-64">
        <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3A_banners_1920x720_PRODUCTOS-eD68qdAhB00ubdTk4yOphghZ7XgISO.png"
            alt="Nuestros Productos - 3A Branding"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">Catálogo de Productos</h1>
                  <p className="text-lg text-muted-foreground">
                    Más de {allProducts.length} productos promocionales personalizables de alta calidad.
                  </p>
                </div>
                <Badge className="bg-primary text-lg px-4 py-2">
                  {filteredProducts.length} productos
                </Badge>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input 
                      placeholder="Buscar por nombre, descripción, SKU..." 
                      className="pl-10 h-12 text-base"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {searchTerm && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchTerm("")}
                      className="h-12"
                    >
                      Limpiar búsqueda
                    </Button>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Categorías</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          selectedCategory === category 
                            ? "bg-primary hover:bg-primary/90" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        } whitespace-nowrap px-3 py-1.5`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <Card className="p-8 text-center">
                <CardContent>
                  <p className="text-muted-foreground">
                    No se encontraron productos con los filtros seleccionados.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="group hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/productos/${product.id}`)}
                  >
                    <CardHeader className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <Image
                          src={product.image || `/placeholder.svg?height=200&width=300&query=${product.name}`}
                          alt={product.name}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-2 right-2 bg-primary">{product.category}</Badge>
                        {product.stock !== undefined && product.stock > 0 && (
                          <Badge className="absolute top-2 left-2 bg-green-500">
                            En stock: {product.stock}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg line-clamp-2 mb-2">{product.name}</CardTitle>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-xs text-muted-foreground ml-1">({Math.floor(Math.random() * 50 + 10)} reseñas)</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                      
                      {/* Color Swatches */}
                      {(() => {
                        const wooProduct = product as unknown as WooCommerceProduct
                        return wooProduct.attributes?.color && wooProduct.attributes.color.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Palette className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">Colores:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {wooProduct.attributes.color.slice(0, 5).map((color: string, idx: number) => {
                                const colorHex = getColorHex(color)
                                return (
                                  <div
                                    key={idx}
                                    className={`w-6 h-6 rounded-full shadow-sm border ${
                                      colorHex === "#FFFFFF" ? "border-gray-300" : "border-gray-200"
                                    }`}
                                    style={{ backgroundColor: colorHex }}
                                    title={color}
                                  />
                                )
                              })}
                              {wooProduct.attributes.color.length > 5 && (
                                <div className="w-6 h-6 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center">
                                  <span className="text-[9px] font-bold text-gray-600">
                                    +{wooProduct.attributes.color.length - 5}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })()}

                      {/* Técnicas de impresión */}
                      {(() => {
                        const wooProduct = product as unknown as WooCommerceProduct
                        return wooProduct.attributes?.tecnicaImpresion && wooProduct.attributes.tecnicaImpresion.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {wooProduct.attributes.tecnicaImpresion.slice(0, 2).map((tech: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-[10px] py-0 h-5 border-gray-300">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )
                      })()}

                      <Separator className="my-3" />

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xl font-bold text-primary">{product.price}</span>
                          {(() => {
                            const wooProduct = product as unknown as WooCommerceProduct
                            return wooProduct.minQuantity && wooProduct.minQuantity > 1 && (
                              <span className="text-[10px] text-muted-foreground">Min: {wooProduct.minQuantity} pzs</span>
                            )
                          })()}
                        </div>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/productos/${product.id}`)
                          }}
                        >
                          Ver más
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Results count */}
            {filteredProducts.length > 0 && (
              <div className="mt-6 text-sm text-muted-foreground text-center">
                Mostrando {filteredProducts.length} de {allProducts.length} productos
              </div>
            )}

            {/* CTA Section */}
            <Card className="mt-12 bg-primary/5">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">¿No encuentras lo que buscas?</h2>
                <p className="text-muted-foreground mb-6">
                  Contamos con más de 5,000 productos promocionales disponibles. Contáctanos y te ayudamos a encontrar
                  el producto perfecto para tu marca.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Solicitar Catálogo Completo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
