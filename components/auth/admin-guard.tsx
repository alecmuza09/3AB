"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const LOADING_MAX_MS = 12000

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [loadingTimedOut, setLoadingTimedOut] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/")
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    if (!loading) {
      setLoadingTimedOut(false)
      return
    }
    const t = setTimeout(() => setLoadingTimedOut(true), LOADING_MAX_MS)
    return () => clearTimeout(t)
  }, [loading])

  if (loading && !loadingTimedOut) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (loading && loadingTimedOut) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Verificación lenta</AlertTitle>
          <AlertDescription>
            La sesión tarda en cargar. Comprueba tu conexión o vuelve a intentar.
          </AlertDescription>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
            <Button onClick={() => router.push("/")}>
              Ir al inicio
            </Button>
          </div>
        </Alert>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acceso Restringido</AlertTitle>
          <AlertDescription>
            Debes iniciar sesión para acceder a esta sección.
          </AlertDescription>
          <Button onClick={() => router.push("/")} className="mt-4">
            Volver al inicio
          </Button>
        </Alert>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acceso Denegado</AlertTitle>
          <AlertDescription>
            No tienes permisos de administrador para acceder a esta sección.
          </AlertDescription>
          <Button onClick={() => router.push("/")} className="mt-4">
            Volver al inicio
          </Button>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}


