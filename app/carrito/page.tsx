"use client"

import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { TopHeader } from "@/components/top-header"
import { Footer } from "@/components/footer"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import { useSupabase } from "@/lib/supabase-client"
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  Gift,
  MessageCircle,
  CreditCard,
  Headset,
  Star,
} from "lucide-react"

const purchaseMethods = [
  {
    id: "quote",
    title: "Solicitar cotización",
    description: "Ideal para pedidos corporativos o personalizados. Nuestro equipo te contactará en menos de 24 horas.",
    icon: MessageCircle,
  },
  {
    id: "purchase",
    title: "Comprar ahora",
    description: "Proceso guiado como en Shopify o WooCommerce. Recibe enlace de pago seguro y seguimiento en línea.",
    icon: CreditCard,
  },
  {
    id: "whatsapp",
    title: "Comprar por WhatsApp",
    description: "Atención inmediata por WhatsApp para cerrar tu pedido y resolver dudas al instante.",
    icon: Headset,
  },
]

const formatCurrency = (value: number) =>
  `$${(value || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function CartPage() {
  const router = useRouter()
  const supabase = useSupabase()
  const { items, updateQuantity, removeFromCart, clearCart, getItemCount } = useCart()
  const [selectedMethod, setSelectedMethod] = useState<string>(purchaseMethods[0].id)
  const [orderNotes, setOrderNotes] = useState("")
  const [coupon, setCoupon] = useState("")
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0),
    [items]
  )

  const estimatedShipping = subtotal > 0 ? Math.max(0, subtotal * 0.02) : 0
  const estimatedTaxes = subtotal * 0.16
  const grandTotal = subtotal + estimatedShipping + estimatedTaxes

  useEffect(() => {
    async function fetchRecommendedProducts() {
      if (!supabase) return

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(4)

        if (error) {
          console.error("Error fetching recommended products:", error)
          return
        }

        // Filtrar productos que ya están en el carrito
        const filtered = (data || []).filter(
          (product) => !items.some((item) => item.productId === product.id)
        )

        setRecommendedProducts(
          filtered.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: `$${p.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
            image: p.image_url || `/placeholder.svg?height=128&width=128&query=${p.name}`,
          }))
        )
      } catch (error) {
        console.error("Error:", error)
      }
    }

    fetchRecommendedProducts()
  }, [supabase, items])

  const handleQuantityChange = (productId: string, variationId: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variationId)
      return
    }
    updateQuantity(productId, quantity, variationId)
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Tu carrito está vacío. Agrega productos antes de continuar.")
      return
    }

    switch (selectedMethod) {
      case "quote":
      case "purchase": {
        router.push(`/checkout?method=${selectedMethod}`)
        break
      }
      case "whatsapp": {
        const totalText = formatCurrency(grandTotal)
        const message = encodeURIComponent(
          `Hola, quiero continuar con la compra de ${items
            .map((item) => `${item.quantity}x ${item.product.name}`)
            .join(", ")} por un total estimado de ${totalText}.`
        )
        window.open(`https://wa.me/5215512345678?text=${message}`, "_blank")
        toast.success("Estamos abriendo WhatsApp para finalizar tu pedido.")
        break
      }
      default:
        break
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <WhatsappButton />
        <main className="md:ml-64 p-6">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" className="mb-6" onClick={() => router.push("/productos")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a productos
            </Button>
            <Card className="text-center py-16">
              <CardContent className="flex flex-col items-center gap-4">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
                <p className="text-muted-foreground max-w-md">
                  Explora nuestro catálogo y añade productos personalizados para tus campañas y eventos corporativos.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => router.push("/productos")}>Explorar productos</Button>
                  <Button variant="outline" onClick={() => router.push("/cotizaciones")}>Solicitar cotización</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

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
                Seguir explorando
              </Button>
              <h1 className="text-3xl font-bold">Tu carrito</h1>
              <p className="text-muted-foreground">
                {getItemCount()} producto{getItemCount() === 1 ? "" : "s"} listo{getItemCount() === 1 ? "" : "s"} para personalizar y entregar.
              </p>
            </div>
            <Badge variant="secondary" className="py-2 px-4 text-base">
              Envío nacional &mdash; Atención personalizada
            </Badge>
          </div>

          <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
            <div className="space-y-6">
              {items.map((item) => {
                const variationLabel = item.variation?.color || item.variation?.name
                const itemPriceText = item.price > 0 ? formatCurrency(item.price) : "Consultar precio"
                const itemSubtotal = item.price > 0 ? formatCurrency((item.price || 0) * item.quantity) : "Consultar precio"

                return (
                  <Card key={`${item.productId}-${item.variationId || "base"}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="relative w-full md:w-40 h-40 rounded-lg overflow-hidden bg-muted">
                          <Image
                            src={item.product.image || `/placeholder.svg?height=320&width=320&query=${item.product.name}`}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{item.product.category}</Badge>
                                {variationLabel && <Badge>{variationLabel}</Badge>}
                              </div>
                              <h2 className="text-xl font-semibold">{item.product.name}</h2>
                              <p className="text-sm text-muted-foreground max-w-lg">
                                {item.customization || item.product.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold">{itemPriceText}</p>
                              <p className="text-sm text-muted-foreground">Precio unitario</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(item.productId, item.variationId, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.variationId,
                                    Math.max(1, parseInt(e.target.value) || item.quantity)
                                  )
                                }
                                className="w-20 text-center"
                                min={1}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(item.productId, item.variationId, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-sm text-muted-foreground">Subtotal: {itemSubtotal}</div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => removeFromCart(item.productId, item.variationId)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Quitar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold">Compra con seguridad</h3>
                      <p className="text-sm text-muted-foreground">
                        Contrato de confidencialidad, muestras digitales antes de producción y seguimiento semanal.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Truck className="h-6 w-6 text-primary" />
                    <Gift className="h-6 w-6 text-primary" />
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notas para tu pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Agrega indicaciones especiales de empaque, entrega o personalización."
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de tu pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Envío estimado</span>
                    <span>{formatCurrency(estimatedShipping)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>IVA estimado (16%)</span>
                    <span>{formatCurrency(estimatedTaxes)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total estimado</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    El cálculo final se confirmará antes de la producción. Personalización incluida.
                  </p>

                  <div className="space-y-3">
                    <Label>Código promocional</Label>
                    <div className="flex gap-2">
                      <Input
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="Ingresa un cupón"
                      />
                      <Button
                        variant="outline"
                        onClick={() => toast.info("Validaremos tu cupón durante la revisión del pedido.")}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button size="lg" className="w-full" onClick={handleCheckout}>
                    Finalizar pedido
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      clearCart()
                      toast.success("Vaciamos tu carrito.")
                    }}
                  >
                    Vaciar carrito
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Método de compra</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
                    {purchaseMethods.map((method) => (
                      <label
                        key={method.id}
                        className="flex gap-4 rounded-lg border border-border/70 p-4 hover:border-primary transition cursor-pointer"
                      >
                        <RadioGroupItem value={method.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <method.icon className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{method.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>¿Qué sigue?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>1. Confirmamos existencias y personalización.</p>
                  <p>2. Recibes muestra digital y cotización final.</p>
                  <p>3. Pagas con tarjeta, SPEI o transferencia segura.</p>
                  <p>4. Entregamos en tu oficina o evento.</p>
                </CardContent>
              </Card>

              {recommendedProducts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>También te puede interesar</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {recommendedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-3 border rounded-lg hover:border-primary cursor-pointer transition"
                        onClick={() => router.push(`/productos/${product.id}`)}
                      >
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={product.image_url || `/placeholder.svg?height=128&width=128&query=${product.name}`}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{product.description || ""}</p>
                        </div>
                        <div className="text-sm font-semibold">
                          ${product.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
