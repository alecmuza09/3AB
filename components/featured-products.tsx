"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart } from "lucide-react"
import { useSupabase } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  rating: number
  review_count: number
  category_id: string | null
  is_featured: boolean
  is_active: boolean
  category?: {
    name: string
  }
}

export function FeaturedProducts() {
  const supabase = useSupabase()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedProducts() {
      if (!supabase) return

      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            category:categories(name)
          `)
          .eq("is_active", true)
          .eq("is_featured", true)
          .order("created_at", { ascending: false })
          .limit(6)

        if (error) {
          console.error("Error fetching featured products:", error)
          return
        }

        setProducts(data || [])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [supabase])

  if (loading) {
    return (
      <section id="productos" className="py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground">Cargando productos...</p>
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null // No mostrar sección si no hay productos destacados
  }

  return (
    <section id="productos" className="py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <Badge className="bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20 px-4 py-1.5">
            Productos Destacados
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-black">
            Los más <span className="text-[#DC2626]">populares</span> de nuestra colección
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre los productos más solicitados por nuestros clientes, perfectos para cualquier campaña promocional.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-xl transition-all duration-300 border border-gray-200 rounded-xl bg-white cursor-pointer"
              onClick={() => router.push(`/productos/${product.id}`)}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-xl">
                  <Image
                    src={product.image_url || "/placeholder.svg?height=250&width=300"}
                    alt={product.name}
                    width={300}
                    height={250}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Category Badge */}
                  {product.category && (
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                        {product.category.name}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.rating.toFixed(1)} ({product.review_count || 0})
                      </span>
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold group-hover:text-[#DC2626] transition-colors">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    )}
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1">
                      <span className="text-lg font-bold text-[#DC2626]">
                        ${product.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-gray-500 block">por unidad</span>
                    </div>

                    <Button
                      size="sm"
                      className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/productos/${product.id}`)
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/productos">
            <Button size="lg" className="bg-[#DC2626] hover:bg-[#B91C1C] text-white">
              Ver Todos los Productos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
