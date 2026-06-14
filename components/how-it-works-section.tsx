"use client"

import Image from "next/image"
import { Package } from "lucide-react"
import { useSiteContent } from "@/hooks/use-site-content"
import { EditableText } from "@/components/editable-text"

const steps = [
  {
    number: "1",
    key: "step1",
    defaultTitle: "ELIGE",
    defaultDesc: "Explora el catálogo y encuentra la opción ideal para tu marca, equipo o proyecto.",
    image: "/mochila-ejecutiva.png",
    hasImage: true,
  },
  {
    number: "2",
    key: "step2",
    defaultTitle: "PERSONALIZA",
    defaultDesc: "Ajusta colores o bordado y visualiza tu diseño antes de producirlo.",
    image: "/mochila-ejecutiva.png",
    hasImage: true,
    logoOverlay: true,
  },
  {
    number: "3",
    key: "step3",
    defaultTitle: "ORDENA Y RECIBE",
    defaultDesc: "Define cantidad, confirma tu pedido y recibe tus promocionales.",
    image: null,
    hasImage: false,
  },
]

export function HowItWorksSection() {
  const { content, loading, refetch } = useSiteContent("home")
  const t = (key: string, fallback: string) => content[key] ?? fallback

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="h-64 animate-pulse bg-gray-100 rounded-xl" />
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Encabezado */}
        <div className="text-center mb-14">
          <EditableText
            pageSlug="home"
            contentKey="how_title"
            value={t("how_title", "PROCESO SIMPLE")}
            onSaved={refetch}
            label="Título Proceso Simple"
            type="input"
          >
            <h2 className="font-black uppercase text-black" style={{ fontSize: "clamp(32px, 5vw, 52px)" }}>
              {t("how_title", "PROCESO SIMPLE")}
            </h2>
          </EditableText>
          <EditableText
            pageSlug="home"
            contentKey="how_subtitle"
            value={t("how_subtitle", "En solo 3 pasos tendrás tus artículos personalizados, listos para entregar")}
            onSaved={refetch}
            label="Subtítulo Proceso Simple"
            type="textarea"
          >
            <p className="text-gray-500 text-base mt-3 max-w-xl mx-auto">
              {t("how_subtitle", "En solo 3 pasos tendrás tus artículos personalizados, listos para entregar")}
            </p>
          </EditableText>
        </div>

        {/* Pasos */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {steps.map((step) => (
            <div key={step.key} className="flex flex-col items-center text-center gap-4">
              {/* Número + Etiqueta */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-[#DC2626] text-white font-black text-sm flex items-center justify-center">
                  {step.number}
                </div>
                <span className="font-black text-black text-sm tracking-widest uppercase">
                  {t(`how_${step.key}_title`, step.defaultTitle)}
                </span>
              </div>

              {/* Imagen */}
              <div className="relative w-full max-w-[220px] aspect-square flex items-center justify-center">
                {step.hasImage && step.image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={step.image}
                      alt={t(`how_${step.key}_title`, step.defaultTitle)}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                    {step.logoOverlay && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/80 backdrop-blur-sm text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded border border-gray-300">
                          LOGOTIPO
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full bg-amber-100 rounded-xl flex items-center justify-center border border-amber-200">
                    <Package className="h-20 w-20 text-amber-600" strokeWidth={1} />
                  </div>
                )}
              </div>

              {/* Descripción */}
              <p className="text-gray-600 text-sm leading-relaxed max-w-[200px]">
                {t(`how_${step.key}_desc`, step.defaultDesc)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
