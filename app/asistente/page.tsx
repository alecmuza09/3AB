"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Image from "next/image"
import { TopHeader } from "@/components/top-header"
import { Footer } from "@/components/footer"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useSupabase } from "@/lib/supabase-client"
import { Bot, User, Send, Sparkles, Calendar, Users, Gift, Briefcase } from "lucide-react"

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category?: { id: string; name: string; slug: string } | null
}

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: string
  products?: Product[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const QUICK_SUGGESTIONS = [
  "Necesito ideas para una feria o expo",
  "Quiero regalos para mis clientes",
  "Busco productos para el equipo",
  "Artículos con logo de mi empresa",
]

const CATEGORY_SHORTCUTS = [
  { label: "Eventos", icon: Calendar, query: "Necesito productos para un evento o feria" },
  { label: "Corporativo", icon: Briefcase, query: "Busco artículos corporativos para mi empresa" },
  { label: "Promocionales", icon: Gift, query: "Quiero ver opciones de regalos promocionales" },
  { label: "Equipo", icon: Users, query: "Necesito productos para uniformar o motivar a mi equipo" },
]

function scoreProduct(p: Product, keywords: string[]): number {
  const text = `${p.name} ${p.description ?? ""} ${p.category?.name ?? ""}`.toLowerCase()
  return keywords.reduce((score, kw) => score + (text.includes(kw.toLowerCase()) ? 2 : 0), 0)
}

// Extrae palabras clave de TODA la conversación para mejores recomendaciones
function extractKeywordsFromConversation(messages: { role: string; content: string }[]): string[] {
  const PRODUCT_KEYWORDS = [
    "termo", "termos", "taza", "tazas", "vaso", "botella", "botellas",
    "mochila", "mochilas", "playera", "playeras", "camisa", "camisas",
    "gorra", "gorras", "sudadera", "chaleco", "uniforme", "uniformes",
    "libreta", "libretas", "agenda", "agendas", "pluma", "plumas",
    "usb", "memoria", "memorias", "llavero", "llaveros", "carpeta", "carpetas",
    "bolsa", "bolsas", "maleta", "maletas", "reloj", "relojes",
    "audífono", "audífonos", "cargador", "cargadores", "power bank", "bocina", "bocinas",
    "gafete", "gafetes", "lanyard", "lanyards", "pin", "pines",
    "trofeo", "trofeos", "placa", "placas", "reconocimiento",
    "ecológico", "sustentable", "bambú", "reciclado", "premium", "ejecutivo",
    "tecnología", "gadget", "textil", "wearable",
  ]

  const CONTEXT_KEYWORDS = [
    "evento", "expo", "feria", "exposición", "conferencia", "congreso",
    "corporativo", "empresa", "empresarial", "negocio", "oficina",
    "cliente", "clientes", "regalo", "regalos", "obsequio",
    "equipo", "staff", "empleado", "colaborador", "personal",
    "promocional", "marketing", "branding",
  ]

  const allText = messages.map((m) => m.content).join(" ").toLowerCase()
  const found = new Set<string>()

  for (const kw of [...PRODUCT_KEYWORDS, ...CONTEXT_KEYWORDS]) {
    if (allText.includes(kw.toLowerCase())) found.add(kw)
  }

  return Array.from(found)
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AsistentePage() {
  const supabase = useSupabase()
  const [catalog, setCatalog] = useState<Product[]>([])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "¡Hola! Soy el asistente de 3A Branding. Estoy aquí para ayudarte a encontrar los productos promocionales perfectos para tu empresa o evento. ¿En qué te puedo ayudar hoy?",
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => { setIsMounted(true) }, [])

  // Cargar catálogo desde Supabase
  useEffect(() => {
    if (!supabase) return
    supabase
      .from("products")
      .select("id, name, description, price, image_url, category:categories(id, name, slug)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (!error && data) setCatalog(data as any)
      })
  }, [supabase])

  // Scroll automático al último mensaje
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isTyping])

  // Buscar productos usando el contexto completo de la conversación
  const findRelatedProducts = useCallback(
    (conversationHistory: { role: string; content: string }[], limit = 4): Product[] => {
      if (catalog.length === 0) return []
      const keywords = extractKeywordsFromConversation(conversationHistory)
      if (keywords.length === 0) return catalog.slice(0, limit)
      const scored = catalog
        .map((p) => ({ p, score: scoreProduct(p, keywords) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((x) => x.p)
      return scored.length > 0 ? scored : catalog.slice(0, limit)
    },
    [catalog]
  )

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isTyping) return

      const userMsg: Message = {
        id: Date.now(),
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput("")
      setIsTyping(true)

      // Historial completo para el contexto de la IA
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      // Catálogo resumido para la IA
      const catalogSummary = catalog.slice(0, 80).map((p) => ({
        name: p.name,
        category: p.category?.name ?? "General",
        price: p.price,
        description: p.description,
      }))

      // Productos relacionados usando TODO el historial de conversación
      const relatedProducts = findRelatedProducts(history)

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, catalogSummary }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.detail ?? data.error ?? `HTTP ${res.status}`)
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: data.reply || "Lo siento, no pude generar una respuesta. Intenta de nuevo.",
            timestamp: new Date().toISOString(),
            products: relatedProducts.length > 0 ? relatedProducts : undefined,
          },
        ])
      } catch (err: any) {
        console.error("[Asistente]", err)
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: "Tuve un problema al conectarme. Intenta de nuevo o escríbenos por WhatsApp.",
            timestamp: new Date().toISOString(),
          },
        ])
      } finally {
        setIsTyping(false)
      }
    },
    [messages, catalog, isTyping, findRelatedProducts]
  )

  const formatTime = (iso: string) =>
    isMounted
      ? new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
      : ""

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopHeader />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-primary/10 p-3 rounded-full">
              <Bot className="h-7 w-7 text-primary" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold">Asistente IA — 3A Branding</h1>
              <p className="text-sm text-muted-foreground">
                Encuentra el producto promocional perfecto para tu empresa
              </p>
            </div>
          </div>

          {/* Accesos directos por categoría */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            {CATEGORY_SHORTCUTS.map(({ label, icon: Icon, query }) => (
              <button
                key={label}
                onClick={() => sendMessage(query)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-primary/20 hover:border-primary hover:bg-primary/5 transition text-sm font-medium"
              >
                <Icon className="h-5 w-5 text-primary" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <Card className="flex flex-col" style={{ height: "72vh", minHeight: 520 }}>
          <CardHeader className="py-3 px-4 border-b bg-primary/5 shrink-0">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              Conversación en tiempo real
              <span className="ml-auto text-xs text-muted-foreground font-normal">
                {catalog.length > 0 ? `${catalog.length} productos cargados` : "Cargando catálogo…"}
              </span>
            </CardTitle>
          </CardHeader>

          {/* Mensajes */}
          <CardContent ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] space-y-2 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                  {/* Burbuja */}
                  <div className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`p-1.5 rounded-full shrink-0 ${msg.role === "user" ? "bg-primary" : "bg-muted"}`}>
                      {msg.role === "user"
                        ? <User className="h-3.5 w-3.5 text-primary-foreground" />
                        : <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                    </div>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-[10px] opacity-60 mt-1">{formatTime(msg.timestamp)}</p>
                    </div>
                  </div>

                  {/* Productos relacionados */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-1">
                      {msg.products.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => window.location.assign(`/productos/${p.id}`)}
                          className="flex gap-3 items-center border rounded-xl p-2.5 bg-background hover:border-primary hover:shadow-sm transition text-left"
                        >
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                            <Image
                              src={p.image_url || `/placeholder.svg?height=112&width=112&query=${encodeURIComponent(p.name)}`}
                              alt={p.name}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold line-clamp-2">{p.name}</p>
                            {p.category?.name && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">{p.category.name}</p>
                            )}
                            <p className="text-xs font-bold text-primary mt-0.5">
                              ${Number(p.price || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Indicador de escritura */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-muted">
                    <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5">
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="border-t p-3 shrink-0">
            {/* Sugerencias rápidas (solo al inicio) */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-3 py-1 rounded-full border border-primary/30 hover:bg-primary/10 hover:border-primary transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta o necesidad…"
                disabled={isTyping}
                className="flex-1 rounded-xl"
              />
              <Button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="rounded-xl bg-primary hover:bg-primary/90 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </main>

      <Footer />
      <WhatsappButton />
    </div>
  )
}
