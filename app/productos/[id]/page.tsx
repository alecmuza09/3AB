"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Sidebar } from "@/components/sidebar"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Ruler,
  Palette,
  Printer,
  Box,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  MessageCircle,
  Share2,
  Star,
} from "lucide-react"
import { useSupabase } from "@/lib/supabase-client"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import { getProductByIdFromSupabase, SupabaseProduct } from "@/lib/all-products"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = useSupabase()
  const { addToCart } = useCart()
  const productId = params.id as string

  const [product, setProduct] = useState<SupabaseProduct | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [customization, setCustomization] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) {
        setLoading(false)
        return
      }

      try {
        const foundProduct = await getProductByIdFromSupabase(productId)
        if (foundProduct) {
          setProduct(foundProduct)
          setQuantity(foundProduct.min_quantity || 1)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="md:ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">Cargando producto...</div>
          </div>
        </main>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="md:ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            <Card className="p-8 text-center">
              <CardContent>
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Producto no encontrado</h2>
                <p className="text-muted-foreground mb-6">
                  El producto que buscas no existe o ya no está disponible.
                </p>
                <Button onClick={() => router.push("/productos")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a productos
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // Obtener datos del producto
  const currentPrice = product?.price || 0
  const currentStock = product?.stock || 0
  const minQuantity = product?.min_quantity || 1
  const multipleOf = 1 // Por ahora, se puede ajustar después

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
    return colorMap[normalized] || "#9CA3AF" // gris por defecto
  }

  const handleAddToCart = () => {
    if (!product) return

    if (quantity < minQuantity) {
      toast.error(`La cantidad mínima es ${minQuantity}`)
      return
    }

    // Agregar producto al carrito
    addToCart(
      {
        id: product.id,
        name: product.name,
        description: product.description || "",
        price: product.price,
        image: product.image_url || "",
        category: product.category?.name || "",
      },
      quantity,
      undefined,
      customization
    )
    toast.success("Producto agregado al carrito")
  }

  const handleRequestQuote = () => {
    // Redirigir a la página de cotizaciones con el producto pre-seleccionado
    router.push(`/cotizaciones?product=${productId}&quantity=${quantity}`)
  }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + multipleOf)
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(minQuantity, prev - multipleOf))
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <WhatsappButton />

      <main className="md:ml-64">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push("/productos")}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a productos
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Imagen del producto */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-0">
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                      <Image
                        src={product.image_url || `/placeholder.svg?height=600&width=600&query=${product.name}`}
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority
                      />
                      {currentStock > 0 && (
                        <Badge className="absolute top-4 left-4 bg-green-500">
                          En stock: {currentStock}
                        </Badge>
                      )}
                      {currentStock === 0 && (
                        <Badge className="absolute top-4 left-4 bg-red-500">
                          Sin stock
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Información del producto */}
              <div className="space-y-6">
                <div>
                  {product.category && (
                    <Badge variant="outline" className="mb-2">
                      {product.category.name}
                    </Badge>
                  )}
                  <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                  {product.rating > 0 && (
                    <div className="flex items-center gap-3 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-5 w-5 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-gray-300"}`} 
                        />
                      ))}
                      <span className="text-sm font-medium ml-1">{product.rating.toFixed(1)}</span>
                      {product.review_count > 0 && (
                        <span className="text-sm text-muted-foreground">({product.review_count} reseñas)</span>
                      )}
                    </div>
                  )}
                  
                  <Card className="mb-4 bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-primary">
                          {currentPrice > 0
                            ? `$${currentPrice.toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : "Consultar precio"}
                        </span>
                      </div>
                      {minQuantity > 1 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Precio por pieza · Pedido mínimo: {minQuantity} {minQuantity === 1 ? "pieza" : "piezas"}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  
                  {product.description && (
                    <p className="text-base text-muted-foreground leading-relaxed">{product.description}</p>
                  )}
                </div>

                <Separator />

                {/* Variaciones con Color Swatches - Por ahora deshabilitado hasta implementar variaciones en Supabase */}
                {false && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-lg font-semibold mb-2 block">Color Disponible</Label>
                      {selectedVariation && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Seleccionado: <span className="font-medium text-foreground">{selectedVariation.color || selectedVariation.name}</span>
                          {selectedVariation.stock > 0 && (
                            <span className="text-green-600 ml-2">• {selectedVariation.stock} disponibles</span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {productVariations.map((variation) => {
                        const colorName = variation.color || variation.name || ""
                        const colorHex = getColorHex(colorName)
                        const isSelected = selectedVariation?.id === variation.id
                        const isOutOfStock = variation.stock === 0

                        return (
                          <button
                            key={variation.id}
                            onClick={() => setSelectedVariation(variation)}
                            disabled={isOutOfStock}
                            className={`group relative flex flex-col items-center gap-2 p-2 rounded-lg transition-all ${
                              isSelected
                                ? "ring-2 ring-primary ring-offset-2"
                                : "hover:ring-2 hover:ring-gray-300"
                            } ${isOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            title={colorName}
                          >
                            {/* Color Swatch */}
                            <div
                              className={`w-12 h-12 rounded-full shadow-md transition-transform group-hover:scale-110 ${
                                colorHex === "#FFFFFF" ? "border-2 border-gray-300" : ""
                              } ${isOutOfStock ? "relative overflow-hidden" : ""}`}
                              style={{ backgroundColor: colorHex }}
                            >
                              {isOutOfStock && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                  <div className="w-full h-0.5 bg-white rotate-45"></div>
                                </div>
                              )}
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <CheckCircle className="h-6 w-6 text-white drop-shadow-lg" />
                                </div>
                              )}
                            </div>
                            
                            {/* Color Name */}
                            <span className={`text-xs font-medium text-center ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                              {colorName}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Atributos - Por ahora deshabilitado hasta implementar atributos en Supabase */}
                {false && (
                  <div>
                    <Label className="text-lg font-semibold mb-3 block">Especificaciones</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {productAttributes.medidas && (
                        <Card className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Ruler className="h-5 w-5 text-primary" />
                              <Label className="text-sm font-semibold">Medidas</Label>
                            </div>
                            <p className="text-sm text-foreground font-medium">{productAttributes.medidas}</p>
                          </CardContent>
                        </Card>
                      )}

                      {productAttributes.material && (
                        <Card className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Box className="h-5 w-5 text-primary" />
                              <Label className="text-sm font-semibold">Material</Label>
                            </div>
                            <p className="text-sm text-foreground font-medium">{productAttributes.material}</p>
                          </CardContent>
                        </Card>
                      )}

                      {productAttributes.areaImpresion && (
                        <Card className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Printer className="h-5 w-5 text-primary" />
                              <Label className="text-sm font-semibold">Área de impresión</Label>
                            </div>
                            <p className="text-sm text-foreground font-medium">
                              {productAttributes.areaImpresion}
                            </p>
                          </CardContent>
                        </Card>
                      )}

                      {printingTechniques.length > 0 && (
                        <Card className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Printer className="h-5 w-5 text-primary" />
                              <Label className="text-sm font-semibold">Técnicas disponibles</Label>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {printingTechniques.map((tech, index) => (
                                <Badge key={index} className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {productAttributes.capacidad && productAttributes.capacidad !== "Dato no disponible" && (
                        <Card className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Package className="h-5 w-5 text-primary" />
                              <Label className="text-sm font-semibold">Capacidad</Label>
                            </div>
                            <p className="text-sm text-foreground font-medium">{productAttributes.capacidad}</p>
                          </CardContent>
                        </Card>
                      )}

                      {!isLegacy && (product as WooCommerceProduct).weight && (
                        <Card className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Package className="h-5 w-5 text-primary" />
                              <Label className="text-sm font-semibold">Peso</Label>
                            </div>
                            <p className="text-sm text-foreground font-medium">{(product as WooCommerceProduct).weight} kg</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Cantidad y personalización */}
                <Card className="bg-muted/30">
                  <CardContent className="p-6 space-y-5">
                    <div>
                      <Label className="text-lg font-semibold mb-3 block">Cantidad</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={decrementQuantity}
                          disabled={quantity <= (product.minQuantity || 1)}
                          className="h-12 w-12"
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1
                            setQuantity(Math.max(minQuantity, value))
                          }}
                          min={minQuantity}
                          className="w-24 text-center text-xl font-bold h-12"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={incrementQuantity}
                          className="h-12 w-12"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                        <div className="flex flex-col text-sm">
                          {minQuantity > 1 && (
                            <span className="text-muted-foreground">
                              Mínimo: <span className="font-semibold text-foreground">{minQuantity}</span>
                            </span>
                          )}
                          {currentPrice > 0 && (
                            <span className="font-bold text-primary">
                              Total: ${(currentPrice * quantity).toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Palette className="h-5 w-5 text-primary" />
                        <Label htmlFor="customization" className="text-lg font-semibold">
                          Notas de personalización
                        </Label>
                        <Badge variant="outline" className="text-xs">Opcional</Badge>
                      </div>
                      <Textarea
                        id="customization"
                        placeholder="Ejemplo: Logo en el frente, texto en la parte posterior, colores corporativos, etc."
                        value={customization}
                        onChange={(e) => setCustomization(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Describe cómo quieres personalizar este producto. Nuestro equipo te contactará para confirmar detalles.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                {/* Botones de acción */}
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                    onClick={handleAddToCart}
                    disabled={currentStock === 0}
                  >
                    <ShoppingCart className="h-6 w-6 mr-2" />
                    {currentStock === 0 ? "Sin stock" : "Agregar al carrito"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-14 text-lg border-2 border-primary text-primary hover:bg-primary hover:text-white"
                    onClick={handleRequestQuote}
                  >
                    <MessageCircle className="h-6 w-6 mr-2" />
                    Solicitar cotización personalizada
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: product.name,
                            text: product.description,
                            url: window.location.href,
                          })
                        } else {
                          navigator.clipboard.writeText(window.location.href)
                          toast.success("Enlace copiado al portapapeles")
                        }
                      }}
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Compartir
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        window.open(`https://wa.me/525545678901?text=Hola, me interesa el producto: ${product.name}`, "_blank")
                      }}
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>

                {/* Información adicional */}
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-sm mb-3 text-foreground">✨ Beneficios incluidos</h3>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500 rounded-full p-1">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">Personalización profesional incluida</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500 rounded-full p-1">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">Envío a toda la República Mexicana</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500 rounded-full p-1">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">Asesoría especializada sin costo</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

