"use client"

import { useState } from "react"
import { TopHeader } from "@/components/top-header"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Palette,
  Package,
  Truck,
  HeadphonesIcon,
  Clock,
  Shield,
  CheckCircle,
  Zap,
  Users,
  Star,
  TrendingUp,
  Award,
  Sparkles,
  Lightbulb,
  Target,
  Rocket,
  Briefcase,
  Building2,
  GraduationCap,
  Heart,
  ShoppingBag,
  Gift,
  Printer,
  Scissors,
  Paintbrush,
  Scan,
  Layers,
  ArrowRight,
  CheckCheck,
  ThumbsUp,
  MessageSquare,
} from "lucide-react"
import Image from "next/image"

export default function ServiciosPage() {
  const [activeTab, setActiveTab] = useState("design")

  const mainServices = [
    {
      icon: Palette,
      title: "Diseño y Personalización",
      description: "Creamos diseños únicos que reflejan la esencia de tu marca con profesionalismo y creatividad.",
      features: [
        "Diseño gráfico profesional a medida",
        "Mockups 3D realistas pre-producción",
        "Múltiples técnicas de marcado",
        "Asesoría creativa personalizada",
        "Adaptación de logotipos y branding",
      ],
      color: "from-primary to-red-600",
    },
    {
      icon: Package,
      title: "Producción y Manufactura",
      description: "Fabricamos productos de alta calidad con los mejores materiales y procesos certificados.",
      features: [
        "Control de calidad riguroso en cada etapa",
        "Materiales premium certificados",
        "Producción escalable de 1 a 100,000+ piezas",
        "Certificaciones internacionales ISO",
        "Tiempos de entrega garantizados",
      ],
      color: "from-gray-700 to-gray-900",
    },
    {
      icon: Truck,
      title: "Logística y Entrega",
      description: "Manejamos toda la logística para que recibas tus productos en tiempo y forma, donde los necesites.",
      features: [
        "Envíos a nivel nacional e internacional",
        "Tracking en tiempo real",
        "Empaque personalizado premium",
        "Entrega programada para eventos",
        "Coordinación de entregas múltiples",
      ],
      color: "from-red-600 to-primary",
    },
    {
      icon: HeadphonesIcon,
      title: "Atención al Cliente",
      description: "Soporte personalizado y especializado durante todo el proceso de tu proyecto.",
      features: [
        "Asesor dedicado a tu cuenta",
        "Soporte continuo vía WhatsApp",
        "Seguimiento detallado de pedidos",
        "Garantía de satisfacción 100%",
        "Atención post-venta profesional",
      ],
      color: "from-gray-600 to-gray-800",
    },
  ]

  const customizationTechniques = [
    {
      id: "serigrafía",
      name: "Serigrafía",
      icon: Printer,
      description: "Técnica de impresión versátil ideal para grandes volúmenes con colores sólidos y vibrantes.",
      benefits: ["Alta durabilidad", "Colores brillantes", "Costo-efectivo para volumen", "Múltiples superficies"],
      idealFor: ["Textiles", "Playeras", "Bolsas", "Superficies planas"],
      image: "/placeholder.svg?text=Serigrafía",
    },
    {
      id: "bordado",
      name: "Bordado",
      icon: Scissors,
      description: "Personalización premium con hilo de alta calidad que aporta elegancia y profesionalismo.",
      benefits: ["Aspecto premium", "Muy durable", "Resistente a lavados", "Textura 3D distintiva"],
      idealFor: ["Gorras", "Polos", "Chamarras", "Uniformes corporativos"],
      image: "/placeholder.svg?text=Bordado",
    },
    {
      id: "tampografia",
      name: "Tampografía",
      icon: Paintbrush,
      description: "Impresión indirecta perfecta para superficies irregulares y objetos tridimensionales.",
      benefits: ["Superficies irregulares", "Alta precisión", "Secado rápido", "Excelente definición"],
      idealFor: ["Bolígrafos", "USB", "Artículos curvos", "Productos pequeños"],
      image: "/placeholder.svg?text=Tampografía",
    },
    {
      id: "laser",
      name: "Grabado Láser",
      icon: Zap,
      description: "Personalización permanente y elegante mediante tecnología láser de última generación.",
      benefits: ["Permanente", "Alta precisión", "Sin desgaste", "Aspecto sofisticado"],
      idealFor: ["Metal", "Madera", "Cuero", "Acrílico", "Cristal"],
      image: "/placeholder.svg?text=Láser",
    },
    {
      id: "sublimacion",
      name: "Sublimación",
      icon: Layers,
      description: "Impresión fotográfica de alta calidad con colores vibrantes y duraderos.",
      benefits: ["Colores ilimitados", "Calidad fotográfica", "Sin relieves", "Muy durable"],
      idealFor: ["Tazas", "Playeras claras", "Textiles poliéster", "Productos blancos"],
      image: "/placeholder.svg?text=Sublimación",
    },
  ]

  const industries = [
    { icon: Building2, name: "Corporativo", description: "Soluciones para empresas y oficinas" },
    { icon: GraduationCap, name: "Educación", description: "Instituciones educativas y universidades" },
    { icon: Heart, name: "Salud", description: "Hospitales, clínicas y sector médico" },
    { icon: ShoppingBag, name: "Retail", description: "Comercios y puntos de venta" },
    { icon: Briefcase, name: "Eventos", description: "Ferias, exposiciones y conferencias" },
    { icon: Gift, name: "Promocional", description: "Campañas publicitarias y marketing" },
  ]

  const stats = [
    { number: "10+", label: "Años de experiencia", icon: Award },
    { number: "5,000+", label: "Proyectos completados", icon: CheckCheck },
    { number: "98%", label: "Clientes satisfechos", icon: ThumbsUp },
    { number: "24/7", label: "Soporte disponible", icon: MessageSquare },
  ]

  const processes = [
    {
      step: "01",
      title: "Consulta y Análisis",
      description: "Entendemos tus necesidades, objetivos de marca y presupuesto para crear la estrategia perfecta.",
      icon: Lightbulb,
    },
    {
      step: "02",
      title: "Propuesta y Diseño",
      description: "Desarrollamos propuestas creativas con mockups realistas y cotización detallada.",
      icon: Paintbrush,
    },
    {
      step: "03",
      title: "Aprobación y Producción",
      description: "Revisamos arte final contigo y comenzamos producción con controles de calidad rigurosos.",
      icon: CheckCircle,
    },
    {
      step: "04",
      title: "Entrega y Seguimiento",
      description: "Coordinamos entrega puntual y brindamos soporte post-venta para garantizar tu satisfacción.",
      icon: Rocket,
    },
  ]

  const faqs = [
    {
      question: "¿Cuál es el pedido mínimo?",
      answer:
        "Trabajamos con pedidos desde 1 pieza hasta más de 100,000. Sin embargo, algunos productos tienen cantidades mínimas específicas dependiendo de la técnica de personalización. Nuestro equipo te asesorará sobre la mejor opción para tu proyecto.",
    },
    {
      question: "¿Cuánto tiempo toma la producción?",
      answer:
        "Los tiempos varían según el tipo de producto y personalización: productos en stock 3-5 días, personalización básica 7-10 días, producción especial 15-20 días, y pedidos grandes 20-30 días. Ofrecemos servicio express con cargos adicionales.",
    },
    {
      question: "¿Ofrecen diseño gráfico?",
      answer:
        "Sí, contamos con un equipo de diseñadores profesionales. Si tienes tu diseño, lo adaptamos sin costo. Si necesitas crear uno desde cero, ofrecemos servicio de diseño profesional con múltiples propuestas y revisiones incluidas.",
    },
    {
      question: "¿Qué técnicas de personalización recomiendan?",
      answer:
        "Depende del material, cantidad y presupuesto. Serigrafía para textiles en volumen, bordado para acabado premium, tampografía para objetos pequeños, grabado láser para acabado elegante, y sublimación para diseños a todo color. Nuestro equipo te asesorará sin compromiso.",
    },
    {
      question: "¿Hacen envíos a toda la República?",
      answer:
        "Sí, enviamos a todo México y también internacionalmente. Trabajamos con paqueterías confiables y ofrecemos seguimiento en tiempo real. También puedes recoger en nuestras instalaciones en CDMX para ahorrar en envío.",
    },
    {
      question: "¿Ofrecen muestras antes de producir?",
      answer:
        "Sí, para pedidos grandes podemos producir muestras físicas previo a la producción completa. También proporcionamos mockups digitales 3D realistas sin costo para que visualices el resultado final antes de aprobar.",
    },
  ]

  const testimonials = [
    {
      name: "María González",
      company: "Tech Innovations",
      role: "Directora de Marketing",
      comment:
        "Excelente servicio de principio a fin. Los productos llegaron justo a tiempo para nuestro evento y la calidad superó nuestras expectativas.",
      rating: 5,
    },
    {
      name: "Carlos Ramírez",
      company: "Grupo Empresarial",
      role: "Gerente de Compras",
      comment:
        "Llevamos 3 años trabajando con 3A Branding. Su atención personalizada y cumplimiento en tiempos de entrega es impecable.",
      rating: 5,
    },
    {
      name: "Ana Martínez",
      company: "Startup Digital",
      role: "CEO",
      comment:
        "Nos ayudaron a crear productos promocionales que realmente representan nuestra marca. El equipo de diseño es muy profesional.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <WhatsappButton />

      <main>
        {/* Hero Banner */}
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3A_banners_1920x720_SERVICIOS-wGr5lGK0SzOv8Qg70q5lfvL9keA81g.png"
            alt="Nuestros Servicios - 3A Branding"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-3xl text-white">
                <Badge className="mb-4 bg-primary">Soluciones Integrales</Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                  Servicios que Transforman tu Marca
                </h1>
                <p className="text-lg md:text-xl mb-6 text-gray-200">
                  Desde el diseño hasta la entrega, manejamos cada detalle de tu proyecto con excelencia y dedicación.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Solicitar Cotización
                  </Button>
                  <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white">
                    <Target className="h-5 w-5 mr-2" />
                    Ver Catálogos
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-16">
            {/* Stats Section */}
            <section>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
                    <CardContent className="pt-6">
                      <div className="inline-flex p-3 bg-primary/10 rounded-full mb-3">
                        <stat.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.number}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Main Services */}
            <section>
              <div className="text-center mb-12">
                <Badge className="mb-4">Nuestros Servicios</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Soluciones Completas para tu Marca</h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Ofrecemos un servicio integral que cubre todas las necesidades de tu proyecto, desde la conceptualización
                  hasta la entrega final.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {mainServices.map((service, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-xl transition-all hover:-translate-y-1 border-2 hover:border-primary/50"
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${service.color}`}>
                          <service.icon className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                          <CardDescription className="text-base">{service.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Customization Techniques */}
            <section className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 rounded-3xl p-8 md:p-12">
              <div className="text-center mb-12">
                <Badge className="mb-4">Técnicas de Personalización</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Tecnología de Vanguardia para Resultados Perfectos
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Contamos con las mejores técnicas y equipos profesionales para personalizar tus productos con la máxima
                  calidad.
                </p>
              </div>

              <Tabs defaultValue="serigrafía" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-8 h-auto gap-2">
                  {customizationTechniques.map((technique) => (
                    <TabsTrigger
                      key={technique.id}
                      value={technique.id}
                      className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      <technique.icon className="h-4 w-4 mr-2" />
                      {technique.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {customizationTechniques.map((technique) => (
                  <TabsContent key={technique.id} value={technique.id}>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid md:grid-cols-2 gap-8">
                          <div>
                            <h3 className="text-2xl font-bold mb-4">{technique.name}</h3>
                            <p className="text-muted-foreground mb-6">{technique.description}</p>

                            <div className="space-y-6">
                              <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Star className="h-5 w-5 text-primary" />
                              Beneficios
                            </h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {technique.benefits.map((benefit, idx) => (
                                    <Badge key={idx} variant="outline" className="justify-start">
                                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                      {benefit}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Target className="h-5 w-5 text-primary" />
                                  Ideal Para
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {technique.idealFor.map((item, idx) => (
                                    <Badge key={idx} className="bg-primary">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="relative h-64 md:h-full bg-muted rounded-lg overflow-hidden">
                            <img
                              src={technique.image}
                              alt={technique.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </section>

            {/* Process Section */}
            <section>
              <div className="text-center mb-12">
                <Badge className="mb-4">Nuestro Proceso</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Cómo Trabajamos Contigo</h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Un proceso estructurado y transparente que garantiza resultados excepcionales en cada proyecto.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {processes.map((process, index) => (
                  <Card
                    key={index}
                    className="relative hover:shadow-lg transition-all hover:-translate-y-2 border-t-4 border-t-primary"
                  >
                    <CardContent className="pt-8">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                          {process.step}
                        </div>
                      </div>
                      <div className="text-center mt-4">
                        <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
                          <process.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">{process.title}</h3>
                        <p className="text-sm text-muted-foreground">{process.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Industries Section */}
            <section>
              <div className="text-center mb-12">
                <Badge className="mb-4">Industrias que Atendemos</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Experiencia en Múltiples Sectores</h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Brindamos soluciones especializadas para diferentes industrias, adaptándonos a las necesidades únicas de
                  cada sector.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {industries.map((industry, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-all hover:-translate-y-2 hover:border-primary/50 cursor-pointer text-center"
                  >
                    <CardContent className="pt-6">
                      <div className="inline-flex p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl mb-3">
                        <industry.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{industry.name}</h3>
                      <p className="text-xs text-muted-foreground">{industry.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Testimonials */}
            <section className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 rounded-3xl p-8 md:p-12">
              <div className="text-center mb-12">
                <Badge className="mb-4">Testimonios</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Lo Que Dicen Nuestros Clientes</h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  La satisfacción de nuestros clientes es nuestro mayor logro. Conoce sus experiencias trabajando con
                  nosotros.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="hover:shadow-xl transition-all">
                    <CardContent className="pt-6">
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4 italic">"{testimonial.comment}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* FAQs */}
            <section>
              <div className="text-center mb-12">
                <Badge className="mb-4">Preguntas Frecuentes</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Tienes Dudas?</h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Respondemos las preguntas más comunes sobre nuestros servicios y procesos.
                </p>
              </div>

              <Card className="max-w-4xl mx-auto">
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left font-semibold hover:text-primary">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </section>

            {/* CTA Section */}
            <section>
              <Card className="bg-gradient-to-br from-primary to-red-700 text-white border-0 shadow-2xl">
                <CardContent className="p-12 text-center">
                  <Sparkles className="h-16 w-16 mx-auto mb-6" />
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para Impulsar tu Marca?</h2>
                  <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                    Contáctanos hoy mismo y descubre cómo podemos ayudarte a crear productos promocionales que realmente
                    conecten con tu audiencia y fortalezcan tu presencia de marca.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90 font-semibold"
                    >
                      <Rocket className="h-5 w-5 mr-2" />
                      Solicitar Cotización Ahora
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      <Clock className="h-5 w-5 mr-2" />
                      Agendar Consulta Gratis
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-8 mt-8 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Sin compromiso</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Respuesta en 24hrs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Asesoría profesional</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
