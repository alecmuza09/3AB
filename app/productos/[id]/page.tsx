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
} from "lucide-react"
import { getTotalStock, WooCommerceProduct, ProductVariation } from "@/lib/woocommerce-products"
import { getAnyProductById, isLegacyProduct, LegacyProduct } from "@/lib/all-products"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const productId = params.id as string

  const [product, setProduct] = useState<WooCommerceProduct | LegacyProduct | null>(null)
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [customization, setCustomization] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const foundProduct = getAnyProductById(productId)
    if (foundProduct) {
      setProduct(foundProduct)
      // Si tiene variaciones, seleccionar la primera por defecto
      if (!isLegacyProduct(foundProduct) && foundProduct.variations && foundProduct.variations.length > 0) {
        setSelectedVariation(foundProduct.variations[0])
      }
    }
    setLoading(false)
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

  // Verificar si es un producto legacy
  const isLegacy = isLegacyProduct(product!)
  
  // Obtener datos del producto
  const totalStock = isLegacy ? product.stock : getTotalStock(product as WooCommerceProduct)
  const currentPrice = isLegacy 
    ? 0 
    : (selectedVariation?.price || (product as WooCommerceProduct).price)
  const currentStock = isLegacy 
    ? product.stock 
    : (selectedVariation?.stock || (product as WooCommerceProduct).stock || totalStock)
  const availableColors = isLegacy ? [] : ((product as WooCommerceProduct).attributes?.color || [])
  const printingTechniques = isLegacy ? [] : ((product as WooCommerceProduct).attributes?.tecnicaImpresion || [])
  const productAttributes = isLegacy ? null : (product as WooCommerceProduct).attributes
  const productVariations = isLegacy ? [] : ((product as WooCommerceProduct).variations || [])
  const minQuantity = isLegacy ? 1 : ((product as WooCommerceProduct).minQuantity || 1)
  const multipleOf = isLegacy ? 1 : ((product as WooCommerceProduct).multipleOf || 1)
  const productType = isLegacy ? "simple" : (product as WooCommerceProduct).type
  const productSku = isLegacy ? "" : (product as WooCommerceProduct).sku

  const handleAddToCart = () => {
    if (isLegacy) {
      // Para productos legacy, redirigir a cotizaciones
      handleRequestQuote()
      return
    }

    const wooProduct = product as WooCommerceProduct
    
    if (wooProduct.type === "variable" && !selectedVariation && wooProduct.variations && wooProduct.variations.length > 0) {
      toast.error("Por favor selecciona una variación del producto")
      return
    }

    if (quantity < minQuantity) {
      toast.error(`La cantidad mínima es ${minQuantity}`)
      return
    }

    addToCart(wooProduct, quantity, selectedVariation?.id, customization)
    toast.success("Producto agregado al carrito")
  }

  const handleRequestQuote = () => {
    // Redirigir a la página de cotizaciones con el producto pre-seleccionado
    router.push(`/cotizaciones?product=${productId}&variation=${selectedVariation?.id || ""}&quantity=${quantity}`)
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
                        src={product.image || `/placeholder.svg?height=600&width=600&query=${product.name}`}
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
                  <Badge variant="outline" className="mb-2">
                    {product.category}
                  </Badge>
                  <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl font-bold text-primary">
                      {isLegacy 
                        ? (product as LegacyProduct).price
                        : currentPrice > 0
                        ? `$${currentPrice.toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : "Consultar precio"}
                    </span>
                    {!isLegacy && productSku && (
                      <Badge variant="secondary">SKU: {productSku}</Badge>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground">{product.description}</p>
                </div>

                <Separator />

                {/* Variaciones */}
                {!isLegacy && productVariations.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {productVariations.map((variation) => (
                        <Button
                          key={variation.id}
                          variant={selectedVariation?.id === variation.id ? "default" : "outline"}
                          onClick={() => setSelectedVariation(variation)}
                          disabled={variation.stock === 0}
                          className="flex flex-col items-center gap-1 h-auto py-3 px-4"
                        >
                          <span>{variation.color || variation.name}</span>
                          {variation.stock > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Stock: {variation.stock}
                            </span>
                          )}
                          {variation.stock === 0 && (
                            <span className="text-xs text-red-500">Sin stock</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Atributos */}
                {!isLegacy && productAttributes && (
                  <div className="grid grid-cols-2 gap-4">
                    {productAttributes.medidas && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Ruler className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm font-semibold">Medidas</Label>
                          </div>
                          <p className="text-sm text-muted-foreground">{productAttributes.medidas}</p>
                        </CardContent>
                      </Card>
                    )}

                    {productAttributes.material && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Box className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm font-semibold">Material</Label>
                          </div>
                          <p className="text-sm text-muted-foreground">{productAttributes.material}</p>
                        </CardContent>
                      </Card>
                    )}

                    {productAttributes.areaImpresion && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Printer className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm font-semibold">Área de impresión</Label>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {productAttributes.areaImpresion}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {printingTechniques.length > 0 && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Printer className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm font-semibold">Técnicas de impresión</Label>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {printingTechniques.map((tech, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {productAttributes.capacidad && productAttributes.capacidad !== "Dato no disponible" && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm font-semibold">Capacidad</Label>
                          </div>
                          <p className="text-sm text-muted-foreground">{productAttributes.capacidad}</p>
                        </CardContent>
                      </Card>
                    )}

                    {!isLegacy && (product as WooCommerceProduct).weight && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm font-semibold">Peso</Label>
                          </div>
                          <p className="text-sm text-muted-foreground">{(product as WooCommerceProduct).weight} kg</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                <Separator />

                {/* Cantidad y personalización */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-lg font-semibold mb-2 block">Cantidad</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={decrementQuantity}
                        disabled={quantity <= (product.minQuantity || 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1
                          const min = product.minQuantity || 1
                          setQuantity(Math.max(min, value))
                        }}
                        min={product.minQuantity || 1}
                        className="w-20 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={incrementQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      {product.minQuantity && (
                        <span className="text-sm text-muted-foreground">
                          Mínimo: {product.minQuantity}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customization" className="text-lg font-semibold mb-2 block">
                      Notas de personalización (opcional)
                    </Label>
                    <Textarea
                      id="customization"
                      placeholder="Describe cómo quieres personalizar este producto..."
                      value={customization}
                      onChange={(e) => setCustomization(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                {/* Botones de acción */}
                <div className="space-y-3">
                  {!isLegacy && (
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleAddToCart}
                      disabled={currentStock === 0}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Agregar al carrito
                    </Button>
                  )}
                  <Button
                    size="lg"
                    variant={isLegacy ? "default" : "outline"}
                    className="w-full"
                    onClick={handleRequestQuote}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Solicitar cotización
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
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
                    Compartir producto
                  </Button>
                </div>

                {/* Información adicional */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Personalización incluida</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Envío disponible</span>
                      </div>
                      {!isLegacy && productAttributes?.proveedor && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>Proveedor: {productAttributes.proveedor}</span>
                        </div>
                      )}
                      {isLegacy && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>Calificación: {(product as LegacyProduct).rating}/5.0</span>
                        </div>
                      )}
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

