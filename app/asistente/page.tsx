"use client"

import { useEffect, useRef, useState } from "react"
import { TopHeader } from "@/components/top-header"
import { Footer } from "@/components/footer"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
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
  Calculator,
  DollarSign,
} from "lucide-react"

type Sender = "user" | "bot"

interface Message {
  id: number
  text: string
  sender: Sender
  timestamp: string
  suggestions?: string[]
  quotation?: QuotationData
}

interface QuotationData {
  service: string
  quantity: number
  colors?: number
  size?: string
  material?: string
  subtotal: number
  extras: { name: string; cost: number }[]
  total: number
  totalWithMargin: number
  margin: string
}

type StageKey = "eventType" | "audience" | "objective" | "attendees" | "budget" | "productPreference"

type Responses = Partial<Record<StageKey, string>>

interface ConversationStage {
  key: StageKey
  prompt: string
  chips: string[]
  onAnswer?: (value: string, responses: Responses) => string
}

const BOT_RESPONSE_DELAY = 900

// ============== COTIZADOR LOGIC ==============

const calculateTampografiaSerigrafiaPrice = (quantity: number, colors: number = 1) => {
  let basePrice = 0
  let extraColorPrice = 0

  if (quantity <= 300) {
    basePrice = 980
    extraColorPrice = (colors - 1) * 3
  } else if (quantity <= 1000) {
    basePrice = quantity * 2.80
    extraColorPrice = (colors - 1) * 2.70
  } else if (quantity <= 2500) {
    basePrice = quantity * 2.50
    extraColorPrice = (colors - 1) * 2.40
  } else if (quantity <= 5000) {
    basePrice = quantity * 2.20
    extraColorPrice = (colors - 1) * 2.10
  } else {
    basePrice = quantity * 2.20
    extraColorPrice = (colors - 1) * 2.10
  }

  return basePrice + extraColorPrice
}

const calculateVidrioMetalRubberPrice = (quantity: number, colors: number = 1) => {
  let unitPrice = 0
  let extraColorPrice = 0

  if (quantity <= 500) {
    unitPrice = 900 / quantity // precio fijo para hasta 500
    extraColorPrice = 3.10
  } else if (quantity <= 1000) {
    unitPrice = 3.30
    extraColorPrice = 2.80
  } else if (quantity <= 2500) {
    unitPrice = 3.00
    extraColorPrice = 2.50
  } else if (quantity <= 5000) {
    unitPrice = 2.90
    extraColorPrice = 2.20
  } else {
    unitPrice = 2.60
    extraColorPrice = 2.00
  }

  const basePrice = quantity <= 500 ? 900 : quantity * unitPrice
  return basePrice + (colors - 1) * extraColorPrice * quantity
}

const calculateGrabadoLaserPrice = (quantity: number) => {
  if (quantity < 1000) return quantity * 12
  if (quantity <= 5000) return quantity * 8
  return quantity * 7
}

const calculateBordadoPrice = (quantity: number, size: string) => {
  const priceTable: Record<string, Record<string, number>> = {
    "5-12cm": {
      "1-9": 80,
      "10-49": 55,
      "50-99": 50,
      "100-299": 40,
      "300-499": 30,
      "500+": 25,
    },
    "12-20cm": {
      "1-9": 88,
      "10-49": 70,
      "50-99": 60,
      "100-299": 50,
      "300-499": 45,
      "500+": 40,
    },
    "20-25cm": {
      "1-9": 140,
      "10-49": 110,
      "50-99": 90,
      "100-299": 90,
      "300-499": 70,
      "500+": 70,
    },
  }

  let range = "500+"
  if (quantity <= 9) range = "1-9"
  else if (quantity <= 49) range = "10-49"
  else if (quantity <= 99) range = "50-99"
  else if (quantity <= 299) range = "100-299"
  else if (quantity <= 499) range = "300-499"

  const pricePerUnit = priceTable[size]?.[range] ?? 0
  return quantity * pricePerUnit
}

const calculateMargin = (quantity: number) => {
  if (quantity <= 200) return { percentage: 30, divisor: 0.70, label: "30%" }
  if (quantity <= 1000) return { percentage: 25, divisor: 0.75, label: "25%" }
  return { percentage: 20, divisor: 0.80, label: "20%" }
}

const generateQuotation = (
  service: string,
  quantity: number,
  colors?: number,
  size?: string,
  includeExtras?: { placa?: boolean; ponchado?: boolean; tratamiento?: boolean }
): QuotationData => {
  let subtotal = 0
  const extras: { name: string; cost: number }[] = []

  switch (service) {
    case "tampografia":
      subtotal = calculateTampografiaSerigrafiaPrice(quantity, colors ?? 1)
      if (includeExtras?.placa) extras.push({ name: "Placa de tampografía", cost: 280 })
      break
    case "vidrio-metal":
      subtotal = calculateVidrioMetalRubberPrice(quantity, colors ?? 1)
      if (includeExtras?.placa) extras.push({ name: "Placa de tampografía", cost: 280 })
      break
    case "laser":
      subtotal = calculateGrabadoLaserPrice(quantity)
      break
    case "bordado":
      subtotal = calculateBordadoPrice(quantity, size ?? "5-12cm")
      if (includeExtras?.ponchado) extras.push({ name: "Ponchado de bordado", cost: 280 })
      break
  }

  if (includeExtras?.tratamiento) {
    extras.push({ name: "Tratamiento especial", cost: 150 })
  }

  const extrasTotal = extras.reduce((sum, extra) => sum + extra.cost, 0)
  const total = subtotal + extrasTotal
  const margin = calculateMargin(quantity)
  const totalWithMargin = total / margin.divisor

  return {
    service,
    quantity,
    colors,
    size,
    subtotal,
    extras,
    total,
    totalWithMargin,
    margin: margin.label,
  }
}

const FINAL_OPTIONS = [
  "Explorar ideas destacadas",
  "Ver catálogos disponibles",
  "Solicitar cotización personalizada",
  "💰 Usar calculadora de precios",
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
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 1,
      text: `¡Hola! Soy parte del equipo de 3A Branding 😊 Estoy aquí para ayudarte a elegir los promocionales ideales.\n\n${conversationStages[0].prompt}`,
      sender: "bot",
      timestamp: new Date().toISOString(),
      suggestions: conversationStages[0].chips,
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [userResponses, setUserResponses] = useState<Responses>({})
  const [hasCompletedFlow, setHasCompletedFlow] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [showQuotationForm, setShowQuotationForm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const formatTimestamp = (value: string) =>
    new Date(value).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    })

  const getActiveStage = (responses: Responses) =>
    conversationStages.find((stage) => !responses[stage.key])

  const resetConversation = () => {
    setUserResponses({})
    setHasCompletedFlow(false)
    setMessages([
      {
        id: 1,
        text: `Perfecto, retomemos desde el inicio.\n\n${conversationStages[0].prompt}`,
        sender: "bot",
        timestamp: new Date().toISOString(),
        suggestions: conversationStages[0].chips,
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

    if (normalizedAction.includes("cotiz") && !normalizedAction.includes("calculadora") && !normalizedAction.includes("💰")) {
      return {
        text: "Claro, preparo un resumen con tus respuestas y se lo paso al equipo para que recibas una cotización con tiempos y opciones.",
        suggestions: FINAL_OPTIONS,
      }
    }

    if (normalizedAction.includes("calculadora") || normalizedAction.includes("💰")) {
      setShowQuotationForm(true)
      return {
        text: "¡Perfecto! He activado la calculadora de precios. Ingresa los detalles del servicio que necesitas y te daré una cotización instantánea con márgenes de utilidad incluidos.",
        suggestions: [],
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

  const handleSendMessage = (rawText: string) => {
    const text = rawText.trim()
    if (!text) return

    // Check if user wants to calculate another quotation
    if (normalize(text).includes("calcular otra") || normalize(text).includes("otra cotización")) {
      setShowQuotationForm(true)
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text,
          sender: "user",
          timestamp: new Date().toISOString(),
        },
        {
          id: prev.length + 2,
          text: "¡Perfecto! He activado nuevamente la calculadora de precios.",
          sender: "bot",
          timestamp: new Date().toISOString(),
        },
      ])
      setInputMessage("")
      return
    }

    const activeStage = hasCompletedFlow ? undefined : getActiveStage(userResponses)
    const updatedResponses: Responses = activeStage ? { ...userResponses, [activeStage.key]: text } : { ...userResponses }

    if (activeStage) {
      setUserResponses(updatedResponses)
    }

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        text,
        sender: "user",
        timestamp: new Date().toISOString(),
      },
    ])
    setInputMessage("")
    setIsTyping(true)

    setTimeout(() => {
      let botText = ""
      let suggestions: string[] | undefined

      if (activeStage) {
        const acknowledgement = activeStage.onAnswer ? activeStage.onAnswer(text, updatedResponses) : getAcknowledgement(activeStage.key, text)
        const nextStage = getActiveStage(updatedResponses)

        if (nextStage) {
          botText = `${acknowledgement}\n\n${nextStage.prompt}`
          suggestions = nextStage.chips
        } else {
          setHasCompletedFlow(true)
          botText = `${acknowledgement}\n\n${buildSummary(updatedResponses)}`
          suggestions = FINAL_OPTIONS
        }
      } else {
        const finalInteraction = handleFinalInteractions(text, updatedResponses)
        botText = finalInteraction.text
        suggestions = finalInteraction.suggestions.length ? finalInteraction.suggestions : undefined
      }

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: botText,
          sender: "bot",
          timestamp: new Date().toISOString(),
          suggestions,
        },
      ])
      setIsTyping(false)
    }, BOT_RESPONSE_DELAY)
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const completedStages = conversationStages.filter((stage) => userResponses[stage.key]).length
  const activeStageIndex = conversationStages.findIndex((stage) => !userResponses[stage.key])
  const currentStepNumber = activeStageIndex === -1 ? conversationStages.length : activeStageIndex + 1
  const progressPercentage = hasCompletedFlow
    ? 100
    : conversationStages.length === 0
      ? 0
      : Math.round((completedStages / conversationStages.length) * 100)

  const stepLabel = hasCompletedFlow ? "Resumen listo" : `Paso ${currentStepNumber} de ${conversationStages.length}`

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
              <Card className="p-4 text-center border-primary/20">
                <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Eventos</p>
              </Card>
              <Card className="p-4 text-center border-primary/20">
                <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Corporativo</p>
              </Card>
              <Card className="p-4 text-center border-primary/20">
                <Gift className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Promocionales</p>
              </Card>
              <Card className="p-4 text-center border-primary/20">
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

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
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

          {completedStages > 0 && (
            <Card className="mt-6 bg-muted/40 border-dashed border-primary/30">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">Resumen en construcción</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Ajusta cualquier punto cuando quieras; solo dime qué te gustaría modificar.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {conversationStages
                    .filter((stage) => userResponses[stage.key])
                    .map((stage) => (
                      <li key={stage.key} className="flex justify-between gap-4">
                        <span className="font-medium text-foreground">{SUMMARY_LABELS[stage.key]}:</span>
                        <span className="text-right">{userResponses[stage.key]}</span>
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
              className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer border-primary/20 bg-primary/5"
              onClick={() => handleSuggestionClick("💰 Usar calculadora de precios")}
            >
              <Calculator className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Calculadora de Precios</h3>
              <p className="text-sm text-muted-foreground">Genera cotizaciones instantáneas con márgenes</p>
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

          {/* Quotation Calculator */}
          {showQuotationForm && <QuotationCalculator onClose={() => setShowQuotationForm(false)} onQuote={(quotation) => {
            const formattedQuote = `💰 **Cotización Generada**\n\n` +
              `📦 Servicio: ${quotation.service === 'tampografia' ? 'Tampografía/Serigrafía' : 
                             quotation.service === 'vidrio-metal' ? 'Vidrio/Metal/Rubber' :
                             quotation.service === 'laser' ? 'Grabado Láser' : 'Bordado'}\n` +
              `📊 Cantidad: ${quotation.quantity.toLocaleString()} piezas\n` +
              (quotation.colors ? `🎨 Tintas: ${quotation.colors}\n` : '') +
              (quotation.size ? `📏 Tamaño: ${quotation.size}\n` : '') +
              `\n💵 **Costos:**\n` +
              `• Subtotal: $${quotation.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN\n` +
              (quotation.extras.length > 0 ? quotation.extras.map(e => `• ${e.name}: $${e.cost.toLocaleString('es-MX')} MXN`).join('\n') + '\n' : '') +
              `• **Total Costo:** $${quotation.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN\n\n` +
              `📈 **Precio de Venta (${quotation.margin} utilidad):**\n` +
              `**$${quotation.totalWithMargin.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN**\n\n` +
              `¿Te gustaría ajustar algo o generar otra cotización?`

            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: formattedQuote,
                sender: "bot",
                timestamp: new Date().toISOString(),
                quotation,
                suggestions: ["Calcular otra cotización", "Solicitar cotización formal", ...FINAL_OPTIONS.slice(0, 3)],
              },
            ])
            setShowQuotationForm(false)
          }} />}
        </div>
      </main>
      <Footer />
      <WhatsappButton />
    </div>
  )
}

// ============== QUOTATION CALCULATOR COMPONENT ==============

function QuotationCalculator({ onClose, onQuote }: { onClose: () => void; onQuote: (quotation: QuotationData) => void }) {
  const [service, setService] = useState<string>("")
  const [quantity, setQuantity] = useState<string>("")
  const [colors, setColors] = useState<string>("1")
  const [size, setSize] = useState<string>("5-12cm")
  const [includePlaca, setIncludePlaca] = useState(false)
  const [includePonchado, setIncludePonchado] = useState(false)
  const [includeTratamiento, setIncludeTratamiento] = useState(false)

  const handleGenerate = () => {
    const qty = parseInt(quantity)
    if (!service || !qty || qty <= 0) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    const quotation = generateQuotation(
      service,
      qty,
      service === "tampografia" || service === "vidrio-metal" ? parseInt(colors) : undefined,
      service === "bordado" ? size : undefined,
      {
        placa: includePlaca,
        ponchado: includePonchado,
        tratamiento: includeTratamiento,
      }
    )

    onQuote(quotation)
  }

  return (
    <Card className="mt-8 border-primary/40 shadow-lg">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Calculadora de Cotizaciones
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Servicio */}
          <div className="space-y-2">
            <Label htmlFor="service">Tipo de Servicio *</Label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tampografia">Tampografía / Serigrafía</SelectItem>
                <SelectItem value="vidrio-metal">Vidrio / Metal / Rubber</SelectItem>
                <SelectItem value="laser">Grabado Láser</SelectItem>
                <SelectItem value="bordado">Bordado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad de Piezas *</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Ej: 500"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
            />
          </div>

          {/* Colores/Tintas (solo para tampografía y vidrio) */}
          {(service === "tampografia" || service === "vidrio-metal") && (
            <div className="space-y-2">
              <Label htmlFor="colors">Número de Tintas/Colores</Label>
              <Select value={colors} onValueChange={setColors}>
                <SelectTrigger id="colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 color (incluido)</SelectItem>
                  <SelectItem value="2">2 colores</SelectItem>
                  <SelectItem value="3">3 colores</SelectItem>
                  <SelectItem value="4">4 colores</SelectItem>
                  <SelectItem value="5">5 colores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tamaño (solo para bordado) */}
          {service === "bordado" && (
            <div className="space-y-2">
              <Label htmlFor="size">Tamaño del Diseño</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger id="size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5-12cm">5-12 cm</SelectItem>
                  <SelectItem value="12-20cm">12-20 cm</SelectItem>
                  <SelectItem value="20-25cm">20-25 cm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Separator />

        {/* Costos Adicionales */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Costos Adicionales</Label>
          
          {(service === "tampografia" || service === "vidrio-metal") && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="placa"
                checked={includePlaca}
                onChange={(e) => setIncludePlaca(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="placa" className="font-normal cursor-pointer">
                Placa de tampografía ($280 MXN)
              </Label>
            </div>
          )}

          {service === "bordado" && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ponchado"
                checked={includePonchado}
                onChange={(e) => setIncludePonchado(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="ponchado" className="font-normal cursor-pointer">
                Ponchado de bordado ($280 MXN)
              </Label>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="tratamiento"
              checked={includeTratamiento}
              onChange={(e) => setIncludeTratamiento(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="tratamiento" className="font-normal cursor-pointer">
              Tratamiento especial ($150 MXN estimado)
            </Label>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleGenerate} className="flex-1 bg-primary hover:bg-primary/90">
            <DollarSign className="h-4 w-4 mr-2" />
            Generar Cotización
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancelar
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="pt-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-2">📊 Márgenes de Utilidad:</p>
            <ul className="space-y-1 ml-4">
              <li>• 1-200 piezas: 30% utilidad</li>
              <li>• 201-1,000 piezas: 25% utilidad</li>
              <li>• 1,000-5,000+ piezas: 20% utilidad</li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
