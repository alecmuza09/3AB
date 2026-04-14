"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/contexts/cart-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Palette,
  Type,
  ImageIcon,
  RotateCcw,
  ShoppingCart,
  FileText,
  Upload,
  X,
} from "lucide-react"

interface ProductCustomizationPreviewProps {
  product: {
    id: string
    name: string
    image?: string
    price?: number
    minQuantity?: number
    category?: string
    attributes?: any
  }
  onRequestQuote?: () => void
}

const LOGO_POSITIONS = [
  { id: "center", label: "Centro", style: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" } },
  { id: "top-center", label: "Arriba", style: { top: "15%", left: "50%", transform: "translateX(-50%)" } },
  { id: "bottom-center", label: "Abajo", style: { bottom: "15%", left: "50%", transform: "translateX(-50%)" } },
  { id: "top-left", label: "Sup. Izq.", style: { top: "15%", left: "15%" } },
  { id: "top-right", label: "Sup. Der.", style: { top: "15%", right: "15%" } },
]

const PRESET_COLORS = ["#DC2626", "#2563EB", "#16A34A", "#D97706", "#7C3AED", "#0F172A", "#FFFFFF"]

const FONT_OPTIONS = [
  { id: "Arial, sans-serif", label: "Arial" },
  { id: "Georgia, serif", label: "Georgia" },
  { id: "'Times New Roman', serif", label: "Times New Roman" },
  { id: "'Courier New', monospace", label: "Courier New" },
]

export function ProductCustomizationPreview({ product, onRequestQuote }: ProductCustomizationPreviewProps) {
  const { addToCart } = useCart()
  const router = useRouter()

  // Customization state
  const [logoText, setLogoText] = useState("TU MARCA")
  const [logoColor, setLogoColor] = useState("#DC2626")
  const [logoFont, setLogoFont] = useState("Arial, sans-serif")
  const [logoSize, setLogoSize] = useState(20)
  const [logoPosition, setLogoPosition] = useState("center")
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null)
  const [logoOpacity, setLogoOpacity] = useState(90)
  const [quantity, setQuantity] = useState(product.minQuantity || 25)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleReset = () => {
    setLogoText("TU MARCA")
    setLogoColor("#DC2626")
    setLogoFont("Arial, sans-serif")
    setLogoSize(20)
    setLogoPosition("center")
    setUploadedLogoUrl(null)
    setLogoOpacity(90)
  }

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen es muy grande. Máximo 5MB.")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUploadedLogoUrl(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const positionStyle = LOGO_POSITIONS.find((p) => p.id === logoPosition)?.style ?? LOGO_POSITIONS[0].style

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price ?? 0,
        image: product.image,
        category: product.category,
        minQuantity: product.minQuantity,
        isActive: true,
        priceMode: "fixed",
        attributes: product.attributes,
      } as any,
      quantity,
      {
        quoteConfig: {
          service: "cotizacion",
          colors: 1,
          size: "custom",
          unitPrice: product.price ?? 0,
          totalPrice: (product.price ?? 0) * quantity,
          notes: logoText ? `Personalización: "${logoText}" en ${logoFont}, color ${logoColor}` : "Sin personalización de texto",
        },
      } as any
    )
    toast.success("Producto agregado al carrito con configuración de personalización")
  }

  const handleRequestQuote = () => {
    if (onRequestQuote) {
      onRequestQuote()
    } else {
      router.push("/cotizaciones")
    }
  }

  const unitPrice = product.price ?? 0
  const totalPrice = unitPrice * quantity

  return (
    <Card className="border border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Personaliza tu producto
          </CardTitle>
          <Badge variant="outline" className="text-xs">Preview interactivo</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Preview Area */}
          <div className="space-y-3">
            <div className="relative bg-white rounded-xl border border-border/40 overflow-hidden" style={{ minHeight: 280 }}>
              {/* Product image */}
              <img
                src={product.image || `/placeholder.svg?height=280&width=280&query=${product.name}`}
                alt={product.name}
                className="w-full h-64 object-contain p-4"
              />

              {/* Logo overlay — text */}
              {!uploadedLogoUrl && logoText && (
                <div
                  className="absolute pointer-events-none select-none"
                  style={{
                    ...positionStyle,
                    color: logoColor,
                    fontFamily: logoFont,
                    fontSize: `${logoSize}px`,
                    fontWeight: "bold",
                    opacity: logoOpacity / 100,
                    textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                    whiteSpace: "nowrap",
                    maxWidth: "80%",
                    textAlign: "center",
                  }}
                >
                  {logoText}
                </div>
              )}

              {/* Logo overlay — uploaded image */}
              {uploadedLogoUrl && (
                <div
                  className="absolute pointer-events-none select-none"
                  style={{ ...positionStyle, opacity: logoOpacity / 100 }}
                >
                  <img
                    src={uploadedLogoUrl}
                    alt="Logo"
                    style={{ width: logoSize * 4, height: logoSize * 4, objectFit: "contain" }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-center">
              <Button size="sm" variant="ghost" onClick={handleReset} className="text-xs">
                <RotateCcw className="h-3 w-3 mr-1" />
                Restablecer
              </Button>
            </div>
          </div>

          {/* Customization Controls */}
          <div className="space-y-4">
            <Tabs defaultValue="texto">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="texto" className="text-xs">
                  <Type className="h-3 w-3 mr-1" />Texto
                </TabsTrigger>
                <TabsTrigger value="imagen" className="text-xs">
                  <ImageIcon className="h-3 w-3 mr-1" />Logo
                </TabsTrigger>
                <TabsTrigger value="posicion" className="text-xs">
                  <Palette className="h-3 w-3 mr-1" />Estilo
                </TabsTrigger>
              </TabsList>

              {/* Texto */}
              <TabsContent value="texto" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Texto del logo</Label>
                  <Input
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value)}
                    placeholder="Tu marca o eslogan"
                    maxLength={40}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Tipografía</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {FONT_OPTIONS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setLogoFont(f.id)}
                        className={`p-2 text-xs border rounded-lg transition-colors ${
                          logoFont === f.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40"
                        }`}
                        style={{ fontFamily: f.id }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Logo / imagen */}
              <TabsContent value="imagen" className="space-y-3 mt-4">
                {uploadedLogoUrl ? (
                  <div className="space-y-2">
                    <div className="relative border border-border rounded-lg p-3 flex items-center gap-3">
                      <img src={uploadedLogoUrl} alt="Logo subido" className="h-12 w-12 object-contain" />
                      <p className="text-xs text-muted-foreground flex-1">Logo cargado — se mostrará en el preview</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => setUploadedLogoUrl(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Sube tu logo (PNG, JPG, SVG)</p>
                    <p className="text-xs text-muted-foreground mt-1">Máx. 5MB</p>
                    <Button size="sm" variant="outline" className="mt-3">
                      Seleccionar archivo
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </TabsContent>

              {/* Estilo / posición */}
              <TabsContent value="posicion" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setLogoColor(c)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          logoColor === c ? "border-primary scale-110" : "border-border hover:scale-105"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={logoColor}
                      onChange={(e) => setLogoColor(e.target.value)}
                      className="w-7 h-7 rounded-full cursor-pointer border border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Posición</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {LOGO_POSITIONS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setLogoPosition(p.id)}
                        className={`p-1.5 text-xs border rounded-lg transition-colors ${
                          logoPosition === p.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Tamaño del logo: {logoSize}px</Label>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    value={logoSize}
                    onChange={(e) => setLogoSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Opacidad: {logoOpacity}%</Label>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    value={logoOpacity}
                    onChange={(e) => setLogoOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-1">
              <Label className="text-xs font-medium">Cantidad</Label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setQuantity(Math.max(product.minQuantity || 1, quantity - 25))}
                >
                  −
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  min={product.minQuantity || 1}
                  onChange={(e) => setQuantity(Math.max(product.minQuantity || 1, Number(e.target.value)))}
                  className="h-8 w-20 text-center"
                />
                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setQuantity(quantity + 25)}>
                  +
                </Button>
              </div>
              {product.minQuantity && quantity < product.minQuantity && (
                <p className="text-xs text-destructive">Mínimo {product.minQuantity} unidades</p>
              )}
            </div>
            {unitPrice > 0 && (
              <div className="text-right space-y-0.5">
                <p className="text-xs text-muted-foreground">Precio estimado</p>
                <p className="text-xl font-bold text-primary">
                  ${totalPrice.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">${unitPrice.toLocaleString("es-MX", { minimumFractionDigits: 2 })} c/u</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleAddToCart} className="bg-primary hover:bg-primary/90">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Agregar al carrito
            </Button>
            <Button variant="outline" onClick={handleRequestQuote}>
              <FileText className="h-4 w-4 mr-2" />
              Solicitar cotización
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Los detalles de personalización serán confirmados por nuestro equipo de arte.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
