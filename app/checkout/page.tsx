"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { TopHeader } from "@/components/top-header"
import { Footer } from "@/components/footer"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useCart } from "@/contexts/cart-context"
import { useOrders } from "@/contexts/orders-context"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import {
  ArrowLeft,
  MapPin,
  Building2,
  Phone,
  Mail,
  Gift,
  Truck,
  ShieldCheck,
  CreditCard,
  FileText,
  ArrowRight,
} from "lucide-react"

const formatCurrency = (value: number) =>
  `$${(value || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const shippingMethods = [
  {
    id: "standard",
    title: "Envío estándar",
    description: "3-5 días hábiles. Ideal para entregas regulares.",
    cost: 250,
  },
  {
    id: "express",
    title: "Envío express",
    description: "1-2 días hábiles. Prioridad de producción y entrega.",
    cost: 450,
  },
  {
    id: "pickup",
    title: "Recolectar en showroom",
    description: "Sin costo. Agenda para recoger en CDMX.",
    cost: 0,
  },
]

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const methodParam = searchParams.get("method") || "purchase"

  const { items, getTotal, clearCart } = useCart()
  const { addOrder } = useOrders()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPaymentInfo, setShowPaymentInfo] = useState(false)
  const [confirmedOrderId, setConfirmedOrderId] = useState("")

  const [contactData, setContactData] = useState({
    company: "",
    contactName: "",
    email: "",
    phone: "",
  })

  const [shippingData, setShippingData] = useState({
    addressLine: "",
    neighborhood: "",
    city: "",
    state: "",
    postalCode: "",
    country: "México",
    shippingNotes: "",
  })

  const [billingData, setBillingData] = useState({
    businessName: "",
    taxId: "",
    billingEmail: "",
    billingAddress: "",
  })

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/carrito")
    }
  }, [items.length, router])

  const subtotal = useMemo(() => getTotal(), [getTotal])
  const selectedShipping = shippingMethods.find((method) => method.id === shippingMethod) || shippingMethods[0]
  const shippingCost = selectedShipping.cost
  const taxes = subtotal * 0.16
  const grandTotal = subtotal + shippingCost + taxes

  const handleContactSubmit = () => {
    if (!contactData.contactName || !contactData.email || !contactData.phone) {
      toast.error("Completa nombre, correo y teléfono para continuar.")
      return
    }
    setStep(2)
  }

  const handleShippingSubmit = () => {
    if (shippingMethod !== "pickup") {
      if (!shippingData.postalCode || !shippingData.addressLine || !shippingData.city || !shippingData.state) {
        toast.error("Completa la dirección de envío o selecciona recolección.")
        return
      }
    }
    setStep(3)
  }

  const handleConfirm = async () => {
    if (step !== 3) return

    setIsSubmitting(true)

    const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`
    
    const orderData = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: methodParam === "quote" ? "Cotización" : "En revisión",
      total: grandTotal,
      subtotal,
      taxes,
      shippingCost,
      paymentMethod: methodParam === "quote" ? "quote" : "purchase",
      contact: contactData,
      shipping: {
        method: shippingMethod,
        addressLine: shippingData.addressLine,
        neighborhood: shippingData.neighborhood,
        city: shippingData.city,
        state: shippingData.state,
        postalCode: shippingData.postalCode,
        country: shippingData.country,
        notes: shippingData.shippingNotes,
      },
      billing: {
        billingSameAsShipping,
        businessName: billingData.businessName,
        taxId: billingData.taxId,
        billingEmail: billingData.billingEmail,
        billingAddress: billingData.billingAddress,
      },
      items: items.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.pricing.unitPrice || 0,
        subtotal: (item.pricing.unitPrice || 0) * item.quantity,
        variationLabel: item.variation?.color || item.variation?.name,
        image: item.product.image,
      })),
    }

    try {
      console.log('📦 Enviando pedido a la API...', {
        orderId,
        items: orderData.items.length,
        total: orderData.total
      })

      // Guardar en la base de datos (Supabase)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      console.log('📡 Respuesta de API:', response.status, response.statusText)

      const result = await response.json()
      console.log('📄 Resultado:', result)

      if (!response.ok) {
        console.error('❌ Error de API:', result)
        
        // Mostrar mensaje de error más específico
        const errorMessage = result.hint 
          ? `${result.error}. ${result.hint}` 
          : result.error || 'Error al crear el pedido'
        
        throw new Error(errorMessage)
      }

      console.log('✅ Pedido creado exitosamente:', result.order?.order_number)

      // También guardar en localStorage para que el usuario lo vea en /pedidos
      addOrder(orderData)

      clearCart()
      setIsSubmitting(false)
      
      // Guardar el ID del pedido y mostrar información de pago
      setConfirmedOrderId(orderId)
      setShowPaymentInfo(true)
    } catch (error) {
      console.error('❌ Error creating order:', error)
      setIsSubmitting(false)
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      // Si el error contiene información técnica, mostrar solo la parte relevante
      if (errorMessage.includes('tabla') || errorMessage.includes('table')) {
        toast.error("Error de configuración. Por favor contacta al administrador.", {
          description: "Las tablas de pedidos no están configuradas correctamente."
        })
      } else {
        toast.error("Hubo un problema al procesar tu pedido.", {
          description: errorMessage.length > 100 
            ? "Por favor intenta de nuevo o contáctanos por WhatsApp." 
            : errorMessage
        })
      }
    }
  }

  const contactCompleted = step > 1
  const shippingCompleted = step > 2

  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <WhatsappButton />

      <main className="p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al carrito
              </Button>
              <h1 className="text-3xl font-bold">Finaliza tu pedido</h1>
              <p className="text-muted-foreground">
                Completa tu información para generar el resumen de compra y el cálculo de envío.
              </p>
            </div>
            <Badge variant="outline" className="px-4 py-2 text-sm">
              Método seleccionado: {methodParam === "quote" ? "Cotización personalizada" : "Compra guiada"}
            </Badge>
          </div>

          <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
            <div className="space-y-6">
              <Card className={step === 1 ? "border-primary" : contactCompleted ? "opacity-80" : ""}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>1. Datos de contacto</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      ¿Quién será el responsable del pedido?
                    </p>
                  </div>
                  {contactCompleted && <Badge variant="secondary">Completado</Badge>}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre completo *</Label>
                      <Input
                        value={contactData.contactName}
                        onChange={(e) => setContactData((prev) => ({ ...prev, contactName: e.target.value }))}
                        placeholder="Nombre y apellido"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Empresa</Label>
                      <Input
                        value={contactData.company}
                        onChange={(e) => setContactData((prev) => ({ ...prev, company: e.target.value }))}
                        placeholder="Ej. 3A Branding"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Correo electrónico *</Label>
                      <Input
                        type="email"
                        value={contactData.email}
                        onChange={(e) => setContactData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="nombre@empresa.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono *</Label>
                      <Input
                        value={contactData.phone}
                        onChange={(e) => setContactData((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="55 1234 5678"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t p-4">
                  <Button onClick={handleContactSubmit}>
                    Continuar con envío
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>

              <Card className={step === 2 ? "border-primary" : shippingCompleted ? "opacity-80" : ""}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>2. Información de entrega</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Calcula el envío o elige recolección.
                    </p>
                  </div>
                  {shippingCompleted && <Badge variant="secondary">Completado</Badge>}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Método de entrega</Label>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="gap-4">
                      {shippingMethods.map((method) => (
                        <label
                          key={method.id}
                          className="flex gap-4 rounded-lg border border-border/70 p-4 hover:border-primary transition cursor-pointer"
                        >
                          <RadioGroupItem value={method.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{method.title}</span>
                              <span className="text-sm font-medium">{formatCurrency(method.cost)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  {shippingMethod !== "pickup" && (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Código postal *</Label>
                          <Input
                            value={shippingData.postalCode}
                            onChange={(e) => setShippingData((prev) => ({ ...prev, postalCode: e.target.value }))}
                            placeholder="Ej. 01000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Ciudad *</Label>
                          <Input
                            value={shippingData.city}
                            onChange={(e) => setShippingData((prev) => ({ ...prev, city: e.target.value }))}
                            placeholder="Ciudad"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Estado *</Label>
                          <Input
                            value={shippingData.state}
                            onChange={(e) => setShippingData((prev) => ({ ...prev, state: e.target.value }))}
                            placeholder="Estado"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Colonia / Barrio</Label>
                          <Input
                            value={shippingData.neighborhood}
                            onChange={(e) => setShippingData((prev) => ({ ...prev, neighborhood: e.target.value }))}
                            placeholder="Colonia"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Dirección *</Label>
                        <Input
                          value={shippingData.addressLine}
                          onChange={(e) => setShippingData((prev) => ({ ...prev, addressLine: e.target.value }))}
                          placeholder="Calle, número exterior e interior"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Notas de entrega</Label>
                        <Textarea
                          rows={3}
                          value={shippingData.shippingNotes}
                          onChange={(e) => setShippingData((prev) => ({ ...prev, shippingNotes: e.target.value }))}
                          placeholder="Horarios, referencias o requisitos de acceso"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 rounded-lg border border-border/70 px-4 py-3">
                    <Switch
                      checked={billingSameAsShipping}
                      onCheckedChange={setBillingSameAsShipping}
                      id="billingSwitch"
                    />
                    <Label htmlFor="billingSwitch" className="font-medium">
                      Usar la misma información para facturación
                    </Label>
                  </div>

                  {!billingSameAsShipping && (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Razón social</Label>
                          <Input
                            value={billingData.businessName}
                            onChange={(e) => setBillingData((prev) => ({ ...prev, businessName: e.target.value }))}
                            placeholder="Nombre o razón social"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>RFC / Tax ID</Label>
                          <Input
                            value={billingData.taxId}
                            onChange={(e) => setBillingData((prev) => ({ ...prev, taxId: e.target.value }))}
                            placeholder="RFC"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Correo para facturas</Label>
                        <Input
                          type="email"
                          value={billingData.billingEmail}
                          onChange={(e) => setBillingData((prev) => ({ ...prev, billingEmail: e.target.value }))}
                          placeholder="facturacion@empresa.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Dirección fiscal</Label>
                        <Textarea
                          rows={3}
                          value={billingData.billingAddress}
                          onChange={(e) => setBillingData((prev) => ({ ...prev, billingAddress: e.target.value }))}
                          placeholder="Dirección completa para facturación"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-end border-t p-4">
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Regresar
                    </Button>
                    <Button onClick={handleShippingSubmit}>
                      Revisar pedido
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              <Card className={step === 3 ? "border-primary" : "opacity-70"}>
                <CardHeader>
                  <CardTitle>3. Revisión y confirmación</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Verifica los detalles antes de enviar tu pedido.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Resumen de contacto
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Contacto</span>
                        <p>{contactData.contactName || "Sin definir"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Correo</span>
                        <p>{contactData.email || "Sin definir"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Teléfono</span>
                        <p>{contactData.phone || "Sin definir"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Empresa</span>
                        <p>{contactData.company || "Sin definir"}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Dirección de entrega
                    </h3>
                    {shippingMethod === "pickup" ? (
                      <p className="text-sm text-muted-foreground">
                        Recolectarás en nuestro showroom CDMX. Te enviaremos la dirección exacta y horario.
                      </p>
                    ) : (
                      <div className="text-sm space-y-1">
                        <p>{shippingData.addressLine || "Sin definir"}</p>
                        <p>
                          {shippingData.city || ""} {shippingData.state ? `, ${shippingData.state}` : ""} {shippingData.postalCode}
                        </p>
                        <p>{shippingData.country}</p>
                        {shippingData.shippingNotes && <p className="text-muted-foreground">Notas: {shippingData.shippingNotes}</p>}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Método sugerido
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {methodParam === "quote"
                        ? "Generaremos una cotización formal con la información capturada y un asesor te contactará para confirmar cantidades, personalización y tiempos de entrega."
                        : "Te enviaremos un enlace de pago seguro (tarjeta, SPEI o transferencia) junto con tu confirmación de pedido."}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 border-t p-4">
                  <Button size="lg" onClick={handleConfirm} disabled={isSubmitting}>
                    {isSubmitting ? "Procesando..." : "Confirmar pedido"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Al confirmar aceptas nuestros términos de producción y tiempos de entrega. Un asesor se pondrá en contacto en menos de 4 horas hábiles.
                  </p>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen del carrito</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.key} className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={item.product.image || `/placeholder.svg?height=128&width=128&query=${item.product.name}`}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 text-sm">
                          <p className="font-medium line-clamp-1">{item.product.name}</p>
                          <p className="text-muted-foreground">
                            Cantidad: {item.quantity}
                            {item.variation?.color && ` · ${item.variation.color}`}
                          </p>
                        </div>
                        <div className="text-sm font-semibold">
                          {formatCurrency((item.pricing.unitPrice || 0) * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Envío</span>
                    <span>{formatCurrency(shippingCost)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>IVA (16%)</span>
                    <span>{formatCurrency(taxes)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total estimado</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    El envío puede ajustarse según la ubicación exacta y el peso final del pedido.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Compra protegida</h3>
                      <p className="text-sm text-muted-foreground">
                        Revisamos arte final antes de producción y enviamos avances fotográficos.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Logística especializada</h3>
                      <p className="text-sm text-muted-foreground">Coordinamos envíos nacionales y entregas para eventos.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Gift className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Proyectos llave en mano</h3>
                      <p className="text-sm text-muted-foreground">Desde el mockup hasta la entrega final en tu stand o oficina.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Dialog: Información de Pago */}
        <Dialog open={showPaymentInfo} onOpenChange={setShowPaymentInfo}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">¡Pedido Registrado Exitosamente!</DialogTitle>
              <DialogDescription>
                Tu pedido ha sido recibido. A continuación encontrarás la información para realizar tu pago.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Número de Referencia */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Número de Referencia:</p>
                <p className="text-2xl font-bold text-primary">{confirmedOrderId}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Por favor menciona este número en tu transferencia o depósito
                </p>
              </div>

              {/* Datos Bancarios */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Datos para Transferencia
                </h3>

                <div className="grid gap-3">
                  <div className="flex flex-col p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Beneficiario</span>
                    <span className="font-medium">3A BRANDING GROUP S.A. DE C.V.</span>
                  </div>

                  <div className="flex flex-col p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">RFC</span>
                    <span className="font-medium">ABG150227SA1</span>
                  </div>

                  <div className="flex flex-col p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Banco</span>
                    <span className="font-medium">SANTANDER</span>
                  </div>

                  <div className="flex flex-col p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Número de Cuenta</span>
                    <span className="font-medium text-lg">65-50500620-5</span>
                  </div>

                  <div className="flex flex-col p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Clabe Interbancaria</span>
                    <span className="font-medium text-lg">014180655050062058</span>
                  </div>
                </div>
              </div>

              {/* Instrucciones de Pago */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Envío de Comprobante
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Agradecemos nos hagas llegar tu comprobante de pago a la siguiente dirección de correo:
                </p>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2 rounded border">
                  <Mail className="h-4 w-4 text-primary" />
                  <a 
                    href="mailto:factura@3abranding.com" 
                    className="font-medium text-primary hover:underline"
                  >
                    factura@3abranding.com
                  </a>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  No olvides incluir tu número de referencia: <strong>{confirmedOrderId}</strong>
                </p>
              </div>

              {/* Botón de Acción */}
              <div className="flex flex-col gap-2">
                <Button 
                  size="lg" 
                  onClick={() => {
                    setShowPaymentInfo(false)
                    router.push("/pedidos")
                  }}
                  className="w-full"
                >
                  Ver Estado de mi Pedido
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  También te hemos enviado esta información por correo electrónico
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
