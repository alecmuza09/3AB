import { Sidebar } from "@/components/sidebar"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Palette, Package, Truck, HeadphonesIcon, Clock, Shield, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function ServiciosPage() {
  const services = [
    {
      icon: Palette,
      title: "Diseño y Personalización",
      description: "Creamos diseños únicos y personalizamos productos con tu marca, logo y colores corporativos.",
      features: ["Diseño gráfico profesional", "Mockups 3D", "Múltiples técnicas de marcado", "Asesoría creativa"],
    },
    {
      icon: Package,
      title: "Producción y Manufactura",
      description: "Fabricamos productos de alta calidad con los mejores materiales y procesos de producción.",
      features: [
        "Control de calidad riguroso",
        "Materiales premium",
        "Producción escalable",
        "Certificaciones internacionales",
      ],
    },
    {
      icon: Truck,
      title: "Logística y Entrega",
      description: "Manejamos toda la logística para que recibas tus productos en tiempo y forma.",
      features: ["Envíos a nivel nacional", "Tracking en tiempo real", "Empaque personalizado", "Entrega programada"],
    },
    {
      icon: HeadphonesIcon,
      title: "Atención al Cliente",
      description: "Soporte personalizado durante todo el proceso, desde la cotización hasta la entrega.",
      features: ["Asesor dedicado", "Soporte 24/7", "Seguimiento de pedidos", "Garantía de satisfacción"],
    },
  ]

  const processes = [
    {
      step: "01",
      title: "Consulta Inicial",
      description: "Analizamos tus necesidades y objetivos de marca para proponer las mejores soluciones.",
    },
    {
      step: "02",
      title: "Propuesta y Diseño",
      description: "Desarrollamos una propuesta personalizada con diseños y especificaciones detalladas.",
    },
    {
      step: "03",
      title: "Producción",
      description: "Iniciamos la producción con controles de calidad en cada etapa del proceso.",
    },
    {
      step: "04",
      title: "Entrega",
      description: "Coordinamos la entrega en los tiempos acordados con seguimiento completo.",
    },
  ]

  const benefits = [
    "Más de 10 años de experiencia en el mercado",
    "Red de proveedores certificados a nivel internacional",
    "Capacidad de producción para pedidos grandes y pequeños",
    "Tecnología de impresión y marcado de última generación",
    "Equipo de diseñadores y especialistas en branding",
    "Garantía de calidad en todos nuestros productos",
  ]

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <WhatsappButton />

      <main className="md:ml-64">
        {/* Banner */}
        <div className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3A_banners_1920x720_SERVICIOS-wGr5lGK0SzOv8Qg70q5lfvL9keA81g.png"
            alt="Nuestros Servicios - 3A Branding"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">Servicios</h1>
              <p className="text-lg text-muted-foreground">
                Ofrecemos soluciones integrales para todas tus necesidades de productos promocionales.
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <service.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                    </div>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Process Section */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl text-center mb-2">Nuestro Proceso de Trabajo</CardTitle>
                <p className="text-center text-muted-foreground">
                  Un proceso estructurado que garantiza resultados excepcionales
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  {processes.map((process, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                        {process.step}
                      </div>
                      <h3 className="font-semibold mb-2">{process.title}</h3>
                      <p className="text-sm text-muted-foreground">{process.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Benefits Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    ¿Por qué elegirnos?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-6 w-6 text-primary" />
                    Tiempos de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Productos en stock</span>
                    <Badge>3-5 días</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Personalización básica</span>
                    <Badge>7-10 días</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Producción especial</span>
                    <Badge>15-20 días</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Pedidos grandes (+1000 pzs)</span>
                    <Badge>20-30 días</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <Card className="bg-primary/5">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">¿Listo para impulsar tu marca?</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Contáctanos hoy mismo y descubre cómo podemos ayudarte a crear productos promocionales que realmente
                  conecten con tu audiencia y fortalezcan tu presencia de marca.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Solicitar Cotización
                  </Button>
                  <Button size="lg" variant="outline">
                    Agendar Consulta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
