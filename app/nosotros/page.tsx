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
  CheckCircle,
  TrendingUp,
  Heart,
  Sparkles,
  Users,
  Leaf,
  History,
  Shield,
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
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">Nosotros</h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Somos 3A Branding, una empresa mexicana que combina creatividad, tecnología y un servicio único en el mercado para ayudarte a dar vida a tus ideas y crear conexiones que perduran.
              </p>
            </div>

            {/* Introducción Principal */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <p className="text-muted-foreground leading-relaxed mb-4 text-lg">
                  Nuestro propósito es conectar a marcas, empresas y personas con quienes más les importan, recordando su valor a través de detalles significativos.
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Con más de 10 años de experiencia en el mercado de promocionales, hemos evolucionado hasta convertirnos en la forma más fácil y accesible de comprar promocionales en México, sin dejar atrás la calidad y la atención que siempre nos han distinguido.
                </p>
              </CardContent>
            </Card>

            {/* ¿Por qué elegir 3A Branding? */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Award className="h-8 w-8 text-primary mr-3" />
                  <h2 className="text-2xl font-bold">¿Por qué elegir 3A Branding?</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  Te ofrecemos valor real en cada etapa:
                </p>
                
                {/* Corto Plazo */}
                <div className="mb-6 p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center mb-4">
                    <Zap className="h-6 w-6 text-primary mr-3" />
                    <h3 className="text-xl font-semibold">A corto plazo</h3>
                  </div>
                  <p className="text-muted-foreground mb-3 font-medium">Resultados inmediatos: procesos rápidos y automáticos que te permiten cotizar, personalizar y ordenar sin complicaciones.</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-sm">Menor tiempo de gestión</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-sm">Mejor control del presupuesto</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-sm">Mayor rotación y apoyo directo a tus ventas</span>
                    </div>
                  </div>
                </div>

                {/* Mediano Plazo */}
                <div className="mb-6 p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-6 w-6 text-primary mr-3" />
                    <h3 className="text-xl font-semibold">A mediano plazo</h3>
                  </div>
                  <p className="text-muted-foreground mb-3 font-medium">Construcción de marca: productos de calidad que generan recordación, identidad y presencia en el día a día.</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-sm">Mayor reconocimiento</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-sm">Mensajes consistentes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-sm">Experiencias memorables</span>
                    </div>
                  </div>
                </div>

                {/* Largo Plazo */}
                <div className="p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center mb-4">
                    <Heart className="h-6 w-6 text-primary mr-3" />
                    <h3 className="text-xl font-semibold">A largo plazo</h3>
                  </div>
                  <p className="text-muted-foreground mb-3 font-medium">Relaciones que perduran: los promocionales adecuados fortalecen la lealtad, el vínculo emocional y las recomendaciones genuinas.</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-sm">Más fidelidad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-sm">Más recomendaciones</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-sm">Más conexión con las personas</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Con 3A Branding obtienes */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Sparkles className="h-8 w-8 text-primary mr-3" />
                  <h2 className="text-2xl font-bold">Con 3A Branding obtienes:</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">Compra 100% digital con cotización y visualización automática y asistida por IA.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">Flexibilidad total, desde 1 pieza hasta miles.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">Opciones sustentables para marcas responsables.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">Atención humana cuando la necesitas, sin perder eficiencia.</span>
                  </div>
                  <div className="flex items-start gap-3 md:col-span-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">Más de 10 años de experiencia trabajando con marcas, equipos y personas en todo México.</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nuestra Historia */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <History className="h-8 w-8 text-primary mr-3" />
                  <h2 className="text-2xl font-bold">Nuestra historia</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    3A Branding nació en 2015 con un objetivo claro: ofrecer al mercado de artículos promocionales una propuesta basada en calidad, innovación y un servicio realmente orientado al cliente. Desde el inicio, la empresa ha trabajado para diferenciarse a través de soluciones creativas, procesos eficientes y una atención cercana que responda a las necesidades reales de marcas y organizaciones.
                  </p>
                  <p>
                    A lo largo de estos años, 3A Branding ha consolidado relaciones con empresas de diversos sectores, creciendo junto a ellas y adaptándose a un entorno cada vez más dinámico. Esta evolución constante ha sido posible gracias a una lectura profunda del mercado y a la búsqueda permanente de nuevas formas de simplificar y mejorar la experiencia del cliente.
                  </p>
                  <p>
                    Hoy, con más de una década de trayectoria, 3A Branding se distingue por combinar tecnología, creatividad y servicio en cada proyecto, manteniendo el mismo enfoque que los ha guiado desde el primer día: entregar soluciones de alto valor, de manera ágil, clara y accesible.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Nuestro Propósito */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Target className="h-8 w-8 text-primary mr-3" />
                  <h2 className="text-2xl font-bold">Nuestro propósito</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  3A Branding nace para crear conexiones. Ayudamos a que marcas, empresas y personas comuniquen su esencia a través de soluciones que generan cercanía, emoción y recuerdo. Nuestro propósito es entender lo que cada cliente quiere transmitir y convertirlo en experiencias que conectan de verdad.
                </p>
              </CardContent>
            </Card>

            {/* Nuestro Compromiso */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Shield className="h-8 w-8 text-primary mr-3" />
                  <h2 className="text-2xl font-bold">Nuestro compromiso</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    En 3A Branding trabajamos con un compromiso que guía cada decisión: entregar excelencia en todo lo que hacemos. Nuestro enfoque está en ofrecer soluciones claras, confiables y alineadas a las necesidades reales de nuestros clientes, con la transparencia y cercanía que nos caracteriza.
                  </p>
                  <p>
                    También entendemos el impacto que nuestra industria puede generar en el entorno. Como parte de nuestro compromiso, impulsamos prácticas sostenibles, promovemos alternativas responsables y buscamos continuamente opciones que permitan a nuestros clientes elegir productos con menor impacto ambiental. Nuestro objetivo es avanzar hacia un modelo de negocio que sea rentable, consciente y sostenible.
                  </p>
                  <p className="font-semibold text-foreground pt-4">
                    En 3A Branding, nuestro compromiso es simple y firme: calidad, transparencia, confianza y responsabilidad con nuestros clientes y con el entorno.
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
