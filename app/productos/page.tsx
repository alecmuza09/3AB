"use client"

import { TopHeader } from "@/components/top-header"
import { Footer } from "@/components/footer"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Search, Star, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-client"
import { useState, useEffect } from "react"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  min_price?: number | null
  max_price?: number | null
  image_url: string | null
  rating: number
  review_count: number
  stock_quantity: number | null
  min_quantity?: number | null
  multiple_of?: number | null
  category_id: string | null
  is_featured?: boolean
  is_bestseller?: boolean
  category?: {
    id: string
    name: string
    slug: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
  is_active: boolean
}

export default function ProductosPage() {
  const router = useRouter()
  const supabase = useSupabase()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar categorías desde Supabase
  useEffect(() => {
    async function fetchCategories() {
      if (!supabase) return

      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("name", { ascending: true })

        if (error) {
          console.error("Error fetching categories:", error)
          return
        }

        setCategories(data || [])
      } catch (error) {
        console.error("Error:", error)
      }
    }

    fetchCategories()
  }, [supabase])

  // Cargar productos desde Supabase
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    const client = supabase
    let cancelled = false

    async function fetchProducts() {
      try {
        // Query: productos + categoría (sin join a product_images para mayor compatibilidad)
        let query = client
          .from("products")
          .select(`*, category:categories(id, name, slug)`)
          .eq("is_active", true)

        if (selectedCategoryId) {
          query = query.eq("category_id", selectedCategoryId)
        }

        const { data, error } = await query
          .order("created_at", { ascending: false })
          .limit(200)

        if (cancelled) return

        if (error) {
          console.error("Error fetching products:", error)
          setProducts([])
          return
        }

        setProducts(data || [])
      } catch (error) {
        if (!cancelled) {
          console.error("Error:", error)
          setProducts([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProducts()
    return () => { cancelled = true }
  }, [supabase, selectedCategoryId])

  // Filtrar productos por búsqueda (sin hook para evitar desajustes de hooks en producción)
  const filteredProducts = (() => {
    if (!searchTerm) return products

    const term = searchTerm.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
    )
  })()

  return (
    <div className="min-h-screen bg-white">
      <TopHeader />
      <WhatsappButton />

      <main>
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
                  <h1 className="text-4xl font-bold text-black mb-2">Catálogo de Productos</h1>
                  <p className="text-lg text-gray-600">
                    {products.length > 0
                      ? `${products.length} productos promocionales personalizables de alta calidad.`
                      : "Productos promocionales personalizables de alta calidad."}
                  </p>
                </div>
                {filteredProducts.length > 0 && (
                  <Badge className="bg-[#DC2626] text-white text-lg px-4 py-2">
                    {filteredProducts.length} productos
                  </Badge>
                )}
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="mb-8 border border-gray-200">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Buscar por nombre o descripción..."
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
                    <Badge
                      variant={selectedCategoryId === null ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        selectedCategoryId === null
                          ? "bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                          : "hover:bg-gray-100"
                      } whitespace-nowrap px-3 py-1.5`}
                      onClick={() => setSelectedCategoryId(null)}
                    >
                      Todos
                    </Badge>
                    {categories.map((category) => (
                      <Badge
                        key={category.id}
                        variant={selectedCategoryId === category.id ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          selectedCategoryId === category.id
                            ? "bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                            : "hover:bg-gray-100"
                        } whitespace-nowrap px-3 py-1.5`}
                        onClick={() => setSelectedCategoryId(category.id)}
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
              <Card className="p-8 text-center">
                <CardContent>
                  <p className="text-gray-600">Cargando productos...</p>
                </CardContent>
              </Card>
            )}

            {/* Products Grid */}
            {!loading && filteredProducts.length === 0 && (
              <Card className="p-8 text-center border border-gray-200">
                <CardContent>
                  <p className="text-gray-600">
                    {searchTerm || selectedCategoryId
                      ? "No se encontraron productos con los filtros seleccionados."
                      : "Aún no hay productos disponibles. Pronto agregaremos nuestro catálogo completo."}
                  </p>
                </CardContent>
              </Card>
            )}

            {!loading && filteredProducts.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product, index) => {
                    // Determinar badge según características del producto
                    let badgeLabel = null
                    let badgeColor = "bg-[#DC2626]"
                    if (product.is_featured) {
                      badgeLabel = "Bestseller"
                    } else if (product.is_bestseller) {
                      badgeLabel = "Nuevo"
                    } else if (product.stock_quantity !== null && product.stock_quantity < 20) {
                      badgeLabel = "Oferta"
                      badgeColor = "bg-black"
                    }

                    return (
                      <Card
                        key={product.id}
                        className="group hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 rounded-lg bg-gray-50"
                        onClick={() => router.push(`/productos/${product.id}`)}
                      >
                        <CardHeader className="p-0">
                          <div className="relative overflow-hidden rounded-t-lg bg-white">
                            <Image
                              src={product.image_url || `/placeholder.svg?height=200&width=300&query=${product.name}`}
                              alt={product.name}
                              width={300}
                              height={200}
                              className="w-full h-48 object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                              loading={index < 8 ? "eager" : "lazy"}
                              priority={index < 4}
                            />
                            {badgeLabel && (
                              <Badge className={`absolute top-2 left-2 ${badgeColor} text-white text-xs`}>
                                {badgeLabel}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                          {product.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                            </div>
                          )}
                          <CardTitle className="text-base font-bold line-clamp-2 text-black">
                            {product.name}
                          </CardTitle>
                          {product.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                          <div className="flex items-baseline gap-2 pt-2">
                            <span className="text-xl font-bold text-[#DC2626]">
                              ${product.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </span>
                            {product.min_price && product.max_price && product.max_price > product.min_price && (
                              <>
                                <span className="text-sm text-gray-400 line-through">
                                  ${product.max_price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {Math.round(((product.max_price - product.min_price) / product.max_price) * 100)}% OFF
                                </span>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Results count */}
                <div className="mt-6 text-sm text-gray-600 text-center">
                  Mostrando {filteredProducts.length} de {products.length} productos
                </div>
              </>
            )}

            {/* CTA Section */}
            <Card className="mt-12 bg-gray-50 border border-gray-200">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4 text-black">¿No encuentras lo que buscas?</h2>
                <p className="text-gray-600 mb-6">
                  Contamos con una amplia variedad de productos promocionales disponibles. Contáctanos y te ayudamos a encontrar
                  el producto perfecto para tu marca.
                </p>
                <Button size="lg" className="bg-[#DC2626] hover:bg-[#B91C1C] text-white">
                  Solicitar Catálogo Completo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
