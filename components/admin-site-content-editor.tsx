"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SITE_CONTENT_SCHEMA, type PageSchema } from "@/lib/site-content-schema"
import { getSupabaseClient } from "@/lib/supabase"
import { Loader2, Save } from "lucide-react"

export function AdminSiteContentEditor() {
  const [selectedPage, setSelectedPage] = useState<string>(SITE_CONTENT_SCHEMA[0]?.slug ?? "home")
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const pageSchema = SITE_CONTENT_SCHEMA.find((p) => p.slug === selectedPage)

  useEffect(() => {
    if (!selectedPage) return
    setLoading(true)
    setMessage(null)
    fetch(`/api/site-content?page=${encodeURIComponent(selectedPage)}`)
      .then((res) => res.json())
      .then((data) => {
        setValues(typeof data === "object" && data !== null ? data : {})
      })
      .catch(() => setValues({}))
      .finally(() => setLoading(false))
  }, [selectedPage])

  const setField = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setMessage({ type: "error", text: "No se pudo conectar. Recarga la página." })
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setMessage({ type: "error", text: "Sesión expirada. Inicia sesión de nuevo." })
      return
    }

    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/site-content", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ page_slug: selectedPage, updates: values }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Error al guardar" })
        return
      }
      setMessage({ type: "success", text: "Contenido guardado correctamente." })
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Error al guardar" })
    } finally {
      setSaving(false)
    }
  }

  if (!pageSchema) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No hay páginas configuradas en el schema.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="whitespace-nowrap">Página:</Label>
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SITE_CONTENT_SCHEMA.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar cambios
        </Button>
        {message && (
          <span className={message.type === "success" ? "text-green-600 text-sm" : "text-destructive text-sm"}>
            {message.text}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Editar: {pageSchema.name}</CardTitle>
            <CardDescription>
              Modifica textos e imágenes. Los cambios se reflejan en el sitio al guardar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pageSchema.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.type === "html" || (field.type === "text" && (field.default?.length ?? 0) > 80) ? (
                  <Textarea
                    id={field.key}
                    value={values[field.key] ?? field.default}
                    onChange={(e) => setField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="resize-y"
                  />
                ) : (
                  <Input
                    id={field.key}
                    type={field.type === "image" ? "url" : "text"}
                    value={values[field.key] ?? field.default}
                    onChange={(e) => setField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                )}
                {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
