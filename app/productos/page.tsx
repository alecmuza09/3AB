"use client"

import { Sidebar } from "@/components/sidebar"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, Star, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getAllProductsForDisplay } from "@/lib/all-products"
import { useState, useMemo } from "react"

export default function ProductosPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")

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
              <h1 className="text-4xl font-bold text-foreground mb-4">Productos Promocionales</h1>
              <p className="text-lg text-muted-foreground">
                Descubre nuestra amplia gama de productos promocionales de alta calidad de 3A Branding.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Buscar productos..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground whitespace-nowrap"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

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
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-muted-foreground">{product.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                      {product.attributes && (
                        <div className="mb-3 space-y-1">
                          {product.attributes.color && product.attributes.color.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              <strong>Colores:</strong> {product.attributes.color.slice(0, 3).join(", ")}
                              {product.attributes.color.length > 3 && ` +${product.attributes.color.length - 3} más`}
                            </div>
                          )}
                          {product.attributes.tecnicaImpresion && product.attributes.tecnicaImpresion.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              <strong>Técnicas:</strong> {product.attributes.tecnicaImpresion.join(", ")}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">{product.price}</span>
                        <Button
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/productos/${product.id}`)
                          }}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Ver detalles
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
