"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Upload, Download, Save, Type, ImageIcon, RotateCcw, ShoppingCart, FileText, Trash2 } from "lucide-react"

interface ProductCustomizationPreviewProps {
  product: {
    id: string
    name: string
    image_url?: string
    image?: string
    price?: number
    min_quantity?: number
    minQuantity?: number
    attributes?: any
  }
  onRequestQuote?: () => void
}

const FONTS = [
  { label: "Sans-serif", value: "Arial, sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Monospace", value: "'Courier New', monospace" },
  { label: "Display", value: "'Impact', sans-serif" },
]

const CANVAS_WIDTH = 500
const CANVAS_HEIGHT = 400

export function ProductCustomizationPreview({ product, onRequestQuote }: ProductCustomizationPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<any>(null)
  const [fabricLoaded, setFabricLoaded] = useState(false)

  // Controls
  const [customText, setCustomText] = useState("Tu logo aquí")
  const [textColor, setTextColor] = useState("#FFFFFF")
  const [fontSize, setFontSize] = useState(28)
  const [fontFamily, setFontFamily] = useState("Arial, sans-serif")
  const [logoOpacity, setLogoOpacity] = useState(90)
  const [quantity, setQuantity] = useState(product.min_quantity || product.minQuantity || 1)
  const [saving, setSaving] = useState(false)
  const [activeObject, setActiveObject] = useState<string | null>(null)

  const { addToCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const productImage = product.image_url || product.image || ""

  // ---- Inicializar Fabric.js ----
  useEffect(() => {
    let canvas: any = null

    async function init() {
      if (!canvasRef.current) return
      const fabric = await import("fabric")
      const FabricCanvas = fabric.Canvas

      canvas = new FabricCanvas(canvasRef.current, {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: "#f5f5f5",
        selection: true,
      })

      fabricRef.current = canvas

      // Imagen de fondo del producto
      if (productImage) {
        try {
          const img = await fabric.FabricImage.fromURL(productImage, { crossOrigin: "anonymous" })
          img.scaleToWidth(CANVAS_WIDTH)
          img.scaleToHeight(CANVAS_HEIGHT)
          img.set({ selectable: false, evented: false, objectCaching: false })
          canvas.backgroundImage = img
          canvas.renderAll()
        } catch {
          // Si la imagen falla (CORS), usar fondo de color
          canvas.set({ backgroundColor: "#e0e0e0" })
          canvas.renderAll()
        }
      }

      // Texto por defecto
      const text = new fabric.Textbox(customText, {
        left: CANVAS_WIDTH / 2,
        top: CANVAS_HEIGHT / 2,
        originX: "center",
        originY: "center",
        fontSize,
        fill: textColor,
        fontFamily,
        textAlign: "center",
        width: 300,
        name: "custom-text",
      })
      canvas.add(text)
      canvas.setActiveObject(text)
      canvas.renderAll()

      canvas.on("selection:created", (e: any) => setActiveObject(e.selected?.[0]?.name ?? null))
      canvas.on("selection:updated", (e: any) => setActiveObject(e.selected?.[0]?.name ?? null))
      canvas.on("selection:cleared", () => setActiveObject(null))

      setFabricLoaded(true)
    }

    init()

    return () => {
      if (canvas) {
        canvas.dispose()
        fabricRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productImage])

  // ---- Actualizar texto activo cuando cambian los controles ----
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas || !fabricLoaded) return
    const obj = canvas.getObjects().find((o: any) => o.name === "custom-text")
    if (obj) {
      obj.set({ text: customText, fill: textColor, fontSize, fontFamily })
      canvas.renderAll()
    }
  }, [customText, textColor, fontSize, fontFamily, fabricLoaded])

  // ---- Subir logo / imagen ----
  const handleLogoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !fabricRef.current) return
      const canvas = fabricRef.current

      const fabric = await import("fabric")

      const isSvg = file.type === "image/svg+xml"
      const reader = new FileReader()

      reader.onload = async (ev) => {
        const result = ev.target?.result as string
        if (!result) return

        try {
          if (isSvg) {
            const { objects, options } = await fabric.loadSVGFromString(result)
            if (objects) {
              const group = fabric.util.groupSVGElements(objects as any[], options)
              group.set({
                left: CANVAS_WIDTH / 2,
                top: CANVAS_HEIGHT / 2,
                originX: "center",
                originY: "center",
                opacity: logoOpacity / 100,
                name: "logo",
              })
              // Escalar para que quepa razonablemente
              const maxDim = 200
              if ((group.width ?? 0) > maxDim || (group.height ?? 0) > maxDim) {
                const scale = maxDim / Math.max(group.width ?? maxDim, group.height ?? maxDim)
                group.scale(scale)
              }
              canvas.add(group)
              canvas.setActiveObject(group)
              canvas.renderAll()
              toast.success("Logo SVG cargado correctamente")
            }
          } else {
            const img = await fabric.FabricImage.fromURL(result)
            img.set({
              left: CANVAS_WIDTH / 2,
              top: CANVAS_HEIGHT / 2,
              originX: "center",
              originY: "center",
              opacity: logoOpacity / 100,
              name: "logo",
            })
            // Escalar
            const maxDim = 200
            if ((img.width ?? 0) > maxDim || (img.height ?? 0) > maxDim) {
              const scale = maxDim / Math.max(img.width ?? maxDim, img.height ?? maxDim)
              img.scale(scale)
            }
            canvas.add(img)
            canvas.setActiveObject(img)
            canvas.renderAll()
            toast.success("Logo cargado correctamente")
          }
        } catch {
          toast.error("Error al cargar el logo. Verifica el formato del archivo.")
        }
      }

      if (isSvg) {
        reader.readAsText(file)
      } else {
        reader.readAsDataURL(file)
      }
    },
    [logoOpacity]
  )

  // ---- Actualizar opacidad del logo ----
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const logo = canvas.getObjects().find((o: any) => o.name === "logo")
    if (logo) {
      logo.set({ opacity: logoOpacity / 100 })
      canvas.renderAll()
    }
  }, [logoOpacity])

  // ---- Eliminar objeto seleccionado ----
  const handleDeleteSelected = () => {
    const canvas = fabricRef.current
    if (!canvas) return
    const active = canvas.getActiveObject()
    if (active) {
      canvas.remove(active)
      canvas.renderAll()
      setActiveObject(null)
    }
  }

  // ---- Reset canvas ----
  const handleReset = () => {
    const canvas = fabricRef.current
    if (!canvas) return
    // Eliminar objetos excepto el fondo
    canvas.getObjects().forEach((o: any) => canvas.remove(o))

    // Re-inicializar con texto por defecto
    import("fabric").then((fabric) => {
      const t = new fabric.Textbox(customText, {
        left: CANVAS_WIDTH / 2,
        top: CANVAS_HEIGHT / 2,
        originX: "center",
        originY: "center",
        fontSize,
        fill: textColor,
        fontFamily,
        textAlign: "center",
        width: 300,
        name: "custom-text",
      })
      canvas.add(t)
      canvas.setActiveObject(t)
      canvas.renderAll()
    })
  }

  // ---- Exportar PNG ----
  const handleExport = () => {
    const canvas = fabricRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL({ format: "png", quality: 1, multiplier: 2 })
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = `${product.name.replace(/\s+/g, "-")}-diseño.png`
    link.click()
    toast.success("Diseño exportado como PNG")
  }

  // ---- Guardar propuesta ----
  const handleSave = async () => {
    if (!user) {
      toast.error("Inicia sesión para guardar tu propuesta")
      return
    }
    const canvas = fabricRef.current
    if (!canvas) return

    setSaving(true)
    try {
      const previewDataUrl = canvas.toDataURL({ format: "png", quality: 0.8, multiplier: 1 })
      const canvasJson = canvas.toJSON(["name"])

      const res = await fetch("/api/customizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          productId: product.id,
          customizationData: canvasJson,
          previewDataUrl,
        }),
      })

      if (res.ok) {
        toast.success("¡Propuesta guardada! Puedes verla en tu perfil.")
      } else {
        const data = await res.json()
        toast.error(data.error || "Error al guardar la propuesta")
      }
    } catch {
      toast.error("Error al guardar la propuesta")
    } finally {
      setSaving(false)
    }
  }

  // ---- Agregar al carrito ----
  const handleAddToCart = () => {
    const canvas = fabricRef.current
    const previewUrl = canvas?.toDataURL({ format: "png", quality: 0.6, multiplier: 1 }) ?? ""
    addToCart({
      product: {
        id: product.id,
        name: product.name,
        price: product.price || 0,
        image: previewUrl || productImage,
        minQuantity: product.min_quantity || product.minQuantity || 1,
        multipleOf: 1,
        category: "",
        description: "",
        stock: 9999,
        isActive: true,
        attributes: product.attributes,
      } as any,
      quantity,
      quoteConfig: {
        service: "cotizacion" as any,
        colors: 1,
        size: customText !== "Tu logo aquí" ? customText : "custom",
      },
    })
    toast.success(`${product.name} agregado al carrito con tu diseño`)
  }

  const unitPrice = product.price || 0
  const estimatedTotal = unitPrice * quantity

  return (
    <div className="grid lg:grid-cols-2 gap-8 p-4">
      {/* Canvas */}
      <div className="space-y-4">
        <div className="relative border rounded-xl overflow-hidden shadow-sm bg-muted flex items-center justify-center">
          <canvas ref={canvasRef} className="block max-w-full" />
          {!fabricLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!fabricLoaded}>
            <Download className="h-4 w-4 mr-1" />
            Exportar PNG
          </Button>
          {activeObject && (
            <Button variant="outline" size="sm" onClick={handleDeleteSelected} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar seleccionado
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleReset} disabled={!fabricLoaded}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Resetear
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Type className="h-4 w-4" />
              Texto personalizado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs mb-1 block">Texto</Label>
              <Input
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Tu empresa o slogan"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Color</Label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-9 rounded border cursor-pointer"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Tamaño: {fontSize}px</Label>
                <Slider
                  min={10}
                  max={72}
                  step={1}
                  value={[fontSize]}
                  onValueChange={([v]) => setFontSize(v)}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Fuente</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Logo / imagen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs mb-1 block">Subir logo (SVG, PNG, JPG)</Label>
              <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-border rounded-lg p-3 hover:border-primary transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Seleccionar archivo</span>
                <input
                  type="file"
                  accept="image/svg+xml,image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Los archivos SVG se importan como vectores escalables.
              </p>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Opacidad del logo: {logoOpacity}%</Label>
              <Slider
                min={10}
                max={100}
                step={5}
                value={[logoOpacity]}
                onValueChange={([v]) => setLogoOpacity(v)}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs mb-1 block">Cantidad</Label>
              <Input
                type="number"
                min={product.min_quantity || product.minQuantity || 1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(product.min_quantity || 1, parseInt(e.target.value) || 1))}
                className="w-24"
              />
            </div>
            {estimatedTotal > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Estimado</p>
                <p className="text-xl font-bold text-primary">
                  ${estimatedTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
                <Badge variant="outline" className="text-xs">MXN</Badge>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleAddToCart}
              disabled={!fabricLoaded}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Agregar al carrito
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={onRequestQuote ? onRequestQuote : () => router.push("/cotizaciones")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Solicitar cotización
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full"
            onClick={handleSave}
            disabled={saving || !fabricLoaded}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar propuesta en mi perfil"}
          </Button>
          {!user && (
            <p className="text-xs text-muted-foreground text-center">
              Inicia sesión para guardar tus propuestas.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
