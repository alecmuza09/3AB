"use client"

import Image from "next/image"
import Link from "next/link"
import { useSiteContent } from "@/hooks/use-site-content"
import { EditableText } from "@/components/editable-text"

const featuredCategories = [
  {
    id: "oficina",
    name: "Oficina",
    description: "Bolígrafos, libretas, folders",
    productCount: "+250",
    image: "/art-culos-de-oficina-promocionales.png",
  },
  {
    id: "textiles",
    name: "Textiles",
    description: "Playeras, polos, uniformes corporativos",
    productCount: "+180",
    image: "/textiles-corporativos-personalizados.png",
  },
  {
    id: "drinkware",
    name: "Drinkware",
    description: "Tazas, termos y botellas",
    productCount: "+120",
    image: "/termos-met-licos-promocionales.png",
  },
]

export function CategoriesSection() {
  const { content, loading, refetch } = useSiteContent("home")
  const t = (key: string, fallback: string) => content[key] ?? fallback

  if (loading) {
    return (
      <section id="categorias" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="h-64 animate-pulse bg-gray-100 rounded-xl" />
        </div>
      </section>
    )
  }

  return (
    <section id="categorias" className="pb-16 lg:pb-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Título sección */}
        <div className="mb-10">
          <EditableText
            pageSlug="home"
            contentKey="categories_title"
            value={t("categories_title", "EXPLORA NUESTRAS CATEGORÍAS")}
            onSaved={refetch}
            label="Título Categorías"
            type="input"
          >
            <h2 className="font-black text-black" style={{ fontSize: "clamp(28px, 4vw, 46px)" }}>
              <span className="text-black">EXPLORA </span>
              <span className="text-[#DC2626]">NUESTRAS CATEGORÍAS</span>
            </h2>
          </EditableText>
        </div>

        {/* Grid de categorías */}
        <div className="grid md:grid-cols-3 gap-6">
          {featuredCategories.map((cat) => (
            <Link href={`/productos?category=${cat.id}`} key={cat.id}>
              <div className="group rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-white">
                {/* Header con nombre y contador */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <span className="text-xs text-gray-500 font-medium">{cat.name}</span>
                  <span className="text-[#DC2626] font-black text-xl leading-none">{cat.productCount}</span>
                </div>

                {/* Imagen */}
                <div className="relative mx-4 aspect-square rounded-xl overflow-hidden bg-gray-50">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>

                {/* Descripción */}
                <p className="px-4 py-3 text-xs text-gray-500 text-center">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
