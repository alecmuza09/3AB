"use client"

import { useSiteContent } from "@/hooks/use-site-content"
import { EditableText } from "@/components/editable-text"

const stats = [
  { valueKey: "about_stat1_value", labelKey: "about_stat1_label", defaultValue: "100%", defaultLabel: "mexicana" },
  { valueKey: "about_stat2_value", labelKey: "about_stat2_label", defaultValue: "+10", defaultLabel: "años" },
  { valueKey: "about_stat3_value", labelKey: "about_stat3_label", defaultValue: "+4K", defaultLabel: "clientes satisfechos" },
  { valueKey: "about_stat4_value", labelKey: "about_stat4_label", defaultValue: "mejor", defaultLabel: "calidad-precio" },
]

const features = [
  {
    titleKey: "about_feature1_title",
    descKey: "about_feature1_desc",
    defaultTitle: "CALIDAD PREMIUM",
    defaultDesc: "Trabajamos solo con proveedores certificados para garantizar productos de primera.",
  },
  {
    titleKey: "about_feature2_title",
    descKey: "about_feature2_desc",
    defaultTitle: "ATENCIÓN PERSONALIZADA",
    defaultDesc: "Cada cliente es único. Nos adaptamos a tus necesidades específicas.",
  },
  {
    titleKey: "about_feature3_title",
    descKey: "about_feature3_desc",
    defaultTitle: "INNOVACIÓN CONSTANTE",
    defaultDesc: "Integramos tecnología de punta como IA para mejorar tu experiencia.",
  },
]

export function AboutUsSection() {
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
    <section
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #f5f5f5 0%, #1a1a1a 38%, #0a0a0a 100%)",
      }}
    >
      {/* ── Bloque "somos" ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <EditableText
          pageSlug="home"
          contentKey="about_title_main"
          value={t("about_title_main", "somos")}
          onSaved={refetch}
          label="Título grande 'somos'"
          type="input"
        >
          <h2
            className="font-black italic text-white leading-none tracking-tight"
            style={{ fontSize: "clamp(80px, 14vw, 200px)" }}
          >
            {t("about_title_main", "somos")}
          </h2>
        </EditableText>
        <EditableText
          pageSlug="home"
          contentKey="about_subtitle"
          value={t("about_subtitle", "tu aliado en marketing promocional")}
          onSaved={refetch}
          label="Subtítulo somos"
          type="input"
        >
          <p className="text-white/70 text-base lg:text-lg mt-2 font-medium">
            {t("about_subtitle", "tu aliado en marketing promocional")}
          </p>
        </EditableText>
      </div>

      {/* ── Stats ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center lg:text-left">
              {/* Decoración de corchete rojo */}
              <div
                className="text-[#DC2626] font-black leading-none mb-1"
                style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
                aria-hidden
              >
                ⌐
              </div>
              <p
                className="font-black text-white leading-none"
                style={{ fontSize: "clamp(32px, 5vw, 58px)" }}
              >
                {t(stat.valueKey, stat.defaultValue)}
              </p>
              <p className="text-white/60 text-sm mt-1 font-medium">
                {t(stat.labelKey, stat.defaultLabel)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <div className="bg-white/5 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feat, i) => (
              <div key={i}>
                <h3 className="font-black text-[#DC2626] text-sm uppercase tracking-widest mb-2">
                  {t(feat.titleKey, feat.defaultTitle)}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {t(feat.descKey, feat.defaultDesc)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
