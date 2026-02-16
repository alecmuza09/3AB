"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Heart, Tag } from "lucide-react"
import { useSiteContent } from "@/hooks/use-site-content"
import { EditableText } from "@/components/editable-text"

export function AboutUsSection() {
  const { content, loading, refetch } = useSiteContent("home")
  const t = (key: string, fallback: string) => content[key] ?? fallback

  const stats = [
    { icon: Clock, value: t("about_stat1_value", "+10"), label: t("about_stat1_label", "Años de experiencia") },
    { icon: Users, value: t("about_stat2_value", "4K+"), label: t("about_stat2_label", "Clientes satisfechos") },
    { icon: Heart, value: t("about_stat3_value", "100%"), label: t("about_stat3_label", "Empresa mexicana") },
    { icon: Tag, value: t("about_stat4_value", "250+"), label: t("about_stat4_label", "Productos disponibles") },
  ]

  const features = [
    { number: "01", title: t("about_feature1_title", "Calidad Premium"), description: t("about_feature1_desc", "Trabajamos solo con proveedores certificados para garantizar productos de primera.") },
    { number: "02", title: t("about_feature2_title", "Atención Personalizada"), description: t("about_feature2_desc", "Cada cliente es único. Nos adaptamos a tus necesidades específicas.") },
    { number: "03", title: t("about_feature3_title", "Innovación Constante"), description: t("about_feature3_desc", "Integramos tecnología de punta como IA para mejorar tu experiencia.") },
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
          <EditableText
            pageSlug="home"
            contentKey="about_badge"
            value={t("about_badge", "Nosotros")}
            onSaved={refetch}
            label="Badge Nosotros"
            type="input"
          >
            <Badge className="bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20 px-3 py-1 text-xs">
              {t("about_badge", "Nosotros")}
            </Badge>
          </EditableText>
          <EditableText
            pageSlug="home"
            contentKey="about_title"
            value={t("about_title", "Tu aliado en marketing promocional")}
            onSaved={refetch}
            label="Título Nosotros"
            type="input"
          >
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-black">
              {t("about_title", "Tu aliado en marketing promocional")}
            </h2>
          </EditableText>
          <EditableText
            pageSlug="home"
            contentKey="about_subtitle"
            value={t("about_subtitle", "Somos una empresa 100% mexicana con más de 10 años conectando marcas con personas a través de artículos promocionales de calidad.")}
            onSaved={refetch}
            label="Subtítulo Nosotros"
            type="textarea"
          >
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("about_subtitle", "Somos una empresa 100% mexicana con más de 10 años conectando marcas con personas a través de artículos promocionales de calidad.")}
            </p>
          </EditableText>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card
                key={index}
                className="border border-gray-200 rounded-xl bg-white text-center"
              >
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-[#DC2626]/10 rounded-full">
                      <IconComponent className="h-6 w-6 text-[#DC2626]" />
                    </div>
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-[#DC2626] mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="relative border border-gray-200 rounded-xl bg-white overflow-hidden"
            >
              <div className="absolute top-0 left-0 text-8xl font-bold text-[#DC2626]/10 leading-none pt-2 pl-4">
                {feature.number}
              </div>
              <CardContent className="p-8 relative z-10">
                <h3 className="text-xl font-bold text-black mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

