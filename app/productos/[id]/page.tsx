"use client"

import { useMemo, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { TopHeader } from "@/components/top-header"
import { Footer } from "@/components/footer"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Search,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import type { SupabaseProduct } from "@/lib/all-products"
import type { CotizadorService } from "@/lib/cotizador"
import { generateQuotation, getServiceName } from "@/lib/cotizador"
import { getQuantityValidationError, normalizeQuantityToRules } from "@/lib/quantity"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const productId = params.id as string

  const [product, setProduct] = useState<SupabaseProduct | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [customization, setCustomization] = useState("")
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<SupabaseProduct[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  // Cotizador por producto (personalización)
  const [service, setService] = useState<CotizadorService | "none">("none")
  const [colors, setColors] = useState<string>("1")
  const [size, setSize] = useState<string>("5-12cm")
  const [includePlaca, setIncludePlaca] = useState(false)
  const [includePonchado, setIncludePonchado] = useState(false)
  const [includeTratamiento, setIncludeTratamiento] = useState(false)

  // Diálogo "Seleccionar producto" en la calculadora
  const [openSelectProduct, setOpenSelectProduct] = useState(false)
  const [catalogProducts, setCatalogProducts] = useState<SupabaseProduct[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [searchProductTerm, setSearchProductTerm] = useState("")

  useEffect(() => {
    if (!productId) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    async function loadFromApi() {
      try {
        const res = await fetch("/api/products?activeOnly=true")
        const json = await res.json().catch(() => ({ products: [] }))
        const all = (json.products || []) as SupabaseProduct[]

        if (cancelled) return

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)
        const current = isUuid
          ? all.find((p) => p.id === productId)
          : all.find((p) => p.slug === productId)

        if (!current) {
          setProduct(null)
          return
        }

        setProduct(current)
        setQuantity(Number((current as any).min_quantity) || 1)

        // Calcular relacionados usando el mismo listado
        const attrs = (current as any).attributes || {}
        const relatedIds: string[] = Array.isArray(attrs.related_product_ids)
          ? attrs.related_product_ids.filter(Boolean)
          : []

        let related: SupabaseProduct[] = []
        if (relatedIds.length > 0) {
          const byId = new Map(all.map((p) => [p.id, p]))
          related = relatedIds.map((id) => byId.get(id)).filter(Boolean) as SupabaseProduct[]
        }

        if (related.length === 0) {
          related = all
            .filter((p) => p.id !== current.id && p.category_id === current.category_id)
            .slice(0, 4)
        }

        setRelatedProducts(related)
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching product from API:", error)
          setProduct(null)
          setRelatedProducts([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadFromApi()
    return () => {
      cancelled = true
    }
  }, [productId])

  const allowedServices = useMemo(() => {
    const techniquesRaw = (product as any)?.attributes?.printing_technique
    const techniques = Array.isArray(techniquesRaw) ? (techniquesRaw as string[]) : []

    const services = new Set<CotizadorService>()

    for (const t of techniques) {
      const normalized = String(t).toLowerCase()
      if (normalized.includes("bordad")) services.add("bordado")
      if (normalized.includes("laser") || normalized.includes("láser") || normalized.includes("lazer")) services.add("laser")
      if (normalized.includes("tampo") || normalized.includes("serig")) services.add("tampografia")
    }

    // Si no hay técnicas definidas aún (catálogo no validado), permitir todo
    if (services.size === 0) {
      return ["tampografia", "vidrio-metal", "laser", "bordado"] as CotizadorService[]
    }

    // "vidrio-metal" es un modo de cálculo alternativo; lo habilitamos si hay tampografía/serigrafía
    if (services.has("tampografia")) {
      services.add("vidrio-metal")
    }

    return Array.from(services)
  }, [product])

  useEffect(() => {
    if (service !== "none" && !allowedServices.includes(service)) {
      setService("none")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedServices])

  // loadingRelated se controla ahora con el mismo fetch del producto (API)
  useEffect(() => {
    // ya no hacemos llamadas separadas; mantener efecto vacío para no romper orden de hooks si se añadiera lógica futura
    setLoadingRelated(false)
  }, [product])

  // Cargar catálogo cuando se abre el diálogo "Seleccionar producto" (desde API)
  useEffect(() => {
    if (!openSelectProduct) return
    let cancelled = false
    setLoadingCatalog(true)
    fetch("/api/products?activeOnly=true")
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setCatalogProducts((j.products || []) as SupabaseProduct[])
      })
      .finally(() => {
        if (!cancelled) setLoadingCatalog(false)
      })
    return () => { cancelled = true }
  }, [openSelectProduct])

  // Hooks deben ejecutarse siempre en el mismo orden (antes de cualquier return)
  const minQuantity = product?.min_quantity || 1
  const multipleOf = product?.multiple_of || 1
  const quantityRules = useMemo(
    () => ({ min: minQuantity, multipleOf }),
    [minQuantity, multipleOf]
  )
  const personalizationQuote = useMemo(() => {
    if (!service || service === "none") return null
    if (!allowedServices.includes(service)) return null
    if (!quantity || quantity <= 0) return null
    return generateQuotation(
      service,
      quantity,
      service === "tampografia" || service === "vidrio-metal" ? parseInt(colors) : undefined,
      service === "bordado" ? size : undefined,
      {
        placa: includePlaca,
        ponchado: includePonchado,
        tratamiento: includeTratamiento,
      }
    )
  }, [service, allowedServices, quantity, colors, size, includePlaca, includePonchado, includeTratamiento])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopHeader />
        <main className="p-6">
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
        <TopHeader />
        <main className="p-6">
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

  // Obtener datos del producto (minQuantity, multipleOf, quantityRules, personalizationQuote ya definidos arriba)
  const currentPrice = product?.price || 0
  const currentStock = product?.stock_quantity ?? 0

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

    const error = getQuantityValidationError(quantity, quantityRules)
    if (error) {
      const normalized = normalizeQuantityToRules(quantity, quantityRules)
      setQuantity(normalized)
      toast.error(error)
      return
    }

    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price,
      image: product.image_url || "",
      category: product.category?.name || "",
      categoryId: product.category_id,
      minQuantity,
      multipleOf,
    }

    const result = addToCart({
      product: cartProduct,
      quantity,
      customization,
      quoteConfig: service !== "none"
        ? {
            service,
            colors: service === "tampografia" || service === "vidrio-metal" ? parseInt(colors) : undefined,
            size: service === "bordado" ? size : undefined,
            includeExtras: {
              placa: includePlaca,
              ponchado: includePonchado,
              tratamiento: includeTratamiento,
            },
          }
        : undefined,
    })

    if (result.error) {
      toast.error(result.error)
      if (result.adjustedQuantity) {
        setQuantity(result.adjustedQuantity)
      }
      return
    }

    if (result.adjustedQuantity) {
      setQuantity(result.adjustedQuantity)
      toast.info(`Ajustamos la cantidad a ${result.adjustedQuantity} por reglas del producto.`)
    }

    toast.success("Producto agregado al carrito")
  }

  const handleRequestQuote = () => {
    // Redirigir a la página de cotizaciones con el producto pre-seleccionado
    router.push(`/cotizaciones?product=${productId}&quantity=${quantity}`)
  }

  const incrementQuantity = () => {
    setQuantity((prev) => normalizeQuantityToRules(prev + multipleOf, quantityRules))
  }

  const decrementQuantity = () => {
    setQuantity((prev) => normalizeQuantityToRules(Math.max(minQuantity, prev - multipleOf), quantityRules))
  }

  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <WhatsappButton />

      <main>
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

                {/* Pestañas: Descripción e Información del producto (medidas, peso, proveedor) */}
                {(() => {
                  const attrs = (product as any).attributes || {}
                  const dims = (product as any).dimensions
                  const weight = (product as any).weight
                  const medidas = attrs.medidas || (dims && typeof dims === "object" && [dims.length, dims.width, dims.height].filter(Boolean).length
                    ? `${[dims.length, dims.width, dims.height].filter(Boolean).join(" × ")} cm`
                    : null)
                  const material = attrs.material || null
                  const areaImpresion = attrs.area_impresion || attrs.areaImpresion || null
                  const capacidad = attrs.capacidad || null
                  const techniquesRaw = attrs.printing_technique
                  const techniques = Array.isArray(techniquesRaw) ? techniquesRaw : techniquesRaw ? [techniquesRaw] : []
                  const hasAnySpec = weight != null || medidas || material || areaImpresion || (capacidad && capacidad !== "Dato no disponible") || techniques.length > 0
                  return (
                    <Tabs defaultValue="descripcion" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="descripcion">Descripción</TabsTrigger>
                        <TabsTrigger value="especificaciones">Información del producto</TabsTrigger>
                      </TabsList>
                      <TabsContent value="descripcion" className="mt-3">
                        {product.description ? (
                          <p className="text-base text-muted-foreground leading-relaxed">{product.description}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Sin descripción adicional.</p>
                        )}
                      </TabsContent>
                      <TabsContent value="especificaciones" className="mt-3">
                        {hasAnySpec ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {weight != null && (
                              <Card className="border-l-4 border-l-primary">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Package className="h-5 w-5 text-primary" />
                                    <Label className="text-sm font-semibold">Peso</Label>
                                  </div>
                                  <p className="text-sm text-foreground font-medium">{Number(weight)} kg</p>
                                </CardContent>
                              </Card>
                            )}
                            {medidas && (
                              <Card className="border-l-4 border-l-primary">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Ruler className="h-5 w-5 text-primary" />
                                    <Label className="text-sm font-semibold">Medidas</Label>
                                  </div>
                                  <p className="text-sm text-foreground font-medium">{String(medidas)}</p>
                                </CardContent>
                              </Card>
                            )}
                            {dims && typeof dims === "object" && (dims.length != null || dims.width != null || dims.height != null) && !medidas && (
                              <Card className="border-l-4 border-l-primary">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Ruler className="h-5 w-5 text-primary" />
                                    <Label className="text-sm font-semibold">Dimensiones</Label>
                                  </div>
                                  <p className="text-sm text-foreground font-medium">
                                    {[dims.length, dims.width, dims.height].filter(Boolean).join(" × ")} cm
                                  </p>
                                </CardContent>
                              </Card>
                            )}
                            {material && (
                              <Card className="border-l-4 border-l-primary">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Box className="h-5 w-5 text-primary" />
                                    <Label className="text-sm font-semibold">Material</Label>
                                  </div>
                                  <p className="text-sm text-foreground font-medium">{String(material)}</p>
                                </CardContent>
                              </Card>
                            )}
                            {areaImpresion && (
                              <Card className="border-l-4 border-l-primary">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Printer className="h-5 w-5 text-primary" />
                                    <Label className="text-sm font-semibold">Área de impresión</Label>
                                  </div>
                                  <p className="text-sm text-foreground font-medium">{String(areaImpresion)}</p>
                                </CardContent>
                              </Card>
                            )}
                            {capacidad && capacidad !== "Dato no disponible" && (
                              <Card className="border-l-4 border-l-primary">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Package className="h-5 w-5 text-primary" />
                                    <Label className="text-sm font-semibold">Capacidad</Label>
                                  </div>
                                  <p className="text-sm text-foreground font-medium">{String(capacidad)}</p>
                                </CardContent>
                              </Card>
                            )}
                            {techniques.length > 0 && (
                              <Card className="border-l-4 border-l-primary md:col-span-2">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Printer className="h-5 w-5 text-primary" />
                                    <Label className="text-sm font-semibold">Técnicas de personalización</Label>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {techniques.map((tech: string, index: number) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tech}
                                      </Badge>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No hay datos de especificaciones cargados para este producto (medidas, peso, material, etc.).</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  )
                })()}

                <Separator />

                {/* Calculadora de precios (producto + personalización) */}
                <Card className="bg-muted/30 border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Calculadora de precios
                      </CardTitle>
                      <Dialog open={openSelectProduct} onOpenChange={setOpenSelectProduct}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="shrink-0">
                            <Search className="h-4 w-4 mr-2" />
                            Seleccionar producto
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
                          <DialogHeader>
                            <DialogTitle>Seleccionar producto</DialogTitle>
                          </DialogHeader>
                          <p className="text-sm text-muted-foreground">
                            Elige un producto para cargar su precio y opciones en la calculadora.
                          </p>
                          <Input
                            placeholder="Buscar por nombre..."
                            value={searchProductTerm}
                            onChange={(e) => setSearchProductTerm(e.target.value)}
                            className="mb-2"
                          />
                          <div className="flex-1 min-h-0 overflow-y-auto border rounded-md p-2 space-y-2">
                            {loadingCatalog && (
                              <p className="text-sm text-muted-foreground py-4 text-center">Cargando productos...</p>
                            )}
                            {!loadingCatalog &&
                              catalogProducts
                                .filter(
                                  (p) =>
                                    !searchProductTerm ||
                                    p.name.toLowerCase().includes(searchProductTerm.toLowerCase())
                                )
                                .map((p) => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                      setProduct(p)
                                      setQuantity(Number(p.min_quantity) || 1)
                                      setService("none")
                                      setOpenSelectProduct(false)
                                      setSearchProductTerm("")
                                      router.replace(`/productos/${p.id}`)
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 text-left transition"
                                  >
                                    <div className="relative w-14 h-14 shrink-0 rounded-md overflow-hidden bg-muted">
                                      <Image
                                        src={p.image_url || `/placeholder.svg?height=56&width=56&query=${p.name}`}
                                        alt={p.name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-sm line-clamp-2">{p.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        ${Number(p.price || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                                      </p>
                                    </div>
                                  </button>
                                ))}
                            {!loadingCatalog && searchProductTerm && catalogProducts.filter((p) => p.name.toLowerCase().includes(searchProductTerm.toLowerCase())).length === 0 && (
                              <p className="text-sm text-muted-foreground py-4 text-center">No hay productos que coincidan.</p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <p className="text-sm text-muted-foreground font-normal">
                      Precio del producto como referencia; personalización y total se calculan aquí.
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-5">
                    {currentPrice > 0 && (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Precio de referencia (por pieza)</span>
                          <span className="text-lg font-bold text-primary">
                            ${currentPrice.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Este es el precio base del producto; la personalización se suma según el servicio que elijas.
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-lg font-semibold mb-3 block">Cantidad</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={decrementQuantity}
                          disabled={quantity <= minQuantity}
                          className="h-12 w-12"
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1
                            setQuantity(normalizeQuantityToRules(Math.max(minQuantity, value), quantityRules))
                          }}
                          min={minQuantity}
                          step={multipleOf}
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
                          {multipleOf > 1 && (
                            <span className="text-muted-foreground">
                              Múltiplos de: <span className="font-semibold text-foreground">{multipleOf}</span>
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

                    {/* Cotizador integrado (personalización opcional) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-semibold">Personalización</Label>
                        <Badge variant="outline" className="text-xs">Opcional</Badge>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="service">Tipo de servicio</Label>
                      <Select value={service} onValueChange={(v) => setService(v as CotizadorService | "none")}>
                          <SelectTrigger id="service">
                          <SelectValue placeholder="Sin personalización (solo producto)" />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="none">Sin personalización</SelectItem>
                            {allowedServices.includes("tampografia") && (
                              <SelectItem value="tampografia">Tampografía / Serigrafía</SelectItem>
                            )}
                            {allowedServices.includes("vidrio-metal") && (
                              <SelectItem value="vidrio-metal">Vidrio / Metal / Rubber</SelectItem>
                            )}
                            {allowedServices.includes("laser") && (
                              <SelectItem value="laser">Grabado Láser</SelectItem>
                            )}
                            {allowedServices.includes("bordado") && (
                              <SelectItem value="bordado">Bordado</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {allowedServices.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Servicios disponibles para este producto según el catálogo.
                          </p>
                        )}
                      </div>

                      {(service === "tampografia" || service === "vidrio-metal") && (
                        <div className="space-y-2">
                          <Label htmlFor="colors">Número de tintas/colores</Label>
                          <Select value={colors} onValueChange={setColors}>
                            <SelectTrigger id="colors">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 color (incluido)</SelectItem>
                              <SelectItem value="2">2 colores</SelectItem>
                              <SelectItem value="3">3 colores</SelectItem>
                              <SelectItem value="4">4 colores</SelectItem>
                              <SelectItem value="5">5 colores</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {service === "bordado" && (
                        <div className="space-y-2">
                          <Label htmlFor="size">Tamaño del diseño</Label>
                          <Select value={size} onValueChange={setSize}>
                            <SelectTrigger id="size">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5-12cm">5-12 cm</SelectItem>
                              <SelectItem value="12-20cm">12-20 cm</SelectItem>
                              <SelectItem value="20-25cm">20-25 cm</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {service !== "none" && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Extras</Label>
                          {(service === "tampografia" || service === "vidrio-metal") && (
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={includePlaca}
                                onChange={(e) => setIncludePlaca(e.target.checked)}
                                className="h-4 w-4"
                              />
                              Placa de tampografía
                            </label>
                          )}
                          {service === "bordado" && (
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={includePonchado}
                                onChange={(e) => setIncludePonchado(e.target.checked)}
                                className="h-4 w-4"
                              />
                              Ponchado de bordado
                            </label>
                          )}
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={includeTratamiento}
                              onChange={(e) => setIncludeTratamiento(e.target.checked)}
                              className="h-4 w-4"
                            />
                            Tratamiento especial
                          </label>
                        </div>
                      )}

                      {personalizationQuote && (
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{getServiceName(personalizationQuote.service)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Personalización (por pieza)</span>
                            <span className="font-semibold">
                              ${personalizationQuote.pricePerUnitWithMargin.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Total personalización</span>
                            <span className="font-semibold">
                              ${personalizationQuote.totalWithMargin.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          {currentPrice > 0 && (
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-muted-foreground">Total estimado (producto + personalización)</span>
                              <span className="font-bold text-primary">
                                ${(currentPrice * quantity + personalizationQuote.totalWithMargin).toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
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
        {/* Productos relacionados */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Productos relacionados</h2>
            <Button variant="ghost" onClick={() => router.push("/productos")}>
              Ver todo
            </Button>
          </div>

          {loadingRelated && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, idx) => (
                <Card key={idx} className="p-4 animate-pulse">
                  <div className="h-36 bg-muted rounded-md mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </Card>
              ))}
            </div>
          )}

          {!loadingRelated && relatedProducts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aún no hay productos relacionados definidos para este artículo.
            </p>
          )}

          {!loadingRelated && relatedProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Card
                  key={p.id}
                  className="cursor-pointer hover:shadow-md transition"
                  onClick={() => router.push(`/productos/${p.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="relative w-full h-36 rounded-md overflow-hidden bg-muted mb-3">
                      <Image
                        src={p.image_url || `/placeholder.svg?height=200&width=300&query=${p.name}`}
                        alt={p.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <p className="font-semibold text-sm line-clamp-2">{p.name}</p>
                    <p className="text-sm text-primary font-bold mt-1">
                      ${Number(p.price || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

