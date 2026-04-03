"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { TopHeader } from "@/components/top-header"
import { Footer } from "@/components/footer"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useSupabase } from "@/lib/supabase-client"
import {
  Bot,
  User,
  Send,
  Sparkles,
  Calendar,
  Users,
  Gift,
  Briefcase,
  Package,
  BookOpen,
  Phone,
} from "lucide-react"

type Sender = "user" | "bot"

type Apartado = "Eventos" | "Corporativo" | "Promocionales" | "Empresarial"

interface RecommendedProduct {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category?: {
    id: string
    name: string
    slug: string
  } | null
  attributes?: any | null
}

interface Message {
  id: number
  text: string
  sender: Sender
  timestamp: string
  suggestions?: string[]
  products?: RecommendedProduct[]
}

type StageKey = "eventType" | "audience" | "objective" | "attendees" | "budget" | "productPreference"

type Responses = Partial<Record<StageKey, string>>

interface ConversationStage {
  key: StageKey
  prompt: string
  chips: string[]
  onAnswer?: (value: string, responses: Responses) => string
}

const BOT_RESPONSE_DELAY = 400

const FINAL_OPTIONS = [
  "Explorar ideas destacadas",
  "Ver catálogos disponibles",
  "Solicitar cotización personalizada",
  "Hablar con un especialista",
  "Reiniciar conversación",
]

const SUMMARY_LABELS: Record<StageKey, string> = {
  eventType: "Tipo de evento",
  audience: "Quién participa",
  objective: "Objetivo principal",
  attendees: "Personas estimadas",
  budget: "Presupuesto estimado",
  productPreference: "Estilo de productos",
}

const STAGE_ACKNOWLEDGEMENTS: Record<StageKey, Record<string, string>> = {
  eventType: {
    "Evento corporativo": "Excelente, enfocamos los materiales para reflejar profesionalismo y cercanía.",
    "Feria o expo": "Genial, cuidaremos que tu stand destaque y se lleven algo memorable.",
    "Conferencia o foro": "Perfecto, busquemos opciones que refuercen tu participación y notoriedad.",
    "Lanzamiento de producto": "¡Qué emoción! Haremos que el nuevo producto sea el protagonista.",
    "Capacitación interna": "Entendido, trabajemos en algo útil y motivador para el equipo.",
    "Otro tipo de evento": "Perfecto, si quieres cuéntame más para afinar la recomendación.",
  },
  audience: {
    "Equipo interno": "Excelente, reforcemos cultura y sentido de pertenencia.",
    "Clientes actuales": "Perfecto, cuidemos los detalles para agradecer su confianza.",
    "Prospectos nuevos": "Ideal, vamos por algo llamativo y fácil de recordar.",
    "Aliados o proveedores": "Muy bien, fortalezcamos la relación con un detalle significativo.",
    "Comunidad o prensa": "Perfecto, prioricemos visibilidad y storytelling de marca.",
  },
  objective: {
    "Generar leads": "Tomado en cuenta, buscaremos piezas que ayuden a iniciar conversación.",
    "Fortalecer relaciones": "Perfecto, apostemos por algo premium y personalizado.",
    "Motivar al equipo": "Entendido, elegimos algo útil y con buena presentación.",
    "Reconocer logros": "Excelente, pensemos en detalles memorables y con reconocimiento.",
    "Posicionar marca": "Buenísimo, combinamos impacto visual con utilidad.",
    "Educar a la audiencia": "Listo, enfoquémonos en piezas que refuercen el mensaje clave.",
  },
  attendees: {
    "1 a 25 personas": "Para un grupo reducido podemos ir con piezas premium y personalizadas.",
    "26 a 75 personas": "Perfecto, combinemos calidad con una producción eficiente.",
    "76 a 150 personas": "Ideal, armamos un mix que equilibre impacto y volumen.",
    "151 a 300 personas": "Gracias, optimizaremos la inversión con piezas clave por segmentos.",
    "301 a 500 personas": "Entendido, pensemos en un plan escalonado para diferentes perfiles.",
    "Más de 500 personas": "Gran alcance, diseñaremos un kit por etapas para cubrir a todos.",
  },
  budget: {
    "Hasta $8,000 MXN": "Tomado, apostemos por piezas efectivas y con buena calidad percibida.",
    "Entre $8,000 y $20,000 MXN": "Perfecto, es un rango ideal para destacar con impacto visual.",
    "Entre $20,000 y $50,000 MXN": "Excelente, podemos crear una experiencia muy cuidada.",
    "Entre $50,000 y $100,000 MXN": "Genial, hay margen para propuestas premium completas.",
    "Más de $100,000 MXN": "Increíble, podemos personalizar a fondo y crear algo muy distintivo.",
    "Ayúdame a estimarlo": "Claro, te ayudo a dimensionarlo con base en asistentes y objetivos.",
  },
  productPreference: {
    "Mix equilibrado": "Perfecto, armemos una mezcla balanceada de textiles, tecnología y escritorio.",
    "Artículos premium": "Gran elección, pensemos en piezas de alto valor y empaque especial.",
    "Alta visibilidad": "Ideal, prioricemos prendas, displays y elementos con branding vistoso.",
    "Tecnología útil": "Buenísimo, seleccionemos gadgets funcionales y cargadores portátiles.",
    "Textiles y wearable": "Perfecto, podemos combinar prendas, mochilas y accesorios bordados.",
    "Obsequios sustentables": "Excelente, revisemos opciones eco y con materiales reciclados.",
  },
}

const normalize = (value: string) => value.trim().toLowerCase()

// ============== INTERPRETACIÓN CONVERSACIONAL ==============
// Extrae contexto y palabras clave del mensaje libre para recomendar productos

const EVENT_PATTERNS: { pattern: RegExp | string; value: string }[] = [
  { pattern: /feria|expo|exposición|stand/i, value: "Feria o expo" },
  { pattern: /conferencia|foro|congreso|seminario/i, value: "Conferencia o foro" },
  { pattern: /corporativo|empresa|oficina/i, value: "Evento corporativo" },
  { pattern: /lanzamiento|nuevo producto/i, value: "Lanzamiento de producto" },
  { pattern: /capacitación|curso|entrenamiento|taller/i, value: "Capacitación interna" },
  { pattern: /deportivo|torneo|carrera|gym/i, value: "Evento deportivo" },
  { pattern: /graduación|diploma|certificación/i, value: "Graduación o certificación" },
]

const AUDIENCE_PATTERNS: { pattern: RegExp | string; value: string }[] = [
  { pattern: /equipo|empleados|colaboradores|internos|staff/i, value: "Equipo interno" },
  { pattern: /clientes|clientes actuales/i, value: "Clientes actuales" },
  { pattern: /prospectos|leads|nuevos clientes|visitantes/i, value: "Prospectos nuevos" },
  { pattern: /proveedores|aliados|socios/i, value: "Aliados o proveedores" },
  { pattern: /prensa|medios|comunidad/i, value: "Comunidad o prensa" },
]

const OBJECTIVE_PATTERNS: { pattern: RegExp | string; value: string }[] = [
  { pattern: /leads|captar|contactos|registro/i, value: "Generar leads" },
  { pattern: /relaciones|fidelizar|agradecer/i, value: "Fortalecer relaciones" },
  { pattern: /motivar|equipo|incentivo/i, value: "Motivar al equipo" },
  { pattern: /reconocer|premio|logros/i, value: "Reconocer logros" },
  { pattern: /marca|posicionar|imagen/i, value: "Posicionar marca" },
  { pattern: /educar|capacitar|informar/i, value: "Educar a la audiencia" },
]

// Palabras que indican tipo de producto (para búsqueda en catálogo)
const PRODUCT_KEYWORDS_RAW = [
  "termo", "termos", "taza", "tazas", "vaso", "botella", "botellas", "mochila", "mochilas",
  "playera", "playeras", "camisa", "gorra", "gorras", "sudadera", "chaleco", "uniforme",
  "libreta", "libretas", "agenda", "pluma", "plumas", "bolígrafo", "usb", "memoria",
  "llavero", "llaveros", "carpeta", "carpetas", "bolsa", "bolsas", "maleta",
  "reloj", "relojes", "audífono", "audífonos", "cargador", "power bank", "bocina",
  "gafete", "lanyard", "pin", "pines", "reconocimiento", "trofeo", "placa",
  "ecológico", "sustentable", "bambú", "reciclado", "premium", "ejecutivo",
]

function matchPatterns(text: string, patterns: { pattern: RegExp | string; value: string }[]): string | null {
  const t = normalize(text)
  for (const { pattern, value } of patterns) {
    if (typeof pattern === "string" && t.includes(normalize(pattern))) return value
    if (pattern instanceof RegExp && pattern.test(text)) return value
  }
  return null
}

function extractProductKeywordsFromText(text: string): string[] {
  const t = normalize(text)
  const found: string[] = []
  for (const kw of PRODUCT_KEYWORDS_RAW) {
    if (t.includes(normalize(kw))) found.push(kw)
  }
  return found
}

/** Extrae contexto (evento, audiencia, objetivo) y palabras de producto del mensaje libre */
function extractContextFromMessage(text: string): { context: Partial<Responses>; productKeywords: string[] } {
  const context: Partial<Responses> = {}
  const eventType = matchPatterns(text, EVENT_PATTERNS)
  if (eventType) context.eventType = eventType
  const audience = matchPatterns(text, AUDIENCE_PATTERNS)
  if (audience) context.audience = audience
  const objective = matchPatterns(text, OBJECTIVE_PATTERNS)
  if (objective) context.objective = objective

  // Asistentes: números aproximados (50 personas, 100 asistentes, etc.)
  const attendeesMatch = text.match(/(\d+)\s*(personas|asistentes|piezas|unidades|invitados|asistirán)/i)
  if (attendeesMatch) {
    const n = parseInt(attendeesMatch[1], 10)
    if (n <= 25) context.attendees = "1 a 25 personas"
    else if (n <= 75) context.attendees = "26 a 75 personas"
    else if (n <= 150) context.attendees = "76 a 150 personas"
    else if (n <= 300) context.attendees = "151 a 300 personas"
    else if (n <= 500) context.attendees = "301 a 500 personas"
    else context.attendees = "Más de 500 personas"
  }

  // Presupuesto: números con $ o "mil", "mxn"
  const budgetMatch = text.match(/(\d+)\s*(mil|k|000|mxn|pesos)/i) ?? text.match(/\$\s*(\d+)/i)
  if (budgetMatch) {
    let num = parseInt(budgetMatch[1], 10)
    const hasMil = /mil|k|000/i.test(budgetMatch[0] || text)
    if (hasMil && num < 1000) num = num * 1000
    if (num <= 8000) context.budget = "Hasta $8,000 MXN"
    else if (num <= 20000) context.budget = "Entre $8,000 y $20,000 MXN"
    else if (num <= 50000) context.budget = "Entre $20,000 y $50,000 MXN"
    else if (num <= 100000) context.budget = "Entre $50,000 y $100,000 MXN"
    else context.budget = "Más de $100,000 MXN"
  }

  const productKeywords = extractProductKeywordsFromText(text)
  return { context, productKeywords }
}


const getAcknowledgement = (key: StageKey, value: string) => {
  const acknowledgementMap = STAGE_ACKNOWLEDGEMENTS[key]
  const match =
    Object.entries(acknowledgementMap).find(([option]) => normalize(option) === normalize(value))?.[1] ?? null

  if (match) {
    return match
  }

  return `Perfecto, tomo nota de "${value}" para afinar la recomendación.`
}

const getRecommendedCategories = (responses: Responses) => {
  const eventType = responses.eventType?.toLowerCase()
  const audience = responses.audience?.toLowerCase()
  const preference = responses.productPreference?.toLowerCase()
  const budget = responses.budget?.toLowerCase()

  if (audience?.includes("equipo")) {
    return "kits internos, reconocimientos personalizados y piezas útiles para el día a día"
  }

  if (eventType?.includes("feria") || eventType?.includes("expo")) {
    return "stands portátiles, activaciones de alto impacto y giveaways listos para captar leads"
  }

  if (eventType?.includes("corporativo")) {
    return "textiles ejecutivos, productos tecnológicos y artículos de escritorio premium"
  }

  if (eventType?.includes("lanzamiento")) {
    return "kits de lanzamiento, displays de producto y experiencias sorpresa"
  }

  if (eventType?.includes("deportivo")) {
    return "textiles deportivos, termos térmicos y accesorios de bienestar"
  }

  if (preference?.includes("tecnolog") || preference?.includes("gadget")) {
    return "gadgets útiles, power banks personalizados y accesorios móviles"
  }

  if (preference?.includes("textiles")) {
    return "prendas bordadas, mochilas, gorras y accesorios wearable"
  }

  if (preference?.includes("sustent")) {
    return "opciones eco-friendly, materiales reciclados y empaques reutilizables"
  }

  if (budget?.includes("100,000")) {
    return "soluciones premium a la medida, mobiliario corporativo y kits exclusivos"
  }

  return "una mezcla de productos promocionales alineados a tu objetivo y audiencia"
}

const buildSummary = (responses: Responses) => {
  const lines = (Object.keys(SUMMARY_LABELS) as StageKey[])
    .map((key) => {
      const value = responses[key]
      if (!value) return null
      return `• ${SUMMARY_LABELS[key]}: ${value}`
    })
    .filter(Boolean)

  const summaryBody = lines.length > 0 ? lines.join("\n") : "• Aún podemos completar algunos detalles juntos."

  return `✨ Resumen rápido\n${summaryBody}\n\n💡 Punto de partida: ${getRecommendedCategories(responses)}.\n\n¿Prefieres que te comparta ideas, catálogos o conectar con un especialista?`
}

const conversationStages: ConversationStage[] = [
  {
    key: "eventType",
    prompt: "Para empezar, ¿qué tipo de evento estás organizando?",
    chips: [
      "Evento corporativo",
      "Feria o expo",
      "Conferencia o foro",
      "Lanzamiento de producto",
      "Capacitación interna",
      "Otro tipo de evento",
    ],
    onAnswer: (value) => getAcknowledgement("eventType", value),
  },
  {
    key: "audience",
    prompt: "¿Quiénes serán los participantes principales?",
    chips: ["Equipo interno", "Clientes actuales", "Prospectos nuevos", "Aliados o proveedores", "Comunidad o prensa"],
    onAnswer: (value) => getAcknowledgement("audience", value),
  },
  {
    key: "objective",
    prompt: "Perfecto, ¿cuál es el objetivo principal del evento?",
    chips: [
      "Generar leads",
      "Fortalecer relaciones",
      "Motivar al equipo",
      "Reconocer logros",
      "Posicionar marca",
      "Educar a la audiencia",
    ],
    onAnswer: (value) => getAcknowledgement("objective", value),
  },
  {
    key: "attendees",
    prompt: "¿Aproximadamente cuántas personas asistirán?",
    chips: ["1 a 25 personas", "26 a 75 personas", "76 a 150 personas", "151 a 300 personas", "301 a 500 personas", "Más de 500 personas"],
    onAnswer: (value) => getAcknowledgement("attendees", value),
  },
  {
    key: "budget",
    prompt: "¿Qué presupuesto aproximado te gustaría destinar?",
    chips: [
      "Hasta $8,000 MXN",
      "Entre $8,000 y $20,000 MXN",
      "Entre $20,000 y $50,000 MXN",
      "Entre $50,000 y $100,000 MXN",
      "Más de $100,000 MXN",
      "Ayúdame a estimarlo",
    ],
    onAnswer: (value) => getAcknowledgement("budget", value),
  },
  {
    key: "productPreference",
    prompt: "Para afinar, ¿qué estilo de productos te atrae más?",
    chips: [
      "Mix equilibrado",
      "Artículos premium",
      "Alta visibilidad",
      "Tecnología útil",
      "Textiles y wearable",
      "Obsequios sustentables",
    ],
    onAnswer: (value, responses) => {
      const base = getAcknowledgement("productPreference", value)
      const objective = responses.objective
      if (objective && normalize(objective).includes("lead") && normalize(value).includes("visibilidad")) {
        return `${base} Además, combinaremos algo visual con un gancho para captar datos.`
      }
      return base
    },
  },
]

export default function AsistentePage() {
  const supabase = useSupabase()
  const [catalog, setCatalog] = useState<RecommendedProduct[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(false)

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 1,
      text: "¡Hola! Soy el asistente de 3A Branding 😊 Cuéntame en qué andas: ¿un evento, regalos para clientes, algo para el equipo? Escribe con libertad y te recomiendo productos de nuestro catálogo según lo que me platiques.",
      sender: "bot",
      timestamp: new Date().toISOString(),
      suggestions: ["Necesito ideas para una feria", "Quiero regalos para clientes", "Busco productos para el equipo", "Ver productos para cotizar"],
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [userResponses, setUserResponses] = useState<Responses>({})
  const [hasCompletedFlow, setHasCompletedFlow] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const isFirstMount = useRef(true)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    async function fetchCatalog() {
      if (!supabase) return
      setLoadingCatalog(true)
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, description, price, image_url, attributes, category:categories(id, name, slug)")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(300)

        if (error) {
          console.error("Error loading catalog for assistant:", error)
          return
        }
        setCatalog((data || []) as any)
      } catch (e) {
        console.error("Error loading catalog:", e)
      } finally {
        setLoadingCatalog(false)
      }
    }

    fetchCatalog()
  }, [supabase])

  useEffect(() => {
    // Saltarse el scroll en la carga inicial para no bajar la página al footer
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
    }
  }, [messages, isTyping])

  const formatTimestamp = (value: string) =>
    new Date(value).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    })

  const getActiveStage = (responses: Responses) =>
    conversationStages.find((stage) => !responses[stage.key])

  const apartadoKeywords: Record<Apartado, string[]> = {
    Eventos: ["evento", "expo", "feria", "conferencia", "congreso", "lanyard", "gafete", "bolsa", "termo", "libreta", "pluma"],
    Corporativo: ["corporativo", "oficina", "ejecutivo", "agenda", "carpeta", "pluma", "premium", "negocios"],
    Promocionales: ["promocional", "regalo", "taza", "llavero", "usb", "botella", "gorra", "playera", "mochila"],
    Empresarial: ["empresarial", "uniforme", "textil", "camisa", "chaleco", "sudadera", "equipo", "identidad"],
  }

  const preferenceKeywords: Record<string, string[]> = {
    "Tecnología y gadgets": ["usb", "cargador", "power", "audífono", "bocina", "tecnología"],
    "Textiles y uniformes": ["playera", "camisa", "gorra", "sudadera", "chaleco", "textil"],
    "Artículos útiles del día a día": ["termo", "taza", "botella", "libreta", "pluma", "bolsa"],
    "Regalos premium": ["premium", "ejecutivo", "set", "carpeta", "metal", "piel"],
    "Opciones ecológicas": ["ecológico", "recicl", "bambú", "sustentable"],
    "Obsequios sustentables": ["sustentable", "recicl", "bambú", "eco"],
  }

  const scoreProduct = (p: RecommendedProduct, keywords: string[]) => {
    const haystack = `${p.name} ${p.description || ""} ${p.category?.name || ""}`.toLowerCase()
    let score = 0
    for (const k of keywords) {
      const kk = k.toLowerCase()
      if (haystack.includes(kk)) score += 2
    }
    // Pequeño boost a destacados/nuevos si existe en attributes (cuando el catálogo lo exponga)
    const isFeatured = Boolean((p as any)?.is_featured)
    const isBestseller = Boolean((p as any)?.is_bestseller)
    if (isFeatured) score += 1
    if (isBestseller) score += 1
    return score
  }

  const recommendFromCatalog = (keywords: string[], limit: number = 6) => {
    const uniqueKeywords = Array.from(new Set(keywords.filter(Boolean)))
    if (catalog.length === 0 || uniqueKeywords.length === 0) {
      return catalog.slice(0, limit)
    }
    const scored = catalog
      .map((p) => ({ p, score: scoreProduct(p, uniqueKeywords) }))
      .sort((a, b) => b.score - a.score)
      .filter((x) => x.score > 0)
      .slice(0, limit)
      .map((x) => x.p)

    return scored.length > 0 ? scored : catalog.slice(0, limit)
  }

  const buildKeywordsFromResponses = (responses: Responses, extraKeywords: string[] = []) => {
    const keywords: string[] = [...extraKeywords]
    const eventType = responses.eventType || ""
    const audience = responses.audience || ""
    const objective = responses.objective || ""
    const preference = responses.productPreference || ""

    const normalizedAll = `${eventType} ${audience} ${objective} ${preference}`.toLowerCase()
    if (normalizedAll.includes("expo") || normalizedAll.includes("feria") || normalizedAll.includes("conferencia") || normalizedAll.includes("evento")) {
      keywords.push(...apartadoKeywords.Eventos)
    }
    if (normalizedAll.includes("equipo") || normalizedAll.includes("interno") || normalizedAll.includes("corporativo")) {
      keywords.push(...apartadoKeywords.Corporativo)
    }
    if (normalizedAll.includes("prospect") || normalizedAll.includes("lead") || normalizedAll.includes("posicionar")) {
      keywords.push(...apartadoKeywords.Promocionales)
    }
    if (preferenceKeywords[preference]) {
      keywords.push(...preferenceKeywords[preference])
    }

    return keywords
  }

  const pushRecommendationsMessage = (apartado: Apartado, responses?: Responses) => {
    const baseKeywords = apartadoKeywords[apartado]
    const extraKeywords = responses ? buildKeywordsFromResponses(responses) : []
    const products = recommendFromCatalog([...baseKeywords, ...extraKeywords], 6)

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        text:
          catalog.length === 0
            ? "Estoy cargando el catálogo para recomendarte productos. Dame un momento y vuelve a intentarlo."
            : `Aquí tienes recomendaciones para **${apartado}** basadas en tu catálogo.`,
        sender: "bot",
        timestamp: new Date().toISOString(),
        products: catalog.length === 0 ? undefined : products,
        suggestions: FINAL_OPTIONS,
      },
    ])
  }

  const resetConversation = () => {
    setUserResponses({})
    setHasCompletedFlow(true)
    setMessages([
      {
        id: 1,
        text: "Perfecto, retomemos. Cuéntame en qué andas: ¿evento, regalos para clientes, algo para el equipo? Escribe con libertad y te recomiendo productos.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        suggestions: ["Necesito ideas para una feria", "Quiero regalos para clientes", "Busco productos para el equipo", "Ver productos para cotizar"],
      },
    ])
  }

  const handleFinalInteractions = (action: string, responses: Responses) => {
    const normalizedAction = normalize(action)

    const reopenIntents: Array<{ keyword: string; key: StageKey }> = [
      { keyword: "evento", key: "eventType" },
      { keyword: "particip", key: "audience" },
      { keyword: "objetiv", key: "objective" },
      { keyword: "person", key: "attendees" },
      { keyword: "presup", key: "budget" },
      { keyword: "producto", key: "productPreference" },
    ]

    const intentToReopen = reopenIntents.find(({ keyword }) => normalizedAction.includes(keyword))

    if (intentToReopen) {
      const stageToReopen = conversationStages.find((stage) => stage.key === intentToReopen.key)
      if (stageToReopen) {
        setUserResponses((prev) => {
          const updated = { ...prev }
          delete updated[intentToReopen.key]
          return updated
        })
        setHasCompletedFlow(false)
        return {
          text: `Perfecto, volvamos a ${SUMMARY_LABELS[intentToReopen.key].toLowerCase()}.\n\n${stageToReopen.prompt}`,
          suggestions: stageToReopen.chips,
        }
      }
    }

    if (normalizedAction.includes("reiniciar") || normalizedAction.includes("empezar")) {
      resetConversation()
      return {
        text: "Listo, reiniciamos la conversación.",
        suggestions: conversationStages[0].chips,
      }
    }

    if (normalizedAction.includes("idea") || normalizedAction === normalize(FINAL_OPTIONS[0])) {
      return {
        text: "Te comparto una selección de ideas alineadas a lo que me contaste. Podemos profundizar en categorías específicas cuando quieras.",
        suggestions: FINAL_OPTIONS,
      }
    }

    if (normalizedAction.includes("catálogo") || normalizedAction === normalize(FINAL_OPTIONS[1])) {
      return {
        text: "Perfecto, tengo catálogos organizados por categoría y presupuesto. Te envío los enlaces listos para descargar.",
        suggestions: FINAL_OPTIONS,
      }
    }

    if (normalizedAction.includes("cotiz")) {
      return {
        text: "Claro, preparo un resumen con tus respuestas y se lo paso al equipo para que recibas una cotización. También puedes ir a la ficha de cualquier producto y usar la calculadora de precios ahí para personalizar y añadir al carrito.",
        suggestions: FINAL_OPTIONS,
      }
    }

    if (normalizedAction.includes("especialista") || normalizedAction.includes("whatsapp") || normalizedAction.includes("contact")) {
      return {
        text: "Con mucho gusto. Te paso el enlace directo a WhatsApp o agendamos una llamada rápida con la persona indicada.",
        suggestions: FINAL_OPTIONS,
      }
    }

    const nextStage = getActiveStage(responses)
    if (nextStage) {
      return {
        text: `Seguimos con ${SUMMARY_LABELS[nextStage.key].toLowerCase()}.\n\n${nextStage.prompt}`,
        suggestions: nextStage.chips,
      }
    }

    return {
      text: "Puedo compartirte ideas, catálogos o poner en marcha una cotización. ¿Qué te gustaría hacer ahora?",
      suggestions: FINAL_OPTIONS,
    }
  }

  const buildCatalogSummary = () =>
    catalog.slice(0, 80).map((p) => ({
      name: p.name,
      category: p.category?.name || "General",
      price: p.price,
    }))

  const handleSendMessage = async (rawText: string) => {
    const text = rawText.trim()
    if (!text) return

    // Intents especiales
    const normalized = normalize(text)
    if (normalized.includes("reiniciar") || normalized.includes("empezar de nuevo")) {
      setUserResponses({})
      setHasCompletedFlow(true)
      setMessages([
        { id: 1, text, sender: "user", timestamp: new Date().toISOString() },
        {
          id: 2,
          text: "Perfecto, retomemos. Cuéntame en qué andas: ¿evento, regalos para clientes, algo para el equipo? Escribe con libertad y te recomiendo productos.",
          sender: "bot",
          timestamp: new Date().toISOString(),
          suggestions: ["Necesito ideas para una feria", "Quiero regalos para clientes", "Busco productos para el equipo", "Ver productos para cotizar"],
        },
      ])
      setInputMessage("")
      return
    }
    if (
      (normalized.includes("catálogo") && normalized.length < 25) ||
      (normalized.includes("especialista") && normalized.length < 25) ||
      (normalized.includes("whatsapp") && normalized.length < 20)
    ) {
      const finalResult = handleFinalInteractions(text, userResponses)
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text, sender: "user", timestamp: new Date().toISOString() },
        {
          id: prev.length + 2,
          text: finalResult.text,
          sender: "bot",
          timestamp: new Date().toISOString(),
          suggestions: finalResult.suggestions?.length ? finalResult.suggestions : undefined,
          products: undefined,
        },
      ])
      setInputMessage("")
      return
    }

    // Extraer contexto del mensaje
    const { context: extracted, productKeywords } = extractContextFromMessage(text)
    const updatedResponses: Responses = { ...userResponses, ...extracted }
    setUserResponses(updatedResponses)

    // Agregar mensaje del usuario al historial
    const userMessage: Message = {
      id: messages.length + 1,
      text,
      sender: "user",
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Recomendar productos del catálogo en paralelo
    const keywords = buildKeywordsFromResponses(updatedResponses, productKeywords)
    const productsToShow = catalog.length > 0 ? recommendFromCatalog(keywords, 6) : []

    // Preparar historial para Gemini (solo mensajes de texto)
    const chatHistory = [...messages, userMessage]
      .filter((m) => m.sender === "user" || m.sender === "bot")
      .map((m) => ({
        role: m.sender === "user" ? ("user" as const) : ("model" as const),
        text: m.text,
      }))

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          context: updatedResponses,
          catalogSummary: buildCatalogSummary(),
        }),
      })

      const data = await response.json()
      const botText: string = data.reply || "Lo siento, hubo un problema al procesar tu mensaje. Intenta de nuevo."

      const suggestions: string[] = [
        "Ver más opciones",
        "Ver productos para cotizar",
        "Hablar con un especialista",
      ]
      if (productsToShow.length > 0) suggestions.unshift("Necesito algo más específico")

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: botText,
          sender: "bot",
          timestamp: new Date().toISOString(),
          suggestions,
          products: productsToShow.length > 0 ? productsToShow : undefined,
        },
      ])
    } catch (error) {
      console.error("[Asistente] Error al llamar Gemini:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Hubo un error de conexión. Por favor intenta de nuevo.",
          sender: "bot",
          timestamp: new Date().toISOString(),
          suggestions: ["Reiniciar conversación", "Hablar con un especialista"],
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const stepLabel = "Conversación"
  const progressPercentage = 100

  return (
    <div className="min-h-screen bg-background">
      <TopHeader />

      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Asistente IA de 3A Branding</h1>
                <p className="text-muted-foreground mt-2">
                  Tu guía inteligente para elegir productos promocionales perfectos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card
                className="p-4 text-center border-primary/20 cursor-pointer hover:border-primary hover:shadow-sm transition"
                onClick={() => handleSendMessage("Necesito ideas para un evento o feria")}
              >
                <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Eventos</p>
              </Card>
              <Card
                className="p-4 text-center border-primary/20 cursor-pointer hover:border-primary hover:shadow-sm transition"
                onClick={() => handleSendMessage("Busco productos corporativos para el equipo")}
              >
                <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Corporativo</p>
              </Card>
              <Card
                className="p-4 text-center border-primary/20 cursor-pointer hover:border-primary hover:shadow-sm transition"
                onClick={() => handleSendMessage("Quiero ver promocionales y regalos")}
              >
                <Gift className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Promocionales</p>
              </Card>
              <Card
                className="p-4 text-center border-primary/20 cursor-pointer hover:border-primary hover:shadow-sm transition"
                onClick={() => handleSendMessage("Necesito productos empresariales o uniformes")}
              >
                <Briefcase className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Empresarial</p>
              </Card>
            </div>
          </div>

          {/* Chat Interface */}
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b bg-primary/5">
              <CardTitle className="flex flex-col gap-2">
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 text-primary mr-2" />
                  Conversación con tu asistente
                  <div className="ml-auto text-sm text-muted-foreground">{stepLabel}</div>
                </div>
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] ${message.sender === "user" ? "order-2" : "order-1"}`}>
                    <div
                      className={`flex items-start space-x-2 ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      <div className={`p-2 rounded-full ${message.sender === "user" ? "bg-primary" : "bg-muted"}`}>
                        {message.sender === "user" ? (
                          <User className="h-4 w-4 text-primary-foreground" />
                        ) : (
                          <Bot className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-line">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {isMounted ? formatTimestamp(message.timestamp) : ""}
                        </p>
                      </div>
                    </div>

                    {message.products && message.products.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {message.products.map((p) => (
                          <div
                            key={p.id}
                            className="border rounded-lg p-3 bg-background cursor-pointer hover:border-primary transition"
                            onClick={() => window.location.assign(`/productos/${p.id}`)}
                          >
                            <div className="flex gap-3">
                              <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                <Image
                                  src={p.image_url || `/placeholder.svg?height=128&width=128&query=${p.name}`}
                                  alt={p.name}
                                  fill
                                  className="object-contain p-2"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold line-clamp-2 text-foreground">{p.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{p.description || ""}</p>
                                <p className="text-sm font-bold text-primary mt-1">
                                  ${Number(p.price || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {message.suggestions && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={`${message.id}-${index}`}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs border-primary/30 hover:bg-primary/10"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%]">
                    <div className="flex items-start space-x-2">
                      <div className="p-2 rounded-full bg-muted">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="bg-muted text-muted-foreground px-3 py-2 rounded-lg">
                        <span className="text-xs font-medium">El asistente está escribiendo…</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(inputMessage)
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSendMessage(inputMessage)}
                  className="bg-primary hover:bg-primary/90"
                  disabled={isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {Object.keys(userResponses).length > 0 && (
            <Card className="mt-6 bg-muted/40 border-dashed border-primary/30">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">Contexto de la conversación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Esto es lo que he entendido; puedes seguir escribiendo para afinar las recomendaciones.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {(Object.keys(SUMMARY_LABELS) as StageKey[])
                    .filter((key) => userResponses[key])
                    .map((key) => (
                      <li key={key} className="flex justify-between gap-4">
                        <span className="font-medium text-foreground">{SUMMARY_LABELS[key]}:</span>
                        <span className="text-right">{userResponses[key]}</span>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card
              className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-primary/20"
              onClick={() => handleSuggestionClick("Explorar ideas destacadas")}
            >
              <Package className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Explorar ideas destacadas</h3>
              <p className="text-sm text-muted-foreground">Selecciona propuestas alineadas a tu evento</p>
            </Card>

            <Card
              className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-primary/20"
              onClick={() => handleSuggestionClick("Ver catálogos disponibles")}
            >
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Ver catálogos disponibles</h3>
              <p className="text-sm text-muted-foreground">Descarga catálogos por categoría y presupuesto</p>
            </Card>

            <Card
              className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-primary/20"
              onClick={() => window.location.href = "/productos"}
            >
              <Package className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Ver productos y cotizar</h3>
              <p className="text-sm text-muted-foreground">En cada producto puedes personalizar y ver el precio</p>
            </Card>

            <Card
              className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-primary/20"
              onClick={() => handleSuggestionClick("Hablar con un especialista")}
            >
              <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Hablar con un especialista</h3>
              <p className="text-sm text-muted-foreground">Agenda una llamada o conecta por WhatsApp</p>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsappButton />
    </div>
  )
}

