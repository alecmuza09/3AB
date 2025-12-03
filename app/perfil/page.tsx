"use client"

import { Sidebar } from "@/components/sidebar"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  ShoppingBag,
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit,
  Download,
  Eye,
  Gift,
  Calendar,
  TrendingUp,
  Bell,
} from "lucide-react"
import { useOrders } from "@/contexts/orders-context"

const formatCurrency = (value: number) =>
  `$${(value || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

export default function PerfilPage() {
  const { orders } = useOrders()

  const userInfo = {
    name: "María González",
    email: "maria.gonzalez@empresa.com",
    phone: "+52 55 1234 5678",
    company: "Empresa Ejemplo S.A. de C.V.",
    address: "Av. Reforma 123, Col. Centro, CDMX",
    memberSince: "Enero 2023",
    birthday: "15 de Marzo",
    anniversary: "10 de Enero",
  }

  const fallbackHistory = [
    {
      id: "ORD-2024-001",
      createdAt: "2024-01-15T10:00:00Z",
      status: "Entregado",
      total: 45000,
      items: [
        { name: "Tazas Promocionales", quantity: 100, subtotal: 15000 },
        { name: "Bolígrafos Premium", quantity: 200, subtotal: 16000 },
        { name: "Gorras Bordadas", quantity: 50, subtotal: 14000 },
      ],
    },
  ]

  const history = orders.length > 0 ? orders : fallbackHistory

  const upcomingReminders = [
    {
      type: "birthday",
      title: "Cumpleaños de la empresa",
      date: "15 Mar 2024",
      description: "¡Perfecto momento para productos promocionales especiales!",
      icon: Gift,
      color: "text-pink-500",
    },
    {
      type: "anniversary",
      title: "Aniversario como cliente",
      date: "10 Ene 2025",
      description: "2 años siendo parte de la familia 3A Branding",
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      type: "reorder",
      title: "Reorden sugerida",
      date: "Próximamente",
      description: "Basado en tu historial, podrías necesitar más bolígrafos",
      icon: TrendingUp,
      color: "text-green-500",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Entregado":
      case "Entregado ":
        return "bg-green-500"
      case "En producción":
      case "En producción ":
        return "bg-blue-500"
      case "En revisión":
        return "bg-blue-500"
      case "Cotización":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const totalSpent = history.reduce((sum, order) => sum + (order.total || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <WhatsappButton />

      <main className="md:ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Mi Perfil</h1>
            <p className="text-lg text-muted-foreground">
              Gestiona tu información personal y revisa tu historial de compras.
            </p>
          </div>

          <Tabs defaultValue="perfil" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="perfil">Información Personal</TabsTrigger>
              <TabsTrigger value="historial">Historial de Compras</TabsTrigger>
              <TabsTrigger value="recordatorios">Recordatorios</TabsTrigger>
            </TabsList>

            <TabsContent value="perfil" className="space-y-6">
              {/* User Info Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="text-lg">MG</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl">{userInfo.name}</CardTitle>
                        <p className="text-muted-foreground">{userInfo.company}</p>
                        <Badge variant="outline" className="mt-2">
                          Cliente desde {userInfo.memberSince}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{userInfo.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Teléfono</p>
                          <p className="font-medium">{userInfo.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Gift className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Cumpleaños Empresa</p>
                          <p className="font-medium">{userInfo.birthday}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Dirección</p>
                          <p className="font-medium">{userInfo.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Empresa</p>
                          <p className="font-medium">{userInfo.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Aniversario Cliente</p>
                          <p className="font-medium">{userInfo.anniversary}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historial" className="space-y-6">
              <div className="space-y-4">
                {history.map((order: any) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <CardTitle className="text-lg">Pedido {order.id}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(order.status || "")}>{order.status || "En revisión"}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{formatCurrency(order.total || 0)}</p>
                          <div className="flex space-x-2 mt-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              PDF
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-3">PRODUCTOS:</h4>
                        {(order.items || []).map((item: any, index: number) => (
                          <div
                            key={`${order.id}-${index}`}
                            className="flex justify-between items-center py-2 border-b border-border/50 last:border-0"
                          >
                            <div className="flex items-center space-x-3">
                              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{item.name}</span>
                              <Badge variant="outline" className="text-xs">
                                Qty: {item.quantity}
                              </Badge>
                            </div>
                            <span className="font-semibold">{formatCurrency(item.subtotal || (item.price || item.unitPrice || 0))}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <ShoppingBag className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{history.length}</p>
                    <p className="text-sm text-muted-foreground">Pedidos Totales</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
                    <p className="text-sm text-muted-foreground">Total Invertido</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <User className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">1 año</p>
                    <p className="text-sm text-muted-foreground">Cliente desde</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recordatorios" className="space-y-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Recordatorios Automáticos</h3>
                <p className="text-muted-foreground">
                  Te enviamos recordatorios personalizados para que nunca pierdas oportunidades importantes.
                </p>
              </div>

              <div className="space-y-4">
                {upcomingReminders.map((reminder, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <reminder.icon className={`h-6 w-6 ${reminder.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-lg">{reminder.title}</h4>
                            <Badge variant="outline">{reminder.date}</Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{reminder.description}</p>
                          <Button size="sm" className="bg-primary hover:bg-primary/90">
                            <Bell className="h-3 w-3 mr-2" />
                            Configurar Recordatorio
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Notificaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Recordatorios de cumpleaños</p>
                        <p className="text-sm text-muted-foreground">Te avisamos 30 días antes</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Activado
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Aniversario como cliente</p>
                        <p className="text-sm text-muted-foreground">Celebramos contigo cada año</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Activado
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Sugerencias de reorden</p>
                        <p className="text-sm text-muted-foreground">Basado en tu historial de compras</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Activado
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
