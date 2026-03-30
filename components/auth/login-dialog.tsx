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
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { LogIn, UserPlus, Mail, Lock, User, Phone, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Mode = "login" | "register"

export function LoginDialog() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("login")

  // Campos compartidos
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Campos solo de registro
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [registered, setRegistered] = useState(false)

  const { signIn, signUp, user } = useAuth()

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setFullName("")
    setPhone("")
    setConfirmPassword("")
    setError(null)
    setRegistered(false)
  }

  const switchMode = (next: Mode) => {
    resetForm()
    setMode(next)
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) {
      resetForm()
      setMode("login")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: signInError } = await signIn(email, password)
    if (signInError) {
      setError(signInError)
      setLoading(false)
    } else {
      handleOpenChange(false)
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    setLoading(true)
    const { error: signUpError } = await signUp(email, password, fullName || undefined, phone || undefined)
    if (signUpError) {
      setError(signUpError)
      setLoading(false)
    } else {
      setRegistered(true)
      setLoading(false)
    }
  }

  if (user) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <LogIn className="h-4 w-4 mr-2" />
          Iniciar Sesión
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {/* ── LOGIN ── */}
        {mode === "login" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Iniciar Sesión
              </DialogTitle>
              <DialogDescription>
                Ingresa tus credenciales para acceder a tu cuenta
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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

              <Button type="submit" className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">¿No tienes cuenta?</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => switchMode("register")}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Crear cuenta nueva
            </Button>
          </>
        )}

        {/* ── REGISTRO ── */}
        {mode === "register" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Crear Cuenta
              </DialogTitle>
              <DialogDescription>
                Regístrate para acceder a pedidos, cotizaciones y más
              </DialogDescription>
            </DialogHeader>

            {registered ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ¡Cuenta creada con éxito! Revisa tu email para confirmar tu cuenta y luego inicia sesión.
                  </AlertDescription>
                </Alert>
                <Button
                  type="button"
                  className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                  onClick={() => switchMode("login")}
                >
                  Ir a Iniciar Sesión
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reg-name">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Juan Pérez"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Teléfono <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-phone"
                      type="tel"
                      placeholder="+52 55 1234 5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-email"
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-password"
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
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm">Confirmar</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reg-confirm"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                  disabled={loading}
                >
                  {loading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    className="text-[#DC2626] hover:underline font-medium"
                    onClick={() => switchMode("login")}
                  >
                    Inicia sesión
                  </button>
                </p>
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}


