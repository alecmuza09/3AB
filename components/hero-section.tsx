"use client"

import { Button } from "@/components/ui/button"
import { ShoppingBag, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSiteContent } from "@/hooks/use-site-content"
import { EditableText } from "@/components/editable-text"

export function HeroSection() {
  const { content, loading, refetch } = useSiteContent("home")

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 py-12 lg:py-20">
          <div className="h-[500px] animate-pulse bg-gray-100 rounded-xl" />
        </div>
      </section>
    )
  }

  const t = (key: string, fallback: string) => content[key] ?? fallback

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid lg:grid-cols-[1fr_420px] gap-4 items-center">

          {/* ── Columna izquierda ── */}
          <div className="space-y-4 relative z-10">
            <EditableText
              pageSlug="home"
              contentKey="hero_eyebrow"
              value={t("hero_eyebrow", "La forma más fácil de comprar")}
              onSaved={refetch}
              label="Subtítulo arriba del título"
              type="input"
            >
              <p className="text-gray-500 text-sm font-medium tracking-wide">
                {t("hero_eyebrow", "La forma más fácil de comprar")}
              </p>
            </EditableText>

            {/* Mega-título */}
            <div className="-ml-1">
              <h1
                className="font-black leading-[0.82] tracking-tighter text-black select-none"
                style={{ fontSize: "clamp(72px, 13vw, 160px)" }}
              >
                merch
              </h1>
              <p
                className="font-bold text-[#DC2626] mt-1"
                style={{ fontSize: "clamp(22px, 3.5vw, 46px)" }}
              >
                Promocionales con IA
                <span className="ml-1 text-[#DC2626]">✦</span>
              </p>
            </div>

            <div className="pt-3 space-y-2 max-w-lg">
              <EditableText
                pageSlug="home"
                contentKey="hero_title_main"
                value={t("hero_title_main", "HACEMOS TODO POR TI")}
                onSaved={refetch}
                label="Título principal Hero"
                type="input"
              >
                <h2 className="text-base lg:text-lg font-black uppercase tracking-widest text-black">
                  {t("hero_title_main", "HACEMOS TODO POR TI")}
                </h2>
              </EditableText>
              <EditableText
                pageSlug="home"
                contentKey="hero_subtitle"
                value={t("hero_subtitle", "Conectamos marcas, personas y momentos. Cotiza, personaliza y ordena de manera automática con la calidad y el precio que necesitas.")}
                onSaved={refetch}
                label="Descripción Hero"
                type="textarea"
              >
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t("hero_subtitle", "Conectamos marcas, personas y momentos. Cotiza, personaliza y ordena de manera automática con la calidad y el precio que necesitas.")}
                </p>
              </EditableText>
            </div>

            <div className="flex flex-wrap gap-3 pt-3">
              <Link href="/productos">
                <Button
                  size="lg"
                  className="rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white px-6 font-semibold shadow-none border-0"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {t("hero_cta_primary", "Ver productos")}
                </Button>
              </Link>
              <Link href="/cotizador">
                <Button
                  size="lg"
                  className="rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white px-6 font-semibold shadow-none border-0"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {t("hero_cta_secondary", "Personaliza")}
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Columna derecha: imagen del producto + decoración ── */}
          <div className="relative hidden lg:flex items-center justify-center h-[480px]">

            {/* Blob grande — arriba derecha */}
            <div
              className="absolute"
              style={{
                width: "210px",
                height: "260px",
                top: "-10px",
                right: "10px",
                background: "radial-gradient(ellipse at 28% 18%, #4a4a4a, #0d0d0d 55%, #000)",
                borderRadius: "42% 58% 36% 64% / 46% 38% 62% 54%",
                transform: "rotate(-18deg)",
                zIndex: 1,
              }}
            />

            {/* Blob pequeño — lateral derecho */}
            <div
              className="absolute"
              style={{
                width: "56px",
                height: "76px",
                top: "52%",
                right: "2px",
                background: "radial-gradient(ellipse at 30% 20%, #555, #111 50%, #000)",
                borderRadius: "52% 48% 38% 62% / 44% 56% 44% 56%",
                transform: "rotate(15deg)",
                zIndex: 1,
              }}
            />

            {/* Blob mini — inferior */}
            <div
              className="absolute"
              style={{
                width: "34px",
                height: "46px",
                bottom: "80px",
                right: "120px",
                background: "radial-gradient(ellipse at 30% 20%, #555, #111 50%, #000)",
                borderRadius: "50% 50% 44% 56% / 52% 48% 52% 48%",
                transform: "rotate(-8deg)",
                zIndex: 1,
              }}
            />

            {/* Imagen del produto */}
            <div className="relative z-10 w-[220px] h-[390px]">
              <Image
                src="/termos-met-licos-promocionales.png"
                alt="Termo personalizado 3A Branding"
                fill
                className="object-contain drop-shadow-xl"
                unoptimized
              />
            </div>

            {/* Badge "Hecho en México" */}
            <div
              className="absolute bottom-8 right-4 z-20 bg-black text-white text-center font-bold rounded-sm px-3 py-2 leading-tight"
              style={{ fontSize: "9px", letterSpacing: "0.05em" }}
            >
              <div className="text-[7px] mb-0.5 uppercase tracking-widest">HECHO EN</div>
              <div className="text-2xl">🦅</div>
              <div className="uppercase tracking-widest text-[9px]">MÉXICO</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
