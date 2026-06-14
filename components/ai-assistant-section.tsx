"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, Zap, Target, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useSiteContent } from "@/hooks/use-site-content"
import { EditableText } from "@/components/editable-text"

const features = [
  {
    icon: Target,
    titleKey: "ai_feature1_title",
    descKey: "ai_feature1_desc",
    defaultTitle: "Análisis de necesidades",
    defaultDesc: "Comprende tu proyecto para recomendarte los productos ideales.",
  },
  {
    icon: MessageCircle,
    titleKey: "ai_feature2_title",
    descKey: "ai_feature2_desc",
    defaultTitle: "Respuestas instantáneas",
    defaultDesc: "Obtén recomendaciones personalizadas en segundos, 24/7.",
  },
  {
    icon: Zap,
    titleKey: "ai_feature3_title",
    descKey: "ai_feature3_desc",
    defaultTitle: "Decisiones más rápidas",
    defaultDesc: "Reduce el tiempo de selección con sugerencias inteligentes.",
  },
]

export function AIAssistantSection() {
  const { content, loading, refetch } = useSiteContent("home")
  const t = (key: string, fallback: string) => content[key] ?? fallback

  if (loading) {
    return (
      <section className="py-20 bg-[#DC2626]">
        <div className="container mx-auto px-4">
          <div className="h-64 animate-pulse bg-red-700/30 rounded-xl" />
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden bg-[#DC2626] py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* ── Columna izquierda: arte "IA" + features ── */}
          <div className="flex flex-col gap-10">
            {/* Ilustración decorativa con letras IA en outline */}
            <div className="relative select-none hidden lg:block">
              <div
                className="font-black leading-none text-transparent"
                style={{
                  fontSize: "clamp(140px, 18vw, 220px)",
                  WebkitTextStroke: "2px rgba(255,255,255,0.25)",
                }}
              >
                IA
              </div>

              {/* Blob 1 — mediano, junto a la A */}
              <div
                className="absolute"
                style={{
                  width: "120px",
                  height: "150px",
                  top: "30px",
                  right: "60px",
                  background: "radial-gradient(ellipse at 28% 18%, #4a4a4a, #0d0d0d 55%, #000)",
                  borderRadius: "42% 58% 36% 64% / 46% 38% 62% 54%",
                  transform: "rotate(-14deg)",
                }}
              />

              {/* Blob 2 — pequeño inferior */}
              <div
                className="absolute"
                style={{
                  width: "52px",
                  height: "68px",
                  bottom: "-20px",
                  right: "20px",
                  background: "radial-gradient(ellipse at 30% 20%, #555, #111 50%, #000)",
                  borderRadius: "52% 48% 38% 62% / 44% 56% 44% 56%",
                  transform: "rotate(20deg)",
                }}
              />

              {/* Blob 3 — mini */}
              <div
                className="absolute"
                style={{
                  width: "28px",
                  height: "38px",
                  bottom: "30px",
                  right: "140px",
                  background: "radial-gradient(ellipse at 30% 20%, #555, #111 50%, #000)",
                  borderRadius: "50% 50% 44% 56% / 52% 48% 52% 48%",
                  transform: "rotate(-8deg)",
                }}
              />
            </div>

            {/* Lista de features */}
            <div className="space-y-5">
              {features.map((feat, i) => {
                const Icon = feat.icon
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 rounded-full border border-white/30 bg-white/10">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">
                        {t(feat.titleKey, feat.defaultTitle)}
                      </p>
                      <p className="text-white/70 text-sm mt-0.5">
                        {t(feat.descKey, feat.defaultDesc)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Columna derecha: título + descripción + chat + CTA ── */}
          <div className="flex flex-col gap-6">
            {/* Título */}
            <div>
              <EditableText
                pageSlug="home"
                contentKey="ai_title_line1"
                value={t("ai_title_line1", "¿NO SABES QUÉ PRODUCTOS ELEGIR?")}
                onSaved={refetch}
                label="Título IA línea 1"
                type="input"
              >
                <h2
                  className="font-black text-white uppercase leading-tight"
                  style={{ fontSize: "clamp(22px, 3.2vw, 40px)" }}
                >
                  {t("ai_title_line1", "¿NO SABES QUÉ PRODUCTOS ELEGIR?")}
                </h2>
              </EditableText>
              <EditableText
                pageSlug="home"
                contentKey="ai_title_line2"
                value={t("ai_title_line2", "TE AYUDAMOS")}
                onSaved={refetch}
                label="Título IA línea 2"
                type="input"
              >
                <h3
                  className="font-black text-white/80 uppercase leading-tight"
                  style={{ fontSize: "clamp(18px, 2.5vw, 32px)" }}
                >
                  {t("ai_title_line2", "TE AYUDAMOS")}
                </h3>
              </EditableText>
            </div>

            <EditableText
              pageSlug="home"
              contentKey="ai_subtitle"
              value={t("ai_subtitle", "Nuestro asistente de Inteligencia Artificial te acompaña paso a paso para identificar los productos promocionales más adecuados, comprendiendo tus necesidades específicas.")}
              onSaved={refetch}
              label="Descripción IA"
              type="textarea"
            >
              <p className="text-white/80 text-sm leading-relaxed">
                {t("ai_subtitle", "Nuestro asistente de Inteligencia Artificial te acompaña paso a paso para identificar los productos promocionales más adecuados, comprendiendo tus necesidades específicas.")}
              </p>
            </EditableText>

            {/* Chat widget */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <div className="h-9 w-9 rounded-full bg-[#DC2626] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Asistente 3A Branding</p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-xs text-gray-500">En línea</span>
                  </div>
                </div>
              </div>

              {/* Mensajes */}
              <div className="p-4 space-y-3 bg-gray-50 min-h-[180px]">
                <div className="flex items-start gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <div className="bg-gray-200 rounded-lg px-3 py-2 max-w-[80%]">
                    <p className="text-xs text-gray-800">¡Hola! Soy parte del equipo de 3A Branding. Cuéntame, ¿qué tipo de evento tienes en mente?</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-[#DC2626] rounded-lg px-3 py-2 max-w-[75%]">
                    <p className="text-xs text-white">Tenemos una conferencia para 200 personas</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <div className="bg-gray-200 rounded-lg px-3 py-2 max-w-[80%]">
                    <p className="text-xs text-gray-800">¡Perfecto! Para una conferencia te recomiendo: bolígrafos premium, termos personalizados y libretas ejecutivas. ¿Te gustaría ver opciones?</p>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2 bg-white">
                <input
                  type="text"
                  placeholder="Escribe tu mensaje..."
                  readOnly
                  className="flex-1 text-sm bg-gray-100 rounded-lg px-3 py-2 outline-none text-gray-500"
                />
                <div className="h-9 w-9 rounded-full bg-[#DC2626] flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex justify-end">
              <Link href="/asistente">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-2 border-white text-white bg-transparent hover:bg-white hover:text-[#DC2626] font-semibold px-6"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t("ai_cta_text", "Probar asistente IA")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
