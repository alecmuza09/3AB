"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, Phone, AlertCircle, CheckCircle, Building2, Receipt } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type AccountType = 'personal' | 'business'

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [accountType, setAccountType] = useState<AccountType>('personal')
  const [companyName, setCompanyName] = useState("")
  const [taxId, setTaxId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError(signInError)
      setLoading(false)
    } else {
      setSuccess("¡Sesión iniciada correctamente!")
      setEmail("")
      setPassword("")
      setTimeout(() => {
        onOpenChange(false)
        setLoading(false)
      }, 1000)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (!fullName.trim()) {
      setError("El nombre completo es requerido")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    if (accountType === 'business' && !companyName.trim()) {
      setError("La razón social es requerida para cuentas empresariales")
      setLoading(false)
      return
    }

    const { error: signUpError } = await signUp(
      email,
      password,
      fullName,
      phone || undefined,
      companyName || undefined,
      taxId || undefined,
      accountType
    )

    if (signUpError) {
      setError(signUpError)
      setLoading(false)
    } else {
      setSuccess("¡Cuenta creada exitosamente! Por favor, verifica tu email para confirmar tu cuenta.")
      resetForm()
      setTimeout(() => {
        setActiveTab("login")
        setSuccess(null)
        setLoading(false)
      }, 3000)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setFullName("")
    setPhone("")
    setCompanyName("")
    setTaxId("")
    setAccountType('personal')
    setError(null)
    setSuccess(null)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Cuenta</DialogTitle>
          <DialogDescription>
            Inicia sesión o crea una cuenta para continuar
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value as "login" | "register")
          resetForm()
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
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#DC2626] hover:bg-[#B91C1C]" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-4 mt-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleRegister} className="space-y-4">

              {/* Tipo de cuenta */}
              <div className="space-y-2">
                <Label>Tipo de cuenta</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('personal')}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-sm transition-colors ${
                      accountType === 'personal'
                        ? 'border-[#DC2626] bg-red-50 text-[#DC2626] dark:bg-red-950/20'
                        : 'border-muted text-muted-foreground hover:border-muted-foreground'
                    }`}
                  >
                    <UserIcon className="h-5 w-5" />
                    <span className="font-medium">Persona física</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('business')}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-sm transition-colors ${
                      accountType === 'business'
                        ? 'border-[#DC2626] bg-red-50 text-[#DC2626] dark:bg-red-950/20'
                        : 'border-muted text-muted-foreground hover:border-muted-foreground'
                    }`}
                  >
                    <Building2 className="h-5 w-5" />
                    <span className="font-medium">Empresa / B2B</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-name">Nombre Completo *</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Juan Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Campos empresa — solo si es B2B */}
              {accountType === 'business' && (
                <div className="space-y-3 p-3 bg-muted/40 rounded-lg border border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Datos de empresa</p>
                  <div className="space-y-2">
                    <Label htmlFor="register-company">Razón Social *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-company"
                        type="text"
                        placeholder="Corporativo XYZ S.A. de C.V."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-tax-id">RFC (opcional)</Label>
                    <div className="relative">
                      <Receipt className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-tax-id"
                        type="text"
                        placeholder="XAXX010101000"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                        className="pl-10"
                        maxLength={13}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="register-password">Contraseña *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              </div>

              <Button type="submit" className="w-full bg-[#DC2626] hover:bg-[#B91C1C]" disabled={loading}>
                {loading ? "Creando cuenta..." : accountType === 'business' ? "Crear Cuenta Empresarial" : "Crear Cuenta"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
