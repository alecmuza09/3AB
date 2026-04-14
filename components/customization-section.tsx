"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  Upload,
  Sparkles,
  Loader2,
  RefreshCw,
  Download,
  ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ScanSearch,
  Wand2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MockupAnalysis {
  product: {
    type: string
    material: string
    primaryColor: string
    hasCurvature: boolean
    perspective: string
    placementArea: { xPct: number; yPct: number; wPct: number; hPct: number }
  }
  logo: {
    primaryColor: string
    recommendedSizePct: number
  }
  application: {
    technique: string
    blendMode: "normal" | "multiply" | "screen" | "overlay"
    opacity: number
  }
}

interface Product {
  id: string
  name: string
  image_url: string | null
  price: number | null
  category?: string | { name: string } | null
}

type MockupStyle = "professional" | "lifestyle" | "flat"

const STYLE_OPTIONS: { value: MockupStyle; label: string; desc: string }[] = [
  { value: "professional", label: "Estudio", desc: "Fondo neutro, iluminación profesional" },
  { value: "lifestyle", label: "Lifestyle", desc: "Entorno de oficina moderno" },
  { value: "flat", label: "Flat lay", desc: "Vista cenital, fondo blanco" },
]

// Composición canvas inteligente usando el análisis de Gemini Vision
async function composeOnCanvas(
  productImageUrl: string,
  logoDataUrl: string,
  analysis?: MockupAnalysis | null
): Promise<string> {
  return new Promise((resolve, reject) => {
    const SIZE = 700
    const canvas = document.createElement("canvas")
    canvas.width = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext("2d")!

    const productImg = new Image()
    productImg.crossOrigin = "anonymous"
    productImg.onload = () => {
      // Fondo según color del producto
      const bgColor = analysis?.product?.primaryColor ?? "#f0f0f0"
      const isLight = parseInt(bgColor.replace("#", ""), 16) > 0x888888
      const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE)
      grad.addColorStop(0, isLight ? "#f7f7f7" : "#e0e0e0")
      grad.addColorStop(1, isLight ? "#e5e5e5" : "#d0d0d0")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, SIZE, SIZE)

      // Producto con sombra
      ctx.shadowColor = "rgba(0,0,0,0.14)"
      ctx.shadowBlur = 32
      ctx.shadowOffsetY = 14
      const scale = Math.min(580 / productImg.width, 580 / productImg.height)
      const pw = productImg.width * scale
      const ph = productImg.height * scale
      const pox = (SIZE - pw) / 2  // origin X del producto en canvas
      const poy = (SIZE - ph) / 2  // origin Y del producto en canvas
      ctx.drawImage(productImg, pox, poy, pw, ph)
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      const logoImg = new Image()
      logoImg.onload = () => {
        // ── Coordenadas de placement informadas por el análisis ────────────
        const placement = analysis?.product?.placementArea
        const sizePct = analysis?.logo?.recommendedSizePct ?? 35
        const blendMode = analysis?.application?.blendMode ?? "multiply"
        const opacity = analysis?.application?.opacity ?? 0.88

        let logoCenterX: number
        let logoCenterY: number
        let maxLogoW: number

        if (placement) {
          // El análisis indica las coordenadas como % de la imagen original del producto
          // Hay que mapearlas al espacio del canvas donde el producto está escalado y centrado
          logoCenterX = pox + (placement.xPct / 100) * pw
          logoCenterY = poy + (placement.yPct / 100) * ph
          maxLogoW = (placement.wPct / 100) * pw * (sizePct / 100) * 2.5
        } else {
          logoCenterX = pox + pw / 2
          logoCenterY = poy + ph / 2
          maxLogoW = pw * 0.38
        }

        const maxLogoH = maxLogoW * 0.7
        const lScale = Math.min(maxLogoW / logoImg.width, maxLogoH / logoImg.height)
        const lw = logoImg.width * lScale
        const lh = logoImg.height * lScale
        const lx = logoCenterX - lw / 2
        const ly = logoCenterY - lh / 2

        // Sombra ligera bajo el logo para efecto de impresión
        ctx.shadowColor = "rgba(0,0,0,0.22)"
        ctx.shadowBlur = 5
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 2

        ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation
        ctx.globalAlpha = opacity
        ctx.drawImage(logoImg, lx, ly, lw, lh)

        ctx.globalCompositeOperation = "source-over"
        ctx.globalAlpha = 1
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        resolve(canvas.toDataURL("image/png", 0.95))
      }
      logoImg.onerror = () => reject(new Error("No se pudo cargar el logo"))
      logoImg.src = logoDataUrl
    }
    productImg.onerror = () => reject(new Error("No se pudo cargar el producto"))
    productImg.src = productImageUrl
  })
}

export function CustomizationSection() {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [logoFileName, setLogoFileName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [style, setStyle] = useState<MockupStyle>("professional")
  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep] = useState<"idle" | "analyzing" | "generating">("idle")
  const [analysis, setAnalysis] = useState<MockupAnalysis | null>(null)
  const [mockupUrl, setMockupUrl] = useState<string | null>(null)
  const [mockupMime, setMockupMime] = useState("image/png")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [usedFallback, setUsedFallback] = useState(false)

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchProducts = useCallback(async (term: string) => {
    setLoadingProducts(true)
    setProducts([])
    try {
      const url = term.trim()
        ? `/api/products?activeOnly=true&limit=12&search=${encodeURIComponent(term.trim())}`
        : `/api/products?activeOnly=true&limit=12`
      const res = await fetch(url)
      const data = await res.json()
      const list: Product[] = Array.isArray(data) ? data : data.products ?? []
      setProducts(list)
    } catch {
      setProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  // Carga inicial
  useEffect(() => {
    searchProducts("")
  }, [searchProducts])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => searchProducts(val), 380)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setLogoDataUrl(ev.target?.result as string)
      setMockupUrl(null)
      setErrorMsg(null)
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoDataUrl(null)
    setLogoFileName("")
    setMockupUrl(null)
    setErrorMsg(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleGenerate = async () => {
    if (!selectedProduct || !logoDataUrl) return
    const imageUrl = selectedProduct.image_url
    if (!imageUrl) {
      setErrorMsg("El producto seleccionado no tiene imagen.")
      return
    }

    setGenerating(true)
    setGenStep("analyzing")
    setMockupUrl(null)
    setErrorMsg(null)
    setUsedFallback(false)
    setAnalysis(null)

    try {
      // El servidor hace paso 1 (análisis) y paso 2 (generación) internamente
      // Simulamos la transición visual de etapas con un pequeño delay
      const timeoutId = setTimeout(() => setGenStep("generating"), 8_000)

      const res = await fetch("/api/ai/generate-mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productImageUrl: imageUrl,
          logoBase64: logoDataUrl,
          productName: selectedProduct.name,
          style,
        }),
      })

      clearTimeout(timeoutId)
      const data = await res.json()

      if (data.analysis) setAnalysis(data.analysis)

      if (data.success && data.imageBase64) {
        const mime = data.mimeType || "image/png"
        setMockupMime(mime)
        setMockupUrl(`data:${mime};base64,${data.imageBase64}`)
      } else if (data.fallback) {
        // Canvas inteligente con las coordenadas del análisis
        console.warn("[Mockup] Generación IA no disponible, usando canvas inteligente. Análisis:", data.analysis)
        try {
          const composed = await composeOnCanvas(imageUrl, logoDataUrl, data.analysis ?? null)
          setMockupUrl(composed)
          setMockupMime("image/png")
          setUsedFallback(true)
        } catch {
          setErrorMsg("No se pudo generar el mockup. Verifica que la imagen del producto sea accesible.")
        }
      } else {
        setErrorMsg(data.error || "No se pudo generar el mockup.")
      }
    } catch {
      setErrorMsg("Error de red al generar el mockup.")
    } finally {
      setGenerating(false)
      setGenStep("idle")
    }
  }

  const handleDownload = () => {
    if (!mockupUrl) return
    const ext = mockupMime === "image/jpeg" ? "jpg" : "png"
    const a = document.createElement("a")
    a.href = mockupUrl
    a.download = `mockup-${selectedProduct?.name?.replace(/\s+/g, "-").toLowerCase() ?? "producto"}.${ext}`
    a.click()
  }

  const categoryName = (p: Product) => {
    if (!p.category) return ""
    if (typeof p.category === "string") return p.category
    return (p.category as { name: string }).name ?? ""
  }

  const canGenerate = !!selectedProduct && !!logoDataUrl && !generating

  return (
    <section id="personalizar" className="py-20 lg:py-24 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center space-y-4 mb-14">
          <Badge className="bg-accent/10 text-accent border-accent/20 px-4 py-1.5">
            Personalización con IA
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-balance">
            <span className="text-primary">Personaliza</span> tu producto en tiempo real
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Busca un producto, sube tu logo y nuestra IA generará un mockup fotorrealista de cómo
            quedaría impreso.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* ── Columna izquierda: buscar producto ── */}
          <div className="space-y-5">

            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar producto: taza, playera, pluma…"
                value={query}
                onChange={handleQueryChange}
                className="pl-9"
              />
            </div>

            {/* Grid de productos */}
            <div className="grid grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {loadingProducts
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl bg-muted animate-pulse"
                    />
                  ))
                : products.length === 0
                ? (
                  <div className="col-span-3 text-center py-10 text-muted-foreground text-sm">
                    No se encontraron productos.
                  </div>
                )
                : products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p)
                      setMockupUrl(null)
                      setErrorMsg(null)
                    }}
                    className={cn(
                      "relative group rounded-xl border-2 overflow-hidden transition-all bg-white",
                      selectedProduct?.id === p.id
                        ? "border-primary shadow-md ring-1 ring-primary/30"
                        : "border-transparent hover:border-primary/30"
                    )}
                  >
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full aspect-square object-contain p-2"
                      />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center bg-muted">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    {selectedProduct?.id === p.id && (
                      <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-[10px] font-medium leading-tight line-clamp-2">
                        {p.name}
                      </p>
                    </div>
                  </button>
                ))}
            </div>

            {/* Producto seleccionado – info */}
            {selectedProduct && (
              <Card className="border border-primary/20 bg-primary/5">
                <CardContent className="p-4 flex items-center gap-4">
                  {selectedProduct.image_url && (
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="h-14 w-14 object-contain rounded-lg bg-white border"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{selectedProduct.name}</p>
                    {categoryName(selectedProduct) && (
                      <p className="text-xs text-muted-foreground">{categoryName(selectedProduct)}</p>
                    )}
                    {selectedProduct.price && (
                      <p className="text-xs text-primary font-medium">
                        ${Number(selectedProduct.price).toFixed(2)} MXN
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Columna derecha: logo + resultado ── */}
          <div className="space-y-5">

            {/* Carga de logo */}
            <Card className="border-0 bg-card/60">
              <CardContent className="p-5 space-y-4">
                <p className="font-semibold text-sm">1. Sube tu logo</p>

                {logoDataUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border border-border">
                    <img
                      src={logoDataUrl}
                      alt="Logo"
                      className="h-14 w-14 object-contain rounded bg-white border p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{logoFileName}</p>
                      <p className="text-xs text-muted-foreground">Listo para usar</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={removeLogo}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 text-center transition-colors group"
                  >
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground group-hover:text-primary mb-3 transition-colors" />
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      Arrastra tu logo o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG, WEBP · máx. 5 MB</p>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoUpload}
                />

                {/* Estilo del mockup */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">2. Estilo del mockup</p>
                  <div className="grid grid-cols-3 gap-2">
                    {STYLE_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setStyle(s.value)}
                        className={cn(
                          "p-2.5 rounded-lg border text-left transition-all",
                          style === s.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <p className="text-xs font-semibold">{s.label}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botón generar */}
                <Button
                  className="w-full gap-2 bg-primary hover:bg-primary/90"
                  size="lg"
                  disabled={!canGenerate}
                  onClick={handleGenerate}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generando mockup…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generar mockup con IA
                    </>
                  )}
                </Button>

                {!selectedProduct && !logoDataUrl && (
                  <p className="text-xs text-center text-muted-foreground">
                    Selecciona un producto y sube tu logo para continuar
                  </p>
                )}
                {selectedProduct && !logoDataUrl && (
                  <p className="text-xs text-center text-muted-foreground">
                    Ahora sube tu logo para generar el mockup
                  </p>
                )}
                {!selectedProduct && logoDataUrl && (
                  <p className="text-xs text-center text-muted-foreground">
                    Selecciona un producto del panel izquierdo
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Resultado del mockup */}
            {(generating || mockupUrl || errorMsg) && (
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  {generating && (
                    <div className="min-h-[320px] flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-primary/5 to-accent/5 p-8">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        {genStep === "analyzing"
                          ? <ScanSearch className="absolute inset-0 m-auto h-6 w-6 text-primary" />
                          : <Wand2 className="absolute inset-0 m-auto h-6 w-6 text-primary" />
                        }
                      </div>
                      <div className="text-center space-y-2">
                        <p className="font-semibold">
                          {genStep === "analyzing" ? "Analizando producto y logo…" : "Generando mockup con IA…"}
                        </p>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          {genStep === "analyzing"
                            ? "La IA está entendiendo el producto, su material, perspectiva y dónde aplicar el logo."
                            : "Aplicando el logo con la técnica y posición correctas. Puede tardar hasta 30 segundos."}
                        </p>
                        {/* Indicador de pasos */}
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <div className={cn("flex items-center gap-1 text-xs px-2 py-1 rounded-full", genStep === "analyzing" ? "bg-primary/10 text-primary" : "bg-green-100 text-green-700")}>
                            {genStep === "analyzing"
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <CheckCircle2 className="h-3 w-3" />}
                            Análisis
                          </div>
                          <div className="h-px w-4 bg-border" />
                          <div className={cn("flex items-center gap-1 text-xs px-2 py-1 rounded-full", genStep === "generating" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                            {genStep === "generating" && <Loader2 className="h-3 w-3 animate-spin" />}
                            Generación
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!generating && errorMsg && (
                    <div className="min-h-[200px] flex flex-col items-center justify-center gap-3 p-8 text-center">
                      <AlertCircle className="h-10 w-10 text-destructive/70" />
                      <p className="text-sm text-muted-foreground">{errorMsg}</p>
                      <Button variant="outline" size="sm" onClick={handleGenerate} className="gap-1.5">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Reintentar
                      </Button>
                    </div>
                  )}

                  {!generating && mockupUrl && (
                    <div className="space-y-0">
                      <div className="relative bg-white">
                        <img
                          src={mockupUrl}
                          alt="Mockup generado"
                          className="w-full object-contain max-h-[500px]"
                        />
                        {usedFallback && (
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md">
                            Composición IA
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex items-center justify-between bg-muted/20 border-t">
                        <div>
                          <p className="text-sm font-semibold">
                            {usedFallback ? "Composición guiada por IA" : "Mockup generado con IA"}
                          </p>
                          <p className="text-xs text-muted-foreground">{selectedProduct?.name}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleGenerate} className="gap-1.5">
                            <RefreshCw className="h-3.5 w-3.5" />
                            Regenerar
                          </Button>
                          <Button size="sm" onClick={handleDownload} className="gap-1.5">
                            <Download className="h-3.5 w-3.5" />
                            Descargar
                          </Button>
                        </div>
                      </div>
                      {/* Ficha de análisis de la IA */}
                      {analysis && (
                        <div className="px-4 pb-4 pt-1 bg-muted/10 border-t grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Producto</p>
                            <p className="text-xs font-medium mt-0.5 capitalize">{analysis.product.type}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Técnica</p>
                            <p className="text-xs font-medium mt-0.5 capitalize">{analysis.application.technique.replace(/_/g, " ")}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Material</p>
                            <p className="text-xs font-medium mt-0.5 capitalize">{analysis.product.material}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!generating && !mockupUrl && !errorMsg && (
              <div className="rounded-2xl border-2 border-dashed border-border/50 min-h-[200px] flex flex-col items-center justify-center gap-3 text-center p-8">
                <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                <div>
                  <p className="text-sm text-muted-foreground">El mockup aparecerá aquí</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Selecciona producto + logo y presiona Generar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
