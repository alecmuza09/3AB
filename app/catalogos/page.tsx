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
      title: "Catálogo de Chamarras",
      description: "Chamarras corporativas y promocionales de alta calidad con opciones de personalización completa.",
      pages: 45,
      products: "200+",
      size: "12 MB",
      image: "/catalog-chamarras.png",
      featured: true,
      categories: ["Chamarras Ejecutivas", "Chamarras Deportivas", "Chamarras de Seguridad"],
      icon: Shirt,
    },
    {
      id: 2,
      title: "Catálogo de Uniformes",
      description:
        "Uniformes corporativos, médicos, industriales y de servicios con bordado y serigrafía personalizada.",
      pages: 60,
      products: "350+",
      size: "18 MB",
      image: "/catalog-uniformes.png",
      featured: false,
      categories: ["Uniformes Médicos", "Uniformes Corporativos", "Uniformes Industriales"],
      icon: Shirt,
    },
    {
      id: 3,
      title: "Catálogo de Reconocimientos",
      description:
        "Placas, trofeos, medallas y reconocimientos personalizados para eventos corporativos y premiaciones.",
      pages: 35,
      products: "180+",
      size: "8 MB",
      image: "/catalog-reconocimientos.png",
      featured: false,
      categories: ["Placas", "Trofeos", "Medallas", "Reconocimientos Acrílicos"],
      icon: Award,
    },
    {
      id: 4,
      title: "Catálogo de Stands",
      description: "Stands modulares, displays y estructuras para eventos, ferias y exposiciones corporativas.",
      pages: 40,
      products: "120+",
      size: "15 MB",
      image: "/catalog-stands.png",
      featured: false,
      categories: ["Stands Modulares", "Displays", "Estructuras Portátiles"],
      icon: Building,
    },
    {
      id: 5,
      title: "Catálogo de Seguridad",
      description: "Equipos de protección personal, señalética de seguridad y productos para seguridad industrial.",
      pages: 50,
      products: "280+",
      size: "14 MB",
      image: "/catalog-seguridad.png",
      featured: false,
      categories: ["EPP", "Señalética", "Seguridad Industrial"],
      icon: Shield,
    },
    {
      id: 6,
      title: "Catálogo de Mobiliario",
      description: "Mobiliario corporativo, sillas ejecutivas, escritorios y muebles para oficina personalizables.",
      pages: 55,
      products: "150+",
      size: "20 MB",
      image: "/catalog-mobiliario.png",
      featured: false,
      categories: ["Sillas Ejecutivas", "Escritorios", "Muebles de Oficina"],
      icon: Sofa,
    },
    {
      id: 7,
      title: "Catálogo Promocionales Varios",
      description: "Amplia variedad de productos promocionales: bolígrafos, tazas, USB, llaveros y artículos diversos.",
      pages: 80,
      products: "500+",
      size: "25 MB",
      image: "/catalog-promocionales.png",
      featured: false,
      categories: ["Escritura", "Tecnología", "Hogar", "Accesorios"],
      icon: Gift,
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
                          <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{catalog.pages} páginas</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{catalog.products} productos</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Download className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{catalog.size}</span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button className="bg-primary hover:bg-primary/90">
                              <Download className="h-4 w-4 mr-2" />
                              Descargar PDF
                            </Button>
                            <Button variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Online
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

                        <div className="flex justify-between text-xs text-muted-foreground mb-3">
                          <span>{catalog.pages} páginas</span>
                          <span>{catalog.products} productos</span>
                          <span>{catalog.size}</span>
                        </div>

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
                          <Button size="sm" className="flex-1">
                            <Download className="h-3 w-3 mr-1" />
                            Descargar
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
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
