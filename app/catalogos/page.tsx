import { Sidebar } from "@/components/sidebar"
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

export default function CatalogosPage() {
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
      <Sidebar />
      <WhatsappButton />

      <main className="md:ml-64">
        <div className="relative w-full h-32 md:h-48 lg:h-64 overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3A_banners_1920x720_CATALOGOS-rG2mR0uYlwK1bFLO7gxvbiOV9hUI6a.png"
            alt="Catálogos 3A Branding"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">Catálogos</h1>
              <p className="text-lg text-muted-foreground">
                Explora nuestros catálogos especializados de 3A Branding y encuentra los productos perfectos para tu
                marca.
              </p>
            </div>

            {/* Featured Catalog */}
            {catalogs
              .filter((catalog) => catalog.featured)
              .map((catalog) => {
                const IconComponent = catalog.icon
                return (
                  <Card key={catalog.id} className="mb-8 border-primary/20 bg-primary/5">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-primary">Destacado</Badge>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </div>
                      <div className="grid md:grid-cols-3 gap-6 items-center">
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-3 mb-3">
                            <IconComponent className="h-8 w-8 text-primary" />
                            <h2 className="text-2xl font-bold">{catalog.title}</h2>
                          </div>
                          <p className="text-muted-foreground mb-4">{catalog.description}</p>
                          <div className="flex gap-3">
                            <Button
                              className="bg-primary hover:bg-primary/90"
                              asChild
                            >
                              <a href={catalog.pdfUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                Descargar PDF
                              </a>
                            </Button>
                            <Button variant="outline" asChild>
                              <a href={catalog.pdfUrl} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Online
                              </a>
                            </Button>
                          </div>
                        </div>
                        <div className="relative">
                          <img
                            src={
                              catalog.image ||
                              "/placeholder.svg?height=300&width=200&query=catalog cover chamarras corporativas" ||
                              "/placeholder.svg"
                            }
                            alt={catalog.title}
                            className="w-full h-64 object-cover rounded-lg shadow-lg"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

            {/* Other Catalogs */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {catalogs
                .filter((catalog) => !catalog.featured)
                .map((catalog) => {
                  const IconComponent = catalog.icon
                  return (
                    <Card key={catalog.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="p-0">
                        <img
                          src={
                            catalog.image ||
                            `/placeholder.svg?height=200&width=300&query=${catalog.title.toLowerCase()}`
                          }
                          alt={catalog.title}
                          className="w-full h-40 object-cover rounded-t-lg"
                        />
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{catalog.title}</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{catalog.description}</p>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {catalog.categories.slice(0, 2).map((category, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {catalog.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{catalog.categories.length - 2}
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1" asChild>
                            <a href={catalog.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3 w-3 mr-1" />
                              Descargar
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a href={catalog.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>

            {/* Digital Services */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Servicios Digitales</CardTitle>
                <p className="text-muted-foreground">
                  Aprovecha nuestras herramientas digitales para una mejor experiencia de compra.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {digitalServices.map((service, index) => {
                    const IconComponent = service.icon
                    return (
                      <div key={index} className="text-center p-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">{service.title}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card className="bg-primary/5">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">¿Necesitas un catálogo personalizado?</h2>
                <p className="text-muted-foreground mb-6">
                  Podemos crear un catálogo específico para tu industria o necesidades particulares.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Solicitar Catálogo Personalizado
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
