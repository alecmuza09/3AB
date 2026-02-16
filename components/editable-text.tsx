"use client"

import { useState } from "react"
import { useEditMode } from "@/contexts/edit-mode-context"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Pencil, Loader2 } from "lucide-react"

export interface EditableTextProps {
  /** Página (ej. "servicios", "home", "nosotros") */
  pageSlug: string
  /** Key en el CMS para el texto (ej. "title", "subtitle", "hero_title") */
  contentKey: string
  /** Valor actual del texto */
  value: string
  /** Llamado tras guardar (para refetch) */
  onSaved?: () => void
  /** Elemento hijo que muestra el texto */
  children: React.ReactNode
  /** Etiqueta descriptiva (ej. "Título principal") */
  label?: string
  /** Tipo de input: "input" para textos cortos, "textarea" para largos */
  type?: "input" | "textarea"
  /** Placeholder para el campo de edición */
  placeholder?: string
}

export function EditableText({
  pageSlug,
  contentKey,
  value,
  onSaved,
  children,
  label = "Texto",
  type = "input",
  placeholder,
}: EditableTextProps) {
  const { isEditMode } = useEditMode()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const handleOpen = (open: boolean) => {
    if (open) {
      setEditValue(value)
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
            [contentKey]: editValue.trim(),
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
    <div className="relative group inline-block w-full">
      <div className="absolute -inset-1 rounded border border-dashed border-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="absolute -top-2 -right-2 z-20 flex items-center gap-1 rounded-md bg-purple-600 px-2 py-1 text-xs font-medium text-white shadow hover:bg-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil className="h-3 w-3" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar {label}</DialogTitle>
            <DialogDescription>
              Modifica el contenido del texto. Los cambios se reflejarán inmediatamente después de guardar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="text-content">{label}</Label>
              {type === "textarea" ? (
                <Textarea
                  id="text-content"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={placeholder || `Ingresa el ${label.toLowerCase()}`}
                  rows={5}
                />
              ) : (
                <Input
                  id="text-content"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={placeholder || `Ingresa el ${label.toLowerCase()}`}
                />
              )}
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
