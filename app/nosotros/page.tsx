import { Sidebar } from "@/components/sidebar"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  Eye,
  Award,
  Lightbulb,
  Clock,
  Globe,
  Truck,
  Recycle,
  ShoppingCart,
  Zap,
  Gift,
  Building,
} from "lucide-react"
import Image from "next/image"

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <WhatsappButton />

      <main className="md:ml-64">
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3A_banners_1920x720_nosotros-WznuT9mn7xdXXoRlIIIyEgsYihr7QF.png"
            alt="Quiénes Somos - 3A Branding, más de 10 años de experiencia, empresa 100% mexicana"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">Nosotros</h1>
              <p className="text-lg text-muted-foreground">
                3A Branding - Marca registrada y certificada 100% mexicana con más de 10 años de experiencia.
              </p>
            </div>

            {/* Propósito */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 text-primary mr-3" />
                  <h2 className="text-2xl font-bold">Nuestro Propósito</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  3A Branding es una marca registrada y certificada 100% mexicana con más de 10 años de experiencia
                  donde ofrecemos no solo los mejores productos promocionales, sino también un servicio integral 360°
                  desde el concepto creativo hasta la ejecución para potenciar el valor de tu marca.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Nuestro objetivo: elevar tu experiencia como cliente, brindándote soluciones integrales, creativas y
                  de alta calidad para que tu marca destaque en cada detalle. Combinamos lo mejor de dos mundos para
                  ofrecerte productos promocionales únicos y presentaciones impactantes en cualquier tipo de evento.
                </p>
              </CardContent>
            </Card>

            {/* ¿Por qué 3A Branding? */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Award className="h-8 w-8 text-primary mr-3" />
                  <h2 className="text-2xl font-bold">¿Por qué 3A Branding?</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-6 w-6 text-primary" />
                      <span className="font-medium">Compra 100% digital</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-6 w-6 text-primary" />
                      <span className="font-medium">Ahorro de tiempo</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="h-6 w-6 text-primary" />
                      <span className="font-medium">Elige y compra a tu medida</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Eye className="h-6 w-6 text-primary" />
                      <span className="font-medium">Variedad de productos y servicios</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Award className="h-6 w-6 text-primary" />
                      <span className="font-medium">Calidad a precios bajos</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Truck className="h-6 w-6 text-primary" />
                      <span className="font-medium">Entrega a todo el país</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Recycle className="h-6 w-6 text-primary" />
                      <span className="font-medium">Productos reciclables y sustentables</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-6 w-6 text-primary" />
                      <span className="font-medium">Experiencia de más de 10 años</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nuestros Servicios */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Gift className="h-6 w-6 text-primary mr-3" />
                    <h3 className="text-xl font-semibold">Artículos Promocionales</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span>• Bolígrafos</span>
                    <span>• Bolsas</span>
                    <span>• Gorras</span>
                    <span>• Tazas</span>
                    <span>• Termos</span>
                    <span>• Playeras</span>
                    <span>• Mochilas</span>
                    <span>• USB</span>
                    <span>• Relojes</span>
                    <span>• Tarjetas</span>
                    <span>• Folders</span>
                    <span>• Pines</span>
                    <span>• Placas</span>
                    <span>• Vasos</span>
                    <span>• Reconocimientos</span>
                    <span>• Y más...</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Building className="h-6 w-6 text-primary mr-3" />
                    <h3 className="text-xl font-semibold">Stands y Eventos</h3>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Display, exhibición y escenografía corporativa</p>
                    <p>• Espacios temporales (stands, pabellones, escenarios)</p>
                    <p>• Eventos y expos (MKT, multimedia, congresos)</p>
                    <p>• Ingeniería y prototipos (modelados 3D, diseño)</p>
                    <p>• Arquitectura efímera</p>
                    <p>• Producción multisensorial</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Técnicas de Personalización */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Lightbulb className="h-8 w-8 text-primary mr-3" />
                  <h2 className="text-2xl font-bold">Técnicas de Personalización</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2 text-sm">
                    <Badge variant="outline">Serigrafía y tampografía</Badge>
                    <Badge variant="outline">Impresión digital y offset</Badge>
                    <Badge variant="outline">Sublimado</Badge>
                    <Badge variant="outline">Recorte de vinil</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <Badge variant="outline">Grabado</Badge>
                    <Badge variant="outline">Hot stamping</Badge>
                    <Badge variant="outline">Grabado láser</Badge>
                    <Badge variant="outline">Grabado en sand blast</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <Badge variant="outline">Bordado</Badge>
                    <Badge variant="outline">Relieve sobre tela o piel</Badge>
                    <Badge variant="outline">Resinado</Badge>
                    <Badge variant="outline">Arte en PVC</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promesa de Servicio */}
            <Card>
              <CardContent className="p-8 bg-primary/5">
                <h2 className="text-2xl font-bold mb-4 text-center">Nuestra Experiencia</h2>
                <p className="text-center text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  Orquestamos eventos corporativos y empresariales públicos o privados, deportivos y experiencias de
                  alto nivel. Transformamos espacios en escenarios inmersivos que cautivan la experiencia de cada
                  asistente elevando la presencia de marca y consolidando su impacto en la audiencia.
                </p>
                <div className="text-center mt-6">
                  <p className="text-lg font-semibold text-primary">
                    Tenemos todo lo que necesitas, no dudes en contactarnos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
