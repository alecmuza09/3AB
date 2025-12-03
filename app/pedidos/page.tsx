"use client"

import { Sidebar } from "@/components/sidebar"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useOrders } from "@/contexts/orders-context"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ArrowLeft,
  ShoppingBag,
  Clock,
  MapPin,
  FileText,
  Download,
  Eye,
  Package,
  CheckCircle,
} from "lucide-react"

const statusColors: Record<string, string> = {
  "En revisión": "bg-blue-500",
  "En producción": "bg-yellow-500",
  "Enviado": "bg-purple-500",
  "Entregado": "bg-green-500",
  "Cotización": "bg-amber-500",
}

const formatCurrency = (value: number) =>
  `$${(value || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

export default function PedidosPage() {
  const router = useRouter()
  const { orders } = useOrders()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <WhatsappButton />

      <main className="md:ml-64 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-3xl font-bold">Mis pedidos</h1>
              <p className="text-muted-foreground">
                Consulta el estado de tus proyectos, descargas y documentación.
              </p>
            </div>
            <Badge variant="secondary" className="px-4 py-2">
              Total pedidos: {orders.length}
            </Badge>
          </div>

          {orders.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent className="space-y-4">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto" />
                <h2 className="text-2xl font-semibold">Todavía no tienes pedidos</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Una vez que confirmes tu primer pedido, verás aquí el resumen de producción, envíos y documentos.
                </p>
                <Button onClick={() => router.push("/productos")}>Explorar catálogo</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <CardTitle className="text-xl">{order.id}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                        <Badge className={`${statusColors[order.status] || "bg-gray-500"}`}>{order.status}</Badge>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">Total estimado</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(order.total)}</p>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Detalles
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Contacto</h3>
                        <p className="text-sm font-medium">{order.contact.contactName}</p>
                        <p className="text-xs text-muted-foreground">{order.contact.email}</p>
                        <p className="text-xs text-muted-foreground">{order.contact.phone}</p>
                        {order.contact.company && (
                          <p className="text-xs text-muted-foreground">{order.contact.company}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> Envío
                        </h3>
                        <p className="text-sm">{order.shipping.method}</p>
                        {order.shipping.addressLine ? (
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>{order.shipping.addressLine}</p>
                            <p>
                              {order.shipping.city} {order.shipping.state && `, ${order.shipping.state}`} {order.shipping.postalCode}
                            </p>
                            <p>{order.shipping.country}</p>
                            {order.shipping.notes && <p>Notas: {order.shipping.notes}</p>}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Recolectarás en showroom.</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Resumen</h3>
                        <p className="text-sm flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(order.subtotal)}</span>
                        </p>
                        <p className="text-sm flex justify-between">
                          <span>Envío:</span>
                          <span>{formatCurrency(order.shippingCost)}</span>
                        </p>
                        <p className="text-sm flex justify-between">
                          <span>IVA:</span>
                          <span>{formatCurrency(order.taxes)}</span>
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Package className="h-4 w-4" /> Productos
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div
                            key={`${order.id}-${index}`}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-border/60 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-14 h-14 rounded-md overflow-hidden bg-muted">
                                <Image
                                  src={item.image || `/placeholder.svg?height=120&width=120&query=${item.name}`}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Cantidad: {item.quantity}
                                  {item.variationLabel && ` · ${item.variationLabel}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-sm text-right">
                              <p>{formatCurrency(item.unitPrice)}</p>
                              <p className="text-muted-foreground">Subtotal: {formatCurrency(item.subtotal)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t p-4">
                    <p className="text-xs text-muted-foreground">
                      Recibirás actualizaciones en tu correo. Nuestro equipo asignado te contactará para confirmar pruebas de arte.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => router.push("/contacto")}>Solicitar cambios</Button>
                      <Button size="sm" className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" /> Reordenar
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

