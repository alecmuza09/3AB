"use client"

import { useState } from "react"
import { TopHeader } from "@/components/top-header"
import { Footer } from "@/components/footer"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, FileText, Package, CheckCircle, Plus, Minus, Download, Upload, ImageIcon, X } from "lucide-react"

interface QuoteItem {
  id: string
  product: string
  category: string
  quantity: number
  unitPrice: number
  customization: string
  total: number
  images: File[]
  imageUrls: string[]
}

export default function CotizacionesPage() {
  const [step, setStep] = useState(1)
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    eventType: "",
    deliveryDate: "",
    deliveryAddress: "",
    specialRequirements: "",
    paymentTerms: "30_days",
  })

  const productCategories = [
    { name: "Antiestrés", products: ["Pelota antiestrés", "Cubo antiestrés", "Spinner", "Squishy"] },
    { name: "Bolsas", products: ["Bolsa tote", "Bolsa ecológica", "Bolsa de mano", "Bolsa deportiva"] },
    { name: "Calendarios", products: ["Calendario de escritorio", "Calendario de pared", "Agenda", "Planificador"] },
    { name: "Deportes", products: ["Botella deportiva", "Toalla deportiva", "Banda elástica", "Balón"] },
    {
      name: "Ecológicos",
      products: ["Bolsa reciclada", "Popote reutilizable", "Cubiertos bambú", "Libreta reciclada"],
    },
    { name: "Folders", products: ["Folder ejecutivo", "Carpeta con broche", "Portafolio", "Archivador"] },
    { name: "Gafetes", products: ["Gafete PVC", "Porta gafete", "Gafete retráctil", "Lanyard"] },
    { name: "Gorras", products: ["Gorra bordada", "Gorra trucker", "Visera", "Gorra snapback"] },
    { name: "Hogar", products: ["Taza", "Termo", "Vaso", "Delantal", "Mantel"] },
    { name: "Mochilas", products: ["Mochila ejecutiva", "Mochila deportiva", "Mochila escolar", "Morral"] },
    { name: "Oficina", products: ["Bolígrafos", "Libretas", "Post-its", "Clips", "Engrapadora"] },
    { name: "Pines", products: ["Pin metálico", "Pin esmaltado", "Broche", "Pin magnético"] },
    { name: "Placas", products: ["Placa acrílico", "Placa madera", "Placa metal", "Trofeo"] },
    { name: "Playeras", products: ["Playera polo", "Playera cuello redondo", "Playera deportiva", "Sudadera"] },
    { name: "Plumas", products: ["Pluma metálica", "Pluma plástico", "Pluma touch", "Portaminas"] },
    { name: "Portarretratos", products: ["Portarretrato acrílico", "Portarretrato madera", "Marco digital"] },
    { name: "Reconocimientos", products: ["Diploma", "Certificado", "Medalla", "Trofeo", "Placa"] },
    { name: "Relojes", products: ["Reloj de pulsera", "Reloj de pared", "Reloj de escritorio"] },
    { name: "Salud", products: ["Cubrebocas", "Gel antibacterial", "Termómetro", "Botiquín"] },
    { name: "Tarjetas de Presentación", products: ["Tarjetas estándar", "Tarjetas premium", "Tarjetas PVC"] },
    { name: "Tazas", products: ["Taza cerámica", "Taza térmica", "Taza mágica", "Taza viajera"] },
    { name: "Tecnología", products: ["USB", "Power bank", "Audífonos", "Cable USB", "Mouse pad"] },
    { name: "Termos", products: ["Termo acero", "Termo plástico", "Termo vidrio", "Botella térmica"] },
    { name: "Textiles", products: ["Playeras", "Polos", "Chamarras", "Gorras", "Uniformes"] },
    { name: "USB", products: ["USB 8GB", "USB 16GB", "USB 32GB", "USB personalizado"] },
    { name: "Vasos", products: ["Vaso térmico", "Vaso plástico", "Vaso vidrio", "Vaso desechable"] },
    { name: "Producto Externo", products: ["Producto personalizado (subir imagen)"] },
  ]

  const addQuoteItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      product: "",
      category: "",
      quantity: 100,
      unitPrice: 0,
      customization: "",
      total: 0,
      images: [],
      imageUrls: [],
    }
    setQuoteItems([...quoteItems, newItem])
  }

  const updateQuoteItem = (id: string, field: keyof QuoteItem, value: any) => {
    setQuoteItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updated.total = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return item
      }),
    )
  }

  const handleImageUpload = (itemId: string, files: FileList | null) => {
    if (!files) return

    const newImages = Array.from(files)
    const newImageUrls = newImages.map((file) => URL.createObjectURL(file))

    setQuoteItems((items) =>
      items.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            images: [...item.images, ...newImages],
            imageUrls: [...item.imageUrls, ...newImageUrls],
          }
        }
        return item
      }),
    )
  }

  const removeImage = (itemId: string, imageIndex: number) => {
    setQuoteItems((items) =>
      items.map((item) => {
        if (item.id === itemId) {
          const newImages = item.images.filter((_, index) => index !== imageIndex)
          const newImageUrls = item.imageUrls.filter((_, index) => index !== imageIndex)
          return {
            ...item,
            images: newImages,
            imageUrls: newImageUrls,
          }
        }
        return item
      }),
    )
  }

  const removeQuoteItem = (id: string) => {
    setQuoteItems((items) => items.filter((item) => item.id !== id))
  }

  const calculateVolumeDiscount = (quantity: number) => {
    if (quantity >= 5000) return 0.25 // 25% descuento
    if (quantity >= 2000) return 0.2 // 20% descuento
    if (quantity >= 1000) return 0.15 // 15% descuento
    if (quantity >= 500) return 0.1 // 10% descuento
    if (quantity >= 100) return 0.05 // 5% descuento
    return 0
  }

  const subtotal = quoteItems.reduce((sum, item) => sum + item.total, 0)
  const totalQuantity = quoteItems.reduce((sum, item) => sum + item.quantity, 0)
  const volumeDiscount = calculateVolumeDiscount(totalQuantity)
  const discountAmount = subtotal * volumeDiscount
  const total = subtotal - discountAmount

  const generateQuote = () => {
    console.log("[v0] Generando cotización:", { formData, quoteItems, total })
    // Aquí se enviaría la cotización al backend
    alert("Cotización generada exitosamente. Se enviará por email en breve.")
  }

  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Módulo de Cotización Industrial</h1>
            <p className="text-muted-foreground">
              Solicita cotizaciones para pedidos por volumen y proyectos industriales
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[
                { num: 1, title: "Información", icon: FileText },
                { num: 2, title: "Productos", icon: Package },
                { num: 3, title: "Resumen", icon: Calculator },
              ].map((stepItem, index) => (
                <div key={stepItem.num} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      step >= stepItem.num
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {step > stepItem.num ? <CheckCircle className="h-5 w-5" /> : <stepItem.icon className="h-5 w-5" />}
                  </div>
                  <span
                    className={`ml-2 font-medium ${step >= stepItem.num ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {stepItem.title}
                  </span>
                  {index < 2 && (
                    <div className={`w-20 h-0.5 mx-4 ${step > stepItem.num ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Company Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Información de la Empresa
                </CardTitle>
                <CardDescription>Proporciona los datos de tu empresa para generar la cotización</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nombre de la Empresa *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Ej. Corporativo ABC S.A. de C.V."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Nombre del Contacto *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Corporativo *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contacto@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Tipo de Evento/Proyecto</Label>
                    <Select
                      value={formData.eventType}
                      onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corporate">Evento Corporativo</SelectItem>
                        <SelectItem value="trade_show">Feria Comercial</SelectItem>
                        <SelectItem value="conference">Conferencia</SelectItem>
                        <SelectItem value="uniform">Uniformes Empresariales</SelectItem>
                        <SelectItem value="promotional">Campaña Promocional</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">Fecha de Entrega Requerida</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Dirección de Entrega</Label>
                  <Textarea
                    id="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    placeholder="Dirección completa donde se realizará la entrega"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} className="bg-primary hover:bg-primary/90">
                    Continuar <Package className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Products Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Selección de Productos
                  </CardTitle>
                  <CardDescription>
                    Agrega los productos que necesitas para tu cotización.
                    <br />
                    <strong>¿Tienes un producto específico en mente?</strong> Puedes subir imágenes de productos
                    externos para cotizar.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={addQuoteItem} className="mb-6">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Producto
                  </Button>

                  <div className="space-y-4">
                    {quoteItems.map((item, index) => (
                      <Card key={item.id} className="border-l-4 border-l-primary">
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                            <div className="space-y-2">
                              <Label>Categoría</Label>
                              <Select
                                value={item.category}
                                onValueChange={(value) => updateQuoteItem(item.id, "category", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                  {productCategories.map((cat) => (
                                    <SelectItem key={cat.name} value={cat.name}>
                                      {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Producto</Label>
                              <Select
                                value={item.product}
                                onValueChange={(value) => updateQuoteItem(item.id, "product", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Producto" />
                                </SelectTrigger>
                                <SelectContent>
                                  {item.category &&
                                    productCategories
                                      .find((cat) => cat.name === item.category)
                                      ?.products.map((product) => (
                                        <SelectItem key={product} value={product}>
                                          {product}
                                        </SelectItem>
                                      ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Cantidad</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuoteItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Precio Unit. ($)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  updateQuoteItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Total</Label>
                              <div className="text-lg font-semibold text-primary">
                                ${item.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeQuoteItem(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>

                          {item.category === "Producto Externo" && (
                            <div className="mt-4 space-y-4">
                              <div className="space-y-2">
                                <Label>Subir Imágenes del Producto</Label>
                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Arrastra y suelta imágenes aquí, o haz clic para seleccionar
                                  </p>
                                  <Input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(item.id, e.target.files)}
                                    className="hidden"
                                    id={`image-upload-${item.id}`}
                                  />
                                  <Label htmlFor={`image-upload-${item.id}`}>
                                    <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                                      <span>
                                        <ImageIcon className="h-4 w-4 mr-2" />
                                        Seleccionar Imágenes
                                      </span>
                                    </Button>
                                  </Label>
                                </div>
                              </div>

                              {/* Display uploaded images */}
                              {item.imageUrls.length > 0 && (
                                <div className="space-y-2">
                                  <Label>Imágenes Subidas</Label>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {item.imageUrls.map((url, imageIndex) => (
                                      <div key={imageIndex} className="relative group">
                                        <img
                                          src={url || "/placeholder.svg"}
                                          alt={`Producto ${imageIndex + 1}`}
                                          className="w-full h-24 object-cover rounded-lg border"
                                        />
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() => removeImage(item.id, imageIndex)}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="mt-4 space-y-2">
                            <Label>Personalización/Especificaciones</Label>
                            <Textarea
                              value={item.customization}
                              onChange={(e) => updateQuoteItem(item.id, "customization", e.target.value)}
                              placeholder="Describe la personalización requerida (logos, colores, textos, etc.)"
                              rows={2}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {quoteItems.length > 0 && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Cantidad Total: {totalQuantity.toLocaleString()} piezas
                          </p>
                          {volumeDiscount > 0 && (
                            <Badge variant="secondary" className="mt-1">
                              Descuento por volumen: {(volumeDiscount * 100).toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            Subtotal: ${subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </p>
                          {discountAmount > 0 && (
                            <p className="text-sm text-green-600">
                              Descuento: -${discountAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Anterior
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={quoteItems.length === 0}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Continuar <Calculator className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Quote Summary */}
          {step === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Resumen de Cotización
                  </CardTitle>
                  <CardDescription>Revisa los detalles antes de generar tu cotización</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Company Info Summary */}
                  <div>
                    <h3 className="font-semibold mb-3">Información de la Empresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Empresa:</strong> {formData.companyName}
                      </div>
                      <div>
                        <strong>Contacto:</strong> {formData.contactName}
                      </div>
                      <div>
                        <strong>Email:</strong> {formData.email}
                      </div>
                      <div>
                        <strong>Teléfono:</strong> {formData.phone}
                      </div>
                      {formData.eventType && (
                        <div>
                          <strong>Tipo:</strong> {formData.eventType}
                        </div>
                      )}
                      {formData.deliveryDate && (
                        <div>
                          <strong>Entrega:</strong> {formData.deliveryDate}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Products Summary */}
                  <div>
                    <h3 className="font-semibold mb-3">Productos Solicitados</h3>
                    <div className="space-y-3">
                      {quoteItems.map((item, index) => (
                        <div key={item.id} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{item.product}</div>
                            <div className="text-sm text-muted-foreground">
                              Categoría: {item.category} | Cantidad: {item.quantity.toLocaleString()} piezas
                            </div>
                            {item.customization && (
                              <div className="text-sm text-muted-foreground mt-1">
                                Personalización: {item.customization}
                              </div>
                            )}
                            {item.imageUrls.length > 0 && (
                              <div className="mt-2">
                                <div className="text-sm text-muted-foreground mb-1">Imágenes de referencia:</div>
                                <div className="flex space-x-2">
                                  {item.imageUrls.slice(0, 3).map((url, imageIndex) => (
                                    <img
                                      key={imageIndex}
                                      src={url || "/placeholder.svg"}
                                      alt={`Referencia ${imageIndex + 1}`}
                                      className="w-12 h-12 object-cover rounded border"
                                    />
                                  ))}
                                  {item.imageUrls.length > 3 && (
                                    <div className="w-12 h-12 bg-muted-foreground/10 rounded border flex items-center justify-center text-xs">
                                      +{item.imageUrls.length - 3}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              ${item.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-muted-foreground">${item.unitPrice.toFixed(2)} c/u</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Descuento por volumen ({(volumeDiscount * 100).toFixed(0)}%):</span>
                          <span>-${discountAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold text-primary">
                        <span>Total Estimado:</span>
                        <span>${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Requirements */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialRequirements">Requerimientos Especiales</Label>
                      <Textarea
                        id="specialRequirements"
                        value={formData.specialRequirements}
                        onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                        placeholder="Especifica cualquier requerimiento adicional, tiempos de entrega especiales, etc."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Términos de Pago</Label>
                      <Select
                        value={formData.paymentTerms}
                        onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Pago Inmediato</SelectItem>
                          <SelectItem value="15_days">15 días</SelectItem>
                          <SelectItem value="30_days">30 días</SelectItem>
                          <SelectItem value="45_days">45 días</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Anterior
                    </Button>
                    <div className="space-x-2">
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                      </Button>
                      <Button onClick={generateQuote} className="bg-primary hover:bg-primary/90">
                        <FileText className="mr-2 h-4 w-4" />
                        Generar Cotización
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Volume Discount Info */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary">Descuentos por Volumen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold">100+ piezas</div>
                      <div className="text-primary">5% descuento</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold">500+ piezas</div>
                      <div className="text-primary">10% descuento</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold">1,000+ piezas</div>
                      <div className="text-primary">15% descuento</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold">2,000+ piezas</div>
                      <div className="text-primary">20% descuento</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold">5,000+ piezas</div>
                      <div className="text-primary">25% descuento</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsappButton />
    </div>
  )
}
