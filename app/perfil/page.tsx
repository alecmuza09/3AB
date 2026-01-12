"use client"

import { useState, useEffect } from "react"
import { TopHeader } from "@/components/top-header"
import { Footer } from "@/components/footer"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  LogIn,
  UserPlus,
  Lock,
  CheckCircle,
  AlertCircle,
  Save,
  Building,
  Shield,
  Settings,
  Package,
  Users,
  ShoppingCart,
  Truck,
  Tag,
  FileText,
  Plug,
  BarChart3,
  ExternalLink,
} from "lucide-react"
import { useOrders } from "@/contexts/orders-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

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
  const { user, profile, signIn, signUp, updateProfile, loading: authLoadingContext, isAdmin } = useAuth()
  const router = useRouter()
  
  // Estados para autenticación
  const [authTab, setAuthTab] = useState<"login" | "register">("login")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerFullName, setRegisterFullName] = useState("")
  const [registerPhone, setRegisterPhone] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState<string | null>(null)
  const [authLoading, setAuthLoadingState] = useState(false)

  // Estados para edición de perfil
  const [isEditing, setIsEditing] = useState(false)
  const [editFullName, setEditFullName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editCompany, setEditCompany] = useState("")
  const [editAddress, setEditAddress] = useState("")
  const [editError, setEditError] = useState<string | null>(null)
  const [editSuccess, setEditSuccess] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  // Inicializar valores de edición cuando el perfil se carga
  useEffect(() => {
    if (profile) {
      setEditFullName(profile.full_name || "")
      setEditPhone(profile.phone || "")
      setEditCompany((profile as any).company || "")
      setEditAddress((profile as any).address || "")
    }
  }, [profile])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthSuccess(null)
    setAuthLoadingState(true)

    const { error } = await signIn(loginEmail, loginPassword)

    if (error) {
      setAuthError(error)
      setAuthLoadingState(false)
    } else {
      setAuthSuccess("¡Sesión iniciada correctamente!")
      setLoginEmail("")
      setLoginPassword("")
      setTimeout(() => {
        router.refresh()
      }, 1000)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthSuccess(null)
    setAuthLoadingState(true)

    if (!registerFullName.trim()) {
      setAuthError("El nombre completo es requerido")
      setAuthLoadingState(false)
      return
    }

    if (registerPassword.length < 6) {
      setAuthError("La contraseña debe tener al menos 6 caracteres")
      setAuthLoadingState(false)
      return
    }

    const { error } = await signUp(registerEmail, registerPassword, registerFullName, registerPhone || undefined)

    if (error) {
      setAuthError(error)
      setAuthLoadingState(false)
    } else {
      setAuthSuccess("¡Cuenta creada exitosamente! Por favor, verifica tu email para confirmar tu cuenta.")
      setRegisterEmail("")
      setRegisterPassword("")
      setRegisterFullName("")
      setRegisterPhone("")
      setTimeout(() => {
        setAuthTab("login")
        setAuthSuccess(null)
        setAuthLoadingState(false)
      }, 3000)
    }
  }

  const handleSaveProfile = async () => {
    setEditError(null)
    setEditSuccess(null)
    setEditLoading(true)

    const { error } = await updateProfile({
      full_name: editFullName,
      phone: editPhone || undefined,
      company: editCompany || undefined,
      address: editAddress || undefined,
    })

    if (error) {
      setEditError(error)
      setEditLoading(false)
    } else {
      setEditSuccess("Perfil actualizado correctamente")
      setIsEditing(false)
      setEditLoading(false)
      setTimeout(() => {
        setEditSuccess(null)
        router.refresh()
      }, 2000)
    }
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

  // Si no está autenticado, mostrar formulario de registro/login
  if (!user && !authLoadingContext && !authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopHeader />
        <WhatsappButton />

        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">Mi Cuenta</h1>
              <p className="text-lg text-muted-foreground">
                Inicia sesión o crea una cuenta para acceder a tu perfil
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Acceso a tu cuenta</CardTitle>
                <CardDescription>
                  Ingresa tus credenciales o crea una nueva cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={authTab} onValueChange={(value) => {
                  setAuthTab(value as "login" | "register")
                  setAuthError(null)
                  setAuthSuccess(null)
                }} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Iniciar Sesión
                    </TabsTrigger>
                    <TabsTrigger value="register" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Crear Cuenta
                    </TabsTrigger>
                  </TabsList>

                  {/* Login Tab */}
                  <TabsContent value="login" className="space-y-4 mt-4">
                    {authError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{authError}</AlertDescription>
                      </Alert>
                    )}
                    {authSuccess && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{authSuccess}</AlertDescription>
                      </Alert>
                    )}
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="tu@email.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="pl-10"
                            required
                            disabled={authLoading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="pl-10"
                            required
                            disabled={authLoading}
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-[#DC2626] hover:bg-[#B91C1C]" disabled={authLoading}>
                        {authLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Register Tab */}
                  <TabsContent value="register" className="space-y-4 mt-4">
                    {authError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{authError}</AlertDescription>
                      </Alert>
                    )}
                    {authSuccess && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{authSuccess}</AlertDescription>
                      </Alert>
                    )}
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name">Nombre Completo *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-name"
                            type="text"
                            placeholder="Juan Pérez"
                            value={registerFullName}
                            onChange={(e) => setRegisterFullName(e.target.value)}
                            className="pl-10"
                            required
                            disabled={authLoading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="tu@email.com"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            className="pl-10"
                            required
                            disabled={authLoading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-phone">Teléfono (opcional)</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-phone"
                            type="tel"
                            placeholder="+52 55 1234 5678"
                            value={registerPhone}
                            onChange={(e) => setRegisterPhone(e.target.value)}
                            className="pl-10"
                            disabled={authLoading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Contraseña *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-password"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            className="pl-10"
                            required
                            minLength={6}
                            disabled={authLoading}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          La contraseña debe tener al menos 6 caracteres
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                          <strong>Nota:</strong> Al crear una cuenta, se creará como cliente. Si necesitas permisos de administrador, contacta al soporte.
                        </p>
                      </div>
                      <Button type="submit" className="w-full bg-[#DC2626] hover:bg-[#B91C1C]" disabled={authLoading}>
                        {authLoading ? "Creando cuenta..." : "Crear Cuenta"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Si está autenticado, mostrar configuración completa
  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <WhatsappButton />

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Mi Perfil</h1>
            <p className="text-lg text-muted-foreground">
              Gestiona tu información personal y revisa tu historial de compras.
            </p>
          </div>

          <Tabs defaultValue="perfil" className="space-y-6">
            <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
              <TabsTrigger value="perfil">Información Personal</TabsTrigger>
              <TabsTrigger value="historial">Historial de Compras</TabsTrigger>
              <TabsTrigger value="recordatorios">Recordatorios</TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="administracion" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Administración
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="perfil" className="space-y-6">
              {/* User Info Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="text-lg">
                          {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl">{profile?.full_name || user?.email || "Usuario"}</CardTitle>
                        <p className="text-muted-foreground">{(profile as any)?.company || "Cliente"}</p>
                        <Badge variant="outline" className="mt-2">
                          Cliente desde {profile?.created_at ? formatDate(profile.created_at) : "Reciente"}
                        </Badge>
                      </div>
                    </div>
                    {!isEditing ? (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Perfil
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => {
                          setIsEditing(false)
                          setEditError(null)
                          setEditSuccess(null)
                        }}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={editLoading}>
                          <Save className="h-4 w-4 mr-2" />
                          {editLoading ? "Guardando..." : "Guardar"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {editError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{editError}</AlertDescription>
                    </Alert>
                  )}
                  {editSuccess && (
                    <Alert className="mb-4">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{editSuccess}</AlertDescription>
                    </Alert>
                  )}
                  {isEditing ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Nombre Completo</Label>
                          <Input
                            id="edit-name"
                            value={editFullName}
                            onChange={(e) => setEditFullName(e.target.value)}
                            placeholder="Nombre completo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-phone">Teléfono</Label>
                          <Input
                            id="edit-phone"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="+52 55 1234 5678"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-email">Email</Label>
                          <Input
                            id="edit-email"
                            value={user?.email || ""}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-company">Empresa</Label>
                          <Input
                            id="edit-company"
                            value={editCompany}
                            onChange={(e) => setEditCompany(e.target.value)}
                            placeholder="Nombre de la empresa"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-address">Dirección</Label>
                          <Input
                            id="edit-address"
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            placeholder="Dirección completa"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{user?.email || "No disponible"}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Teléfono</p>
                            <p className="font-medium">{profile?.phone || "No disponible"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Building className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Empresa</p>
                            <p className="font-medium">{(profile as any)?.company || "No disponible"}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Dirección</p>
                            <p className="font-medium">{(profile as any)?.address || "No disponible"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                    <p className="text-2xl font-bold">{profile?.created_at ? formatDate(profile.created_at) : "Reciente"}</p>
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

            {/* Administración Tab - Solo para admins */}
            {isAdmin && (
              <TabsContent value="administracion" className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Panel de Administración</h3>
                  <p className="text-muted-foreground">
                    Acceso rápido a las configuraciones y herramientas de administración de la plataforma.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Dashboard */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/admin?section=dashboard")}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">Dashboard</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Vista general de estadísticas y métricas de la plataforma
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Ir al Dashboard
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Productos */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/admin?section=products")}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Package className="h-5 w-5 text-green-600" />
                        </div>
                        <CardTitle className="text-lg">Productos</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Gestiona el catálogo de productos y sus variaciones
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Gestionar Productos
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Pedidos */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/admin?section=orders")}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <ShoppingCart className="h-5 w-5 text-purple-600" />
                        </div>
                        <CardTitle className="text-lg">Pedidos</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Administra pedidos, cotizaciones y su estado
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Ver Pedidos
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Clientes */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/admin?section=customers")}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Users className="h-5 w-5 text-orange-600" />
                        </div>
                        <CardTitle className="text-lg">Clientes</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Gestiona información y datos de clientes
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Ver Clientes
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Usuarios y Roles */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/admin?section=users-roles")}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Shield className="h-5 w-5 text-red-600" />
                        </div>
                        <CardTitle className="text-lg">Usuarios y Roles</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Administra usuarios, roles y permisos del sistema
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Gestionar Usuarios
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Inventario */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/admin?section=inventory")}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-teal-100 rounded-lg">
                          <Truck className="h-5 w-5 text-teal-600" />
                        </div>
                        <CardTitle className="text-lg">Inventario</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Control de stock y movimientos de inventario
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Ver Inventario
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Cupones */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/admin?section=coupons")}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Tag className="h-5 w-5 text-yellow-600" />
                        </div>
                        <CardTitle className="text-lg">Cupones</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Crea y gestiona cupones de descuento
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Gestionar Cupones
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Reportes */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/admin?section=reports")}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <FileText className="h-5 w-5 text-indigo-600" />
                        </div>
                        <CardTitle className="text-lg">Reportes</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Genera reportes y análisis de la plataforma
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Ver Reportes
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Integraciones */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/admin?section=integrations")}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-pink-100 rounded-lg">
                          <Plug className="h-5 w-5 text-pink-600" />
                        </div>
                        <CardTitle className="text-lg">Integraciones</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Configura integraciones con servicios externos
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Configurar
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Configuración General */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/admin?section=settings")}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Settings className="h-5 w-5 text-gray-600" />
                        </div>
                        <CardTitle className="text-lg">Configuración</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Ajustes generales de la plataforma
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Configurar
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Acceso Directo al Panel Completo */}
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Panel de Administración Completo
                    </CardTitle>
                    <CardDescription>
                      Accede al panel completo de administración con todas las herramientas disponibles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => router.push("/admin")} 
                      className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                      size="lg"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Ir al Panel de Administración
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
