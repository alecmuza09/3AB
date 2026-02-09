"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Settings } from "lucide-react"

/**
 * Engrane flotante visible solo para admins. Enlaza al panel de administración, sección CMS.
 */
export function AdminCmsGear() {
  const { isAdmin, loading } = useAuth()

  if (loading || !isAdmin) return null

  return (
    <Link
      href="/admin?section=content"
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#DC2626] text-white shadow-lg transition hover:bg-[#B91C1C] hover:scale-110"
      title="Editar contenido del sitio (CMS)"
      aria-label="Configuración del sitio"
    >
      <Settings className="h-6 w-6" />
    </Link>
  )
}
