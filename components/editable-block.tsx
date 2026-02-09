"use client"

import { useState } from "react"
import { useEditMode } from "@/contexts/edit-mode-context"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil, Loader2 } from "lucide-react"

export interface EditableBlockProps {
  /** Página (ej. "servicios") */
  pageSlug: string
  /** Keys en el CMS: title, description, features (features se guarda como texto, una línea por ítem) */
  keys: { title: string; description: string; features: string }
  /** Valores actuales */
  title: string
  description: string
  features: string[]
  /** Llamado tras guardar (para refetch) */
  onSaved?: () => void
  children: React.ReactNode
  /** Etiqueta del bloque (ej. "Bloque 1") */
  blockLabel?: string
}

export function EditableBlock({
  pageSlug,
  keys,
  title,
  description,
  features,
  onSaved,
  children,
  blockLabel = "Bloque",
}: EditableBlockProps) {
  const { isEditMode } = useEditMode()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editDescription, setEditDescription] = useState(description)
  const [editFeatures, setEditFeatures] = useState(features.join("\n"))

  const handleOpen = (open: boolean) => {
    if (open) {
      setEditTitle(title)
      setEditDescription(description)
      setEditFeatures(features.join("\n"))
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
            [keys.title]: editTitle,
            [keys.description]: editDescription,
            [keys.features]: editFeatures.trim(),
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
      <div className="absolute -inset-1 rounded-lg border-2 border-dashed border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="absolute top-2 right-2 z-20 flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar bloque
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar {blockLabel}</DialogTitle>
            <DialogDescription>
              Cambia el título, la descripción y la lista. En la lista escribe un ítem por línea.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="block-title">Título</Label>
              <Input
                id="block-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Título del bloque"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="block-desc">Descripción</Label>
              <Textarea
                id="block-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descripción"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="block-features">Lista (un ítem por línea)</Label>
              <Textarea
                id="block-features"
                value={editFeatures}
                onChange={(e) => setEditFeatures(e.target.value)}
                placeholder="Ítem 1&#10;Ítem 2&#10;..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>
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
