"use client"

import { useState } from "react"
import { useEditMode } from "@/contexts/edit-mode-context"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Image as ImageIcon, Loader2, Upload } from "lucide-react"

export interface EditableImageProps {
  /** Página (ej. "servicios", "home", "nosotros") */
  pageSlug: string
  /** Key en el CMS para la imagen (ej. "banner_image", "hero_image") */
  imageKey: string
  /** URL actual de la imagen */
  currentImageUrl: string
  /** Llamado tras guardar (para refetch) */
  onSaved?: () => void
  /** Elemento hijo que contiene la imagen */
  children: React.ReactNode
  /** Etiqueta descriptiva (ej. "Banner principal") */
  imageLabel?: string
  /** Texto alternativo para la imagen */
  altText?: string
}

export function EditableImage({
  pageSlug,
  imageKey,
  currentImageUrl,
  onSaved,
  children,
  imageLabel = "Imagen",
  altText,
}: EditableImageProps) {
  const { isEditMode } = useEditMode()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editImageUrl, setEditImageUrl] = useState(currentImageUrl)

  const handleOpen = (open: boolean) => {
    if (open) {
      setEditImageUrl(currentImageUrl)
    }
    setOpen(open)
  }

  const handleSave = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      alert("Sesión expirada. Inicia sesión de nuevo.")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/site-content", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          page_slug: pageSlug,
          updates: {
            [imageKey]: editImageUrl.trim(),
          },
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Error al guardar")
      }
      setOpen(false)
      onSaved?.()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  if (!isEditMode) return <>{children}</>

  return (
    <div className="relative group">
      <div className="absolute -inset-1 rounded-lg border-2 border-dashed border-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="absolute top-2 right-2 z-20 flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white shadow hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Cambiar imagen
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar {imageLabel}</DialogTitle>
            <DialogDescription>
              Ingresa la URL de la nueva imagen. Puedes usar URLs externas o del servidor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="image-url">URL de la imagen</Label>
              <Input
                id="image-url"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg o /imagen.jpg"
              />
              <p className="text-xs text-muted-foreground">
                💡 Tip: Sube tu imagen a un servicio como Imgur, Cloudinary o usa una URL directa
              </p>
            </div>
            {editImageUrl && (
              <div className="grid gap-2">
                <Label>Vista previa</Label>
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border">
                  <img
                    src={editImageUrl}
                    alt={altText || "Preview"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?text=Error+al+cargar"
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {children}
    </div>
  )
}
