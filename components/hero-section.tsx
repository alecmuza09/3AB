"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ShoppingBag, Settings, Sparkles, Flag, Star, Diamond } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSiteContent } from "@/hooks/use-site-content"
import { EditableImage } from "@/components/editable-image"
import { EditableText } from "@/components/editable-text"

export function HeroSection() {
  const { content, loading, refetch } = useSiteContent("home")

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 py-12 lg:py-20">
          <div className="h-[400px] animate-pulse bg-gray-100 rounded-xl" />
        </div>
      </section>
    )
  }

  const t = (key: string, fallback: string) => content[key] ?? fallback

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <EditableText
                pageSlug="home"
                contentKey="hero_badge"
                value={t("hero_badge", "Artículos Promocionales con IA")}
                onSaved={refetch}
                label="Badge del Hero"
                type="input"
              >
                <Badge className="bg-[#DC2626] text-white border-0 px-3 py-1 text-xs font-medium">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t("hero_badge", "Artículos Promocionales con IA")}
                </Badge>
              </EditableText>
            </div>

            <EditableText
              pageSlug="home"
              contentKey="hero_title_line1"
              value={t("hero_title_line1", "La forma más fácil de comprar")}
              onSaved={refetch}
              label="Título Hero - Línea 1"
              type="input"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-black">{t("hero_title_line1", "La forma más fácil de comprar")}</span>
                <br />
                <EditableText
                  pageSlug="home"
                  contentKey="hero_title_line2"
                  value={t("hero_title_line2", "promocionales")}
                  onSaved={refetch}
                  label="Título Hero - Línea 2"
                  type="input"
                >
                  <span className="text-[#DC2626]">{t("hero_title_line2", "promocionales")}</span>
                </EditableText>
              </h1>
            </EditableText>

            <EditableText
              pageSlug="home"
              contentKey="hero_subtitle"
              value={t("hero_subtitle", "Conectamos marcas, personas y momentos. Cotiza, personaliza y ordena de manera automática con la calidad y el precio que necesitas.")}
              onSaved={refetch}
              label="Subtítulo Hero"
              type="textarea"
            >
              <p className="text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
                {t("hero_subtitle", "Conectamos marcas, personas y momentos. Cotiza, personaliza y ordena de manera automática con la calidad y el precio que necesitas.")}
              </p>
            </EditableText>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
              <Badge variant="outline" className="rounded-full px-4 py-1.5 border-gray-300 bg-white">
                <Flag className="h-3 w-3 mr-1.5 text-[#DC2626]" />
                100% Mexicana
              </Badge>
              <Badge variant="outline" className="rounded-full px-4 py-1.5 border-gray-300 bg-white">
                <Star className="h-3 w-3 mr-1.5 text-yellow-500 fill-yellow-500" />
                +10 años de experiencia
              </Badge>
              <Badge variant="outline" className="rounded-full px-4 py-1.5 border-gray-300 bg-white">
                <Diamond className="h-3 w-3 mr-1.5 text-blue-500" />
                Mejor calidad-precio
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/productos">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg shadow-lg"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {t("hero_cta_primary", "Explorar productos")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/cotizador">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white rounded-lg"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  {t("hero_cta_secondary", "Personalizar ahora")}
                </Button>
              </Link>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-500">
                {t("hero_social_proof", "1K 2K 3K 4K +4,000 empresas confían en nosotros")}
              </p>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative bg-gray-100 rounded-2xl p-8">
              <EditableImage
                pageSlug="home"
                imageKey="hero_image"
                currentImageUrl={t("hero_image", "/placeholder.svg?height=500&width=600")}
                onSaved={refetch}
                imageLabel="Imagen Hero"
                altText="Productos promocionales"
              >
                <div className="relative w-full h-[500px] bg-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={t("hero_image", "/placeholder.svg?height=500&width=600")}
                    alt="Productos promocionales"
                    fill
                    className="object-cover"
                    unoptimized={t("hero_image", "").startsWith("http")}
                  />
                </div>
              </EditableImage>
              <div className="absolute top-4 right-4 bg-white border-2 border-[#DC2626] rounded-lg px-4 py-2 shadow-lg">
                <p className="text-sm font-bold text-[#DC2626]">{t("hero_badge_250", "250+ Productos")}</p>
              </div>
              <div className="absolute bottom-4 left-4 bg-white border-2 border-[#DC2626] rounded-lg px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#DC2626]" />
                  <p className="text-sm font-semibold text-gray-800">{t("hero_badge_ia", "Asistente IA Disponible 24/7")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
