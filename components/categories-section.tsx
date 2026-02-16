"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useSiteContent } from "@/hooks/use-site-content"
import { EditableText } from "@/components/editable-text"
import {
  Coffee,
  Shirt,
  Briefcase,
  Gift,
  Pen,
  Watch,
  Smartphone,
  Thermometer,
  Backpack,
  Crown,
  ShoppingBag,
  Usb,
  Utensils,
  Trophy,
  Calendar,
  FolderOpen,
  Wine,
  Leaf,
  Dumbbell,
  Heart,
  Pin,
  Award,
  Frame,
  CreditCard,
  Shirt as TShirt,
  CreditCard as IdCard,
} from "lucide-react"

const categories = [
  {
    id: "oficina",
    name: "Oficina",
    description: "Bolígrafos, libretas, folders y más",
    icon: Briefcase,
    image: "/art-culos-de-oficina-promocionales.png",
    productCount: "250+",
    popular: true,
  },
  {
    id: "textiles",
    name: "Textiles",
    description: "Playeras, polos, uniformes corporativos",
    icon: Shirt,
    image: "/textiles-corporativos-personalizados.png",
    productCount: "180+",
    popular: true,
  },
  {
    id: "tazas",
    name: "Tazas",
    description: "Tazas personalizadas de cerámica y térmicas",
    icon: Coffee,
    image: "/tazas-y-termos-personalizados.png",
    productCount: "120+",
    popular: true,
  },
  {
    id: "tecnologia",
    name: "Tecnología",
    description: "USB, powerbanks, auriculares y gadgets",
    icon: Smartphone,
    image: "/productos-tecnol-gicos-promocionales.png",
    productCount: "95+",
    popular: true,
  },
  {
    id: "termos",
    name: "Termos",
    description: "Termos y botellas térmicas personalizadas",
    icon: Thermometer,
    image: "/termos-met-licos-promocionales.png",
    productCount: "85+",
    popular: false,
  },
  {
    id: "mochilas",
    name: "Mochilas",
    description: "Mochilas ejecutivas y deportivas",
    icon: Backpack,
    image: "/mochila-ejecutiva.png",
    productCount: "75+",
    popular: false,
  },
  {
    id: "gorras",
    name: "Gorras",
    description: "Gorras bordadas y personalizadas",
    icon: Crown,
    image: "/gorra-corporativa.png",
    productCount: "90+",
    popular: false,
  },
  {
    id: "playeras",
    name: "Playeras",
    description: "Playeras polo y corporativas",
    icon: TShirt,
    image: "/polo-shirt-corporate.png",
    productCount: "150+",
    popular: false,
  },
  {
    id: "bolsas",
    name: "Bolsas",
    description: "Bolsas ecológicas y promocionales",
    icon: ShoppingBag,
    image: "/bolsas-promocionales.jpg",
    productCount: "110+",
    popular: false,
  },
  {
    id: "usb",
    name: "USB",
    description: "Memorias USB personalizadas",
    icon: Usb,
    image: "/usb-personalizado.png",
    productCount: "65+",
    popular: false,
  },
  {
    id: "relojes",
    name: "Relojes",
    description: "Relojes corporativos elegantes",
    icon: Watch,
    image: "/relojes-promocionales-corporativos.png",
    productCount: "45+",
    popular: false,
  },
  {
    id: "hogar",
    name: "Hogar",
    description: "Utensilios, delantales y accesorios",
    icon: Utensils,
    image: "/productos-para-hogar-y-cocina.png",
    productCount: "80+",
    popular: false,
  },
  {
    id: "plumas",
    name: "Plumas",
    description: "Plumas y bolígrafos premium",
    icon: Pen,
    image: "/boligrafo-promocional.png",
    productCount: "200+",
    popular: false,
  },
  {
    id: "reconocimientos",
    name: "Reconocimientos",
    description: "Placas, trofeos y diplomas",
    icon: Trophy,
    image: "/placa-reconocimiento.png",
    productCount: "55+",
    popular: false,
  },
  {
    id: "gafetes",
    name: "Gafetes",
    description: "Gafetes y porta gafetes",
    icon: IdCard,
    image: "/gafete-identificacion.png",
    productCount: "70+",
    popular: false,
  },
  {
    id: "calendarios",
    name: "Calendarios",
    description: "Calendarios de escritorio y pared",
    icon: Calendar,
    image: "/calendario-escritorio.png",
    productCount: "40+",
    popular: false,
  },
  {
    id: "folders",
    name: "Folders",
    description: "Folders ejecutivos y carpetas",
    icon: FolderOpen,
    image: "/folder-ejecutivo.png",
    productCount: "60+",
    popular: false,
  },
  {
    id: "vasos",
    name: "Vasos",
    description: "Vasos térmicos y personalizados",
    icon: Wine,
    image: "/vasos-promocionales.jpg",
    productCount: "95+",
    popular: false,
  },
  {
    id: "ecologicos",
    name: "Ecológicos",
    description: "Productos sustentables y reciclados",
    icon: Leaf,
    image: "/productos-ecol-gicos.jpg",
    productCount: "50+",
    popular: false,
  },
  {
    id: "deportes",
    name: "Deportes",
    description: "Artículos deportivos personalizados",
    icon: Dumbbell,
    image: "/productos-deportivos.jpg",
    productCount: "65+",
    popular: false,
  },
  {
    id: "salud",
    name: "Salud",
    description: "Productos de higiene y salud",
    icon: Heart,
    image: "/productos-de-salud.jpg",
    productCount: "35+",
    popular: false,
  },
  {
    id: "pines",
    name: "Pines",
    description: "Pines metálicos y esmaltados",
    icon: Pin,
    image: "/pines-promocionales.jpg",
    productCount: "80+",
    popular: false,
  },
  {
    id: "placas",
    name: "Placas",
    description: "Placas de reconocimiento",
    icon: Award,
    image: "/placa-reconocimiento.png",
    productCount: "45+",
    popular: false,
  },
  {
    id: "portarretratos",
    name: "Portarretratos",
    description: "Marcos y portarretratos personalizados",
    icon: Frame,
    image: "/portarretratos.jpg",
    productCount: "30+",
    popular: false,
  },
  {
    id: "tarjetas",
    name: "Tarjetas de Presentación",
    description: "Tarjetas corporativas premium",
    icon: CreditCard,
    image: "/tarjetas-de-presentaci-n.jpg",
    productCount: "100+",
    popular: false,
  },
  {
    id: "antiestres",
    name: "Antiestrés",
    description: "Productos antiestrés y relajantes",
    icon: Gift,
    image: "/productos-antiestr-s.jpg",
    productCount: "55+",
    popular: false,
  },
]

const featuredCategories = [
  {
    id: "oficina",
    name: "Oficina",
    description: "Bolígrafos, libretas, folders y más",
    icon: Briefcase,
    productCount: "250+",
  },
  {
    id: "textiles",
    name: "Textiles",
    description: "Playeras, polos, uniformes corporativos",
    icon: Shirt,
    productCount: "180+",
  },
  {
    id: "drinkware",
    name: "Drinkware",
    description: "Tazas, termos y botellas personalizadas",
    icon: Coffee,
    productCount: "120+",
  },
  {
    id: "regalos-premium",
    name: "Regalos Premium",
    description: "Kits ejecutivos y regalos corporativos",
    icon: Gift,
    productCount: "80+",
  },
  {
    id: "escritura",
    name: "Escritura",
    description: "Bolígrafos, plumas y sets de escritura",
    icon: Pen,
    productCount: "150+",
  },
  {
    id: "accesorios",
    name: "Accesorios",
    description: "Relojes, llaveros y artículos personales",
    icon: Watch,
    productCount: "90+",
  },
]

export function CategoriesSection() {
  const { content, loading, refetch } = useSiteContent("home")
  const t = (key: string, fallback: string) => content[key] ?? fallback

  if (loading) {
    return (
      <section id="categorias" className="py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="h-64 animate-pulse bg-gray-100 rounded-xl" />
        </div>
      </section>
    )
  }

  return (
    <section id="categorias" className="py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <EditableText
              pageSlug="home"
              contentKey="categories_badge"
              value={t("categories_badge", "Catálogo")}
              onSaved={refetch}
              label="Badge Categorías"
              type="input"
            >
              <Badge className="bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20 px-3 py-1 text-xs mb-3">
                {t("categories_badge", "Catálogo")}
              </Badge>
            </EditableText>
            <EditableText
              pageSlug="home"
              contentKey="categories_title"
              value={t("categories_title", "Explora nuestras categorías")}
              onSaved={refetch}
              label="Título Categorías"
              type="input"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-black">
                {t("categories_title", "Explora nuestras categorías")}
              </h2>
            </EditableText>
          </div>
          <EditableText
            pageSlug="home"
            contentKey="categories_link_text"
            value={t("categories_link_text", "Ver catálogo completo")}
            onSaved={refetch}
            label="Texto enlace catálogo"
            type="input"
          >
            <Link href="/catalogos">
              <Button variant="link" className="text-[#DC2626] hover:text-[#B91C1C] p-0 h-auto">
                {t("categories_link_text", "Ver catálogo completo")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </EditableText>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCategories.map((category) => {
            const IconComponent = category.icon
            return (
              <Card
                key={category.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 rounded-xl bg-white"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Icon and Count */}
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <IconComponent className="h-6 w-6 text-[#DC2626]" />
                      </div>
                      <Badge className="bg-[#DC2626] text-white border-0 font-bold text-sm">
                        {category.productCount}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-black group-hover:text-[#DC2626] transition-colors">
                      {category.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {category.description}
                    </p>
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
