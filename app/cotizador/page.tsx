"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  DollarSign,
  Package,
  Sparkles,
  TrendingUp,
  FileText,
  Download,
  Share2,
} from "lucide-react"

interface QuotationData {
  service: string
  quantity: number
  colors?: number
  size?: string
  subtotal: number
  extras: { name: string; cost: number }[]
  total: number
  totalWithMargin: number
  margin: string
  pricePerUnit: number
  pricePerUnitWithMargin: number
}

// ============== COTIZADOR LOGIC ==============

const calculateTampografiaSerigrafiaPrice = (quantity: number, colors: number = 1) => {
  let basePrice = 0
  let extraColorPrice = 0

  if (quantity <= 300) {
    basePrice = 980
    extraColorPrice = (colors - 1) * 3
  } else if (quantity <= 1000) {
    basePrice = quantity * 2.80
    extraColorPrice = (colors - 1) * 2.70
  } else if (quantity <= 2500) {
    basePrice = quantity * 2.50
    extraColorPrice = (colors - 1) * 2.40
  } else if (quantity <= 5000) {
    basePrice = quantity * 2.20
    extraColorPrice = (colors - 1) * 2.10
  } else {
    basePrice = quantity * 2.20
    extraColorPrice = (colors - 1) * 2.10
  }

  return basePrice + extraColorPrice
}

const calculateVidrioMetalRubberPrice = (quantity: number, colors: number = 1) => {
  let unitPrice = 0
  let extraColorPrice = 0

  if (quantity <= 500) {
    unitPrice = 900 / quantity
    extraColorPrice = 3.10
  } else if (quantity <= 1000) {
    unitPrice = 3.30
    extraColorPrice = 2.80
  } else if (quantity <= 2500) {
    unitPrice = 3.00
    extraColorPrice = 2.50
  } else if (quantity <= 5000) {
    unitPrice = 2.90
    extraColorPrice = 2.20
  } else {
    unitPrice = 2.60
    extraColorPrice = 2.00
  }

  const basePrice = quantity <= 500 ? 900 : quantity * unitPrice
  return basePrice + (colors - 1) * extraColorPrice * quantity
}

const calculateGrabadoLaserPrice = (quantity: number) => {
  if (quantity < 1000) return quantity * 12
  if (quantity <= 5000) return quantity * 8
  return quantity * 7
}

const calculateBordadoPrice = (quantity: number, size: string) => {
  const priceTable: Record<string, Record<string, number>> = {
    "5-12cm": {
      "1-9": 80,
      "10-49": 55,
      "50-99": 50,
      "100-299": 40,
      "300-499": 30,
      "500+": 25,
    },
    "12-20cm": {
      "1-9": 88,
      "10-49": 70,
      "50-99": 60,
      "100-299": 50,
      "300-499": 45,
      "500+": 40,
    },
    "20-25cm": {
      "1-9": 140,
      "10-49": 110,
      "50-99": 90,
      "100-299": 90,
      "300-499": 70,
      "500+": 70,
    },
  }

  let range = "500+"
  if (quantity <= 9) range = "1-9"
  else if (quantity <= 49) range = "10-49"
  else if (quantity <= 99) range = "50-99"
  else if (quantity <= 299) range = "100-299"
  else if (quantity <= 499) range = "300-499"

  const pricePerUnit = priceTable[size]?.[range] ?? 0
  return quantity * pricePerUnit
}

const calculateMargin = (quantity: number) => {
  if (quantity <= 200) return { percentage: 30, divisor: 0.70, label: "30%" }
  if (quantity <= 1000) return { percentage: 25, divisor: 0.75, label: "25%" }
  return { percentage: 20, divisor: 0.80, label: "20%" }
}

const generateQuotation = (
  service: string,
  quantity: number,
  colors?: number,
  size?: string,
  includeExtras?: { placa?: boolean; ponchado?: boolean; tratamiento?: boolean }
): QuotationData => {
  let subtotal = 0
  const extras: { name: string; cost: number }[] = []

  switch (service) {
    case "tampografia":
      subtotal = calculateTampografiaSerigrafiaPrice(quantity, colors ?? 1)
      if (includeExtras?.placa) extras.push({ name: "Placa de tampografía", cost: 280 })
      break
    case "vidrio-metal":
      subtotal = calculateVidrioMetalRubberPrice(quantity, colors ?? 1)
      if (includeExtras?.placa) extras.push({ name: "Placa de tampografía", cost: 280 })
      break
    case "laser":
      subtotal = calculateGrabadoLaserPrice(quantity)
      break
    case "bordado":
      subtotal = calculateBordadoPrice(quantity, size ?? "5-12cm")
      if (includeExtras?.ponchado) extras.push({ name: "Ponchado de bordado", cost: 280 })
      break
  }

  if (includeExtras?.tratamiento) {
    extras.push({ name: "Tratamiento especial", cost: 150 })
  }

  const extrasTotal = extras.reduce((sum, extra) => sum + extra.cost, 0)
  const total = subtotal + extrasTotal
  const margin = calculateMargin(quantity)
  const totalWithMargin = total / margin.divisor

  return {
    service,
    quantity,
    colors,
    size,
    subtotal,
    extras,
    total,
    totalWithMargin,
    margin: margin.label,
    pricePerUnit: total / quantity,
    pricePerUnitWithMargin: totalWithMargin / quantity,
  }
}

const getServiceName = (service: string) => {
  switch (service) {
    case "tampografia":
      return "Tampografía / Serigrafía"
    case "vidrio-metal":
      return "Vidrio / Metal / Rubber"
    case "laser":
      return "Grabado Láser"
    case "bordado":
      return "Bordado"
    default:
      return service
  }
}

export default function CotizadorPage() {
  const [service, setService] = useState<string>("")
  const [quantity, setQuantity] = useState<string>("")
  const [colors, setColors] = useState<string>("1")
  const [size, setSize] = useState<string>("5-12cm")
  const [includePlaca, setIncludePlaca] = useState(false)
  const [includePonchado, setIncludePonchado] = useState(false)
  const [includeTratamiento, setIncludeTratamiento] = useState(false)
  const [quotation, setQuotation] = useState<QuotationData | null>(null)

  const handleGenerate = () => {
    const qty = parseInt(quantity)
    if (!service || !qty || qty <= 0) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    const result = generateQuotation(
      service,
      qty,
      service === "tampografia" || service === "vidrio-metal" ? parseInt(colors) : undefined,
      service === "bordado" ? size : undefined,
      {
        placa: includePlaca,
        ponchado: includePonchado,
        tratamiento: includeTratamiento,
      }
    )

    setQuotation(result)
  }

  const handleReset = () => {
    setService("")
    setQuantity("")
    setColors("1")
    setSize("5-12cm")
    setIncludePlaca(false)
    setIncludePonchado(false)
    setIncludeTratamiento(false)
    setQuotation(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="md:ml-64 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Cotizador de Servicios</h1>
                <p className="text-muted-foreground mt-2">
                  Calcula el precio de tus servicios de personalización de forma instantánea
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card className="p-4 text-center border-primary/20">
                <Package className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Tampografía</p>
              </Card>
              <Card className="p-4 text-center border-primary/20">
                <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Grabado Láser</p>
              </Card>
              <Card className="p-4 text-center border-primary/20">
                <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Bordado</p>
              </Card>
              <Card className="p-4 text-center border-primary/20">
                <Calculator className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Precios Instantáneos</p>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulario de Cotización */}
            <Card className="border-primary/40 shadow-lg">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-primary" />
                  Datos del Servicio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-6">
                  {/* Servicio */}
                  <div className="space-y-2">
                    <Label htmlFor="service">Tipo de Servicio *</Label>
                    <Select value={service} onValueChange={setService}>
                      <SelectTrigger id="service">
                        <SelectValue placeholder="Selecciona un servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tampografia">Tampografía / Serigrafía</SelectItem>
                        <SelectItem value="vidrio-metal">Vidrio / Metal / Rubber</SelectItem>
                        <SelectItem value="laser">Grabado Láser</SelectItem>
                        <SelectItem value="bordado">Bordado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cantidad */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad de Piezas *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Ej: 500"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                    />
                  </div>

                  {/* Colores/Tintas (solo para tampografía y vidrio) */}
                  {(service === "tampografia" || service === "vidrio-metal") && (
                    <div className="space-y-2">
                      <Label htmlFor="colors">Número de Tintas/Colores</Label>
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

                  {/* Tamaño (solo para bordado) */}
                  {service === "bordado" && (
                    <div className="space-y-2">
                      <Label htmlFor="size">Tamaño del Diseño</Label>
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
                </div>

                <Separator />

                {/* Costos Adicionales */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Costos Adicionales</Label>

                  {(service === "tampografia" || service === "vidrio-metal") && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="placa"
                        checked={includePlaca}
                        onChange={(e) => setIncludePlaca(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="placa" className="font-normal cursor-pointer">
                        Placa de tampografía ($280 MXN)
                      </Label>
                    </div>
                  )}

                  {service === "bordado" && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="ponchado"
                        checked={includePonchado}
                        onChange={(e) => setIncludePonchado(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="ponchado" className="font-normal cursor-pointer">
                        Ponchado de bordado ($280 MXN)
                      </Label>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="tratamiento"
                      checked={includeTratamiento}
                      onChange={(e) => setIncludeTratamiento(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="tratamiento" className="font-normal cursor-pointer">
                      Tratamiento especial ($150 MXN estimado)
                    </Label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleGenerate} className="flex-1 bg-primary hover:bg-primary/90">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Generar Cotización
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="flex-1">
                    Limpiar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resultados de Cotización */}
            <div className="space-y-6">
              {quotation ? (
                <>
                  <Card className="border-primary shadow-lg">
                    <CardHeader className="bg-primary/10">
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-6 w-6 text-primary" />
                        Cotización Generada
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      {/* Detalles del Servicio */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Detalles del Servicio</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Servicio:</span>
                            <p className="font-medium">{getServiceName(quotation.service)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cantidad:</span>
                            <p className="font-medium">{quotation.quantity.toLocaleString()} piezas</p>
                          </div>
                          {quotation.colors && (
                            <div>
                              <span className="text-muted-foreground">Tintas:</span>
                              <p className="font-medium">{quotation.colors} color(es)</p>
                            </div>
                          )}
                          {quotation.size && (
                            <div>
                              <span className="text-muted-foreground">Tamaño:</span>
                              <p className="font-medium">{quotation.size}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Desglose de Precio */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Desglose de Precio</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Servicio de personalización:</span>
                            <span className="font-medium">
                              ${quotation.subtotal.toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{" "}
                              MXN
                            </span>
                          </div>

                          {quotation.extras.map((extra, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-muted-foreground">{extra.name}:</span>
                              <span className="font-medium">
                                ${extra.cost.toLocaleString("es-MX")} MXN
                              </span>
                            </div>
                          ))}

                          <Separator className="my-3" />

                          <div className="bg-primary/5 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-lg font-semibold">Precio Total:</span>
                              <span className="text-3xl font-bold text-primary">
                                ${quotation.totalWithMargin.toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}{" "}
                                MXN
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                              <span>Precio por pieza:</span>
                              <span className="font-medium">
                                ${quotation.pricePerUnitWithMargin.toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}{" "}
                                MXN
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Descargar PDF
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Info adicional */}
                  <Card className="bg-muted/30 border-dashed">
                    <CardContent className="pt-4 text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground mb-2">💡 Información Importante:</p>
                      <ul className="space-y-1 ml-4">
                        <li>• Los precios son estimados y pueden variar según el producto específico</li>
                        <li>• Costos de envío no incluidos en esta cotización</li>
                        <li>• Tiempos de entrega según disponibilidad y complejidad</li>
                        <li>• Válido por 30 días a partir de la fecha de emisión</li>
                      </ul>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="border-dashed h-full flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center">
                    <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      Sin cotización generada
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Completa el formulario y haz clic en "Generar Cotización" para ver los resultados
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <WhatsappButton />
    </div>
  )
}

