import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Coffee,
  Shirt,
  Briefcase,
  Gift,
  Smartphone,
  Utensils,
  ArrowRight,
  ShoppingBag,
  Calendar,
  Dumbbell,
  Leaf,
  FolderOpen,
  Award as IdCard,
  Crown,
  Backpack,
  Pin,
  Award,
  Shirt as TShirt,
  Pen,
  Frame,
  Trophy,
  Watch,
  Heart,
  CreditCard,
  Thermometer,
  Usb,
  Wine,
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

export function CategoriesSection() {
  return (
    <section id="categorias" className="py-20 lg:py-24 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5">Explora Nuestras Categorías</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-balance">
            Encuentra el producto perfecto para tu <span className="text-primary">marca</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Descubre nuestra amplia selección de productos promocionales organizados por categorías para facilitar tu
            búsqueda.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((category) => {
            const IconComponent = category.icon
            return (
              <Card
                key={category.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-card/50 hover:bg-card"
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {category.popular && (
                      <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">Popular</Badge>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {category.productCount}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{category.description}</p>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      Ver Productos
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
          >
            Ver Todas las Categorías
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
