"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Palette, Truck } from "lucide-react"
import { useSiteContent } from "@/hooks/use-site-content"

export function HowItWorksSection() {
  const { content, loading } = useSiteContent("home")
  const t = (key: string, fallback: string) => content[key] ?? fallback

  const steps = [
    { number: "01", icon: Package, title: t("how_step1_title", "Elige tu producto"), description: t("how_step1_desc", "Explora el catálogo y encuentra la opción ideal para tu marca, tu equipo o tu proyecto.") },
    { number: "02", icon: Palette, title: t("how_step2_title", "Diseña y personaliza"), description: t("how_step2_desc", "Ajusta colores, impresión o bordado y visualiza cómo se verá tu diseño antes de producirlo.") },
    { number: "03", icon: Truck, title: t("how_step3_title", "Ordena y recibe"), description: t("how_step3_desc", "Define cantidades, confirma tu pedido y recibe tus promocionales donde los necesites.") },
  ]

  if (loading) {
    return (
      <section className="py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="h-64 animate-pulse bg-gray-100 rounded-xl" />
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <Badge className="bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20 px-4 py-1.5 text-sm">
            {t("how_badge", "Proceso Simple")}
          </Badge>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-black">
            {t("how_title", "Elige, diseña y ordena promocionales de forma simple")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("how_subtitle", "En solo 3 pasos tendrás tus artículos personalizados listos para entregar")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <Card
                key={index}
                className="relative border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white"
              >
                <div className="absolute -top-4 -right-4 bg-[#DC2626] text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                  {step.number}
                </div>
                <CardContent className="p-8 pt-12">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <IconComponent className="h-8 w-8 text-gray-800" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-black text-center">{step.title}</h3>
                    <p className="text-gray-600 text-center leading-relaxed">{step.description}</p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <div className="h-2 w-2 bg-[#DC2626] rounded-full" />
                      <span className="text-sm text-gray-500">Fácil y rápido</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

