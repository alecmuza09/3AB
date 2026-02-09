"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useEditMode } from "@/contexts/edit-mode-context"
import { Settings, Pencil, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Engrane flotante para admins: clic activa/desactiva edición en la página.
 * En modo edición los bloques editables muestran "Editar" y se puede modificar contenido ahí mismo.
 */
export function AdminCmsGear() {
  const { isAdmin, loading } = useAuth()
  const { isEditMode, toggleEditMode } = useEditMode()

  if (loading || !isAdmin) return null

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={toggleEditMode}
              className={`h-12 w-12 rounded-full shadow-lg transition hover:scale-110 ${
                isEditMode
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-[#DC2626] hover:bg-[#B91C1C] text-white"
              }`}
              aria-label={isEditMode ? "Desactivar edición en página" : "Editar contenido en esta página"}
            >
              {isEditMode ? <Pencil className="h-6 w-6" /> : <Settings className="h-6 w-6" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[200px]">
            <p>
              {isEditMode
                ? "Modo edición activo: haz clic en los bloques para cambiar textos. Clic de nuevo en el ícono para salir."
                : "Activar edición en página: podrás hacer clic en cada bloque para editar el texto aquí mismo."}
            </p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/admin?section=content">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full bg-background shadow border"
                aria-label="Ir al CMS completo"
              >
                <ExternalLink className="h-5 w-5" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Ir al CMS completo (todas las páginas)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
