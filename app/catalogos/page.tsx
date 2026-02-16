"use client"

import { useSiteContent } from "@/hooks/use-site-content"
import { TopHeader } from "@/components/top-header"
import { Footer } from "@/components/footer"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import {
  Download,
  Eye,
  FileText,
  ImageIcon,
  Star,
  Package,
  Shirt,
  Award,
  Building,
  Shield,
  Sofa,
  Gift,
} from "lucide-react"
import { EditableImage } from "@/components/editable-image"
import { EditableText } from "@/components/editable-text"

export default function CatalogosPage() {
  const { content, refetch } = useSiteContent("catalogos")
  const t = (key: string, fallback: string) => content[key] ?? fallback
  const catalogs = [
    {
      id: 1,
      title: "Chamarras",
      description: "Chamarras corporativas y promocionales de alta calidad con opciones de personalización completa.",
      pdfUrl: "https://catalago.3abranding.com/wp-content/uploads/2025/07/3A-Chamarras-compressed.pdf",
      image: "/catalog-chamarras.png",
      featured: true,
      categories: ["Chamarras Ejecutivas", "Chamarras Deportivas", "Chamarras de Seguridad"],
      icon: Shirt,
    },
    {
      id: 2,
      title: "Uniformes",
      description: "Uniformes corporativos, médicos, industriales y de servicios con bordado y serigrafía personalizada.",
      pdfUrl: "https://catalago.3abranding.com/wp-content/uploads/2025/07/3A-Uniformes-compressed.pdf",
      image: "/catalog-uniformes.png",
      featured: false,
      categories: ["Uniformes Médicos", "Uniformes Corporativos", "Uniformes Industriales"],
      icon: Shirt,
    },
    {
      id: 3,
      title: "Stands",
      description: "Stands modulares, displays y estructuras para eventos, ferias y exposiciones corporativas.",
      pdfUrl: "https://catalago.3abranding.com/wp-content/uploads/2025/07/3A_Book-Stands-compressed.pdf",
      image: "/catalog-stands.png",
      featured: false,
      categories: ["Stands Modulares", "Displays", "Estructuras Portátiles"],
      icon: Building,
    },
    {
      id: 4,
      title: "Seguridad",
      description: "Equipos de protección personal, señalética de seguridad y productos para seguridad industrial.",
      pdfUrl: "https://catalago.3abranding.com/wp-content/uploads/2025/07/3ABranding_catalogo_seguridad_compressed-compressed.pdf",
      image: "/catalog-seguridad.png",
      featured: false,
      categories: ["EPP", "Señalética", "Seguridad Industrial"],
      icon: Shield,
    },
    {
      id: 5,
      title: "Mobiliario",
      description: "Mobiliario corporativo, sillas ejecutivas, escritorios y muebles para oficina personalizables.",
      pdfUrl: "https://catalago.3abranding.com/wp-content/uploads/2025/07/3A-Mobiliario-Renra-compressed.pdf",
      image: "/catalog-mobiliario.png",
      featured: false,
      categories: ["Sillas Ejecutivas", "Escritorios", "Muebles de Oficina"],
      icon: Sofa,
    },
    {
      id: 6,
      title: "Promocionales 1",
      description: "Primera colección de productos promocionales: bolígrafos, tazas, USB, llaveros y artículos diversos.",
      pdfUrl: "https://catalago.3abranding.com/wp-content/uploads/2025/07/3A-Promocionales-1-compressed.pdf",
      image: "/catalog-promocionales.png",
      featured: false,
      categories: ["Escritura", "Tecnología", "Hogar", "Accesorios"],
      icon: Gift,
    },
    {
      id: 7,
      title: "Promocionales 2",
      description: "Segunda colección de productos promocionales con amplia variedad de opciones personalizables.",
      pdfUrl: "https://catalago.3abranding.com/wp-content/uploads/2025/07/3A-Promocionales-2.pdf-compressed.pdf",
      image: "/catalog-promocionales.png",
      featured: false,
      categories: ["Escritura", "Tecnología", "Hogar", "Accesorios"],
      icon: Gift,
    },
    {
      id: 8,
      title: "Promocionales 3",
      description: "Tercera colección de productos promocionales ideales para eventos y campañas corporativas.",
      pdfUrl: "https://catalago.3abranding.com/wp-content/uploads/2025/07/3A-Promocionales-3-compressed.pdf",
      image: "/catalog-promocionales.png",
      featured: false,
      categories: ["Escritura", "Tecnología", "Hogar", "Accesorios"],
      icon: Gift,
    },
    {
      id: 9,
      title: "Promocionales 4",
      description: "Cuarta colección de productos promocionales con las últimas novedades del mercado.",
      pdfUrl: "https://catalago.3abranding.com/wp-content/uploads/2025/07/3A-Promocionales-4-compressed.pdf",
      image: "/catalog-promocionales.png",
      featured: false,
      categories: ["Escritura", "Tecnología", "Hogar", "Accesorios"],
      icon: Gift,
    },
    {
      id: 10,
      title: "Reconocimientos",
      description: "Placas, trofeos, medallas y reconocimientos personalizados para eventos corporativos y premiaciones.",
      pdfUrl: "https://catalago.3abranding.com/wp-content/uploads/2025/08/3A-Reconocimientos.pdf",
      image: "/catalog-reconocimientos.png",
      featured: false,
      categories: ["Placas", "Trofeos", "Medallas", "Reconocimientos Acrílicos"],
      icon: Award,
    },
  ]

  const digitalServices = [
    {
      title: "Catálogo Digital Interactivo",
      description: "Accede a nuestro catálogo online con búsqueda avanzada, filtros y cotización directa.",
      icon: Eye,
    },
    {
      title: "Personalización Virtual",
      description: "Visualiza cómo quedarían tus diseños en los productos antes de realizar el pedido.",
      icon: ImageIcon,
    },
    {
      title: "Lista de Precios Actualizada",
      description: "Consulta precios en tiempo real con descuentos por volumen automáticos.",
      icon: FileText,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <WhatsappButton />

      <main>
        <EditableImage
          pageSlug="catalogos"
          imageKey="banner_image"
          currentImageUrl={t("banner_image", "")}
          onSaved={refetch}
          imageLabel="Banner de Catálogos"
          altText="Catálogos 3A Branding"
        >
          <div className="relative w-full h-32 md:h-48 lg:h-64 overflow-hidden">
            {t("banner_image", "") ? (
              <Image
                src={t("banner_image", "")}
                alt="Catálogos 3A Branding"
                fill
                className="object-cover"
                priority
                unoptimized={t("banner_image", "").startsWith("http")}
              />
            ) : (
              <div className="absolute inset-0 bg-gray-200" />
            )}
          </div>
        </EditableImage>

        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <EditableText
                pageSlug="catalogos"
                contentKey="title"
                value={t("title", "Catálogos")}
                onSaved={refetch}
                label="Título"
                type="input"
              >
                <h1 className="text-4xl font-bold text-foreground mb-4">{t("title", "Catálogos")}</h1>
              </EditableText>
              <EditableText
                pageSlug="catalogos"
                contentKey="subtitle"
                value={t("subtitle", "Explora nuestros catálogos y encuentra los productos perfectos para tu marca.")}
                onSaved={refetch}
                label="Subtítulo"
                type="textarea"
              >
                <p className="text-lg text-muted-foreground">
                  {t("subtitle", "Explora nuestros catálogos y encuentra los productos perfectos para tu marca.")}
                </p>
              </EditableText>
            </div>

            {/* Catalogs Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalogs.map((catalog) => {
                return (
                  <Card key={catalog.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0">
                      <div className="relative w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                        <img
                          src={
                            catalog.image ||
                            `/placeholder.svg?height=200&width=300&query=${catalog.title.toLowerCase()}`
                          }
                          alt={catalog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg mb-2">{catalog.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-4">{catalog.description}</p>
                      <Button
                        size="sm"
                        className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white"
                        asChild
                      >
                        <a href={catalog.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
