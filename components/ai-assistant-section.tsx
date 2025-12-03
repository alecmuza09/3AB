"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, MessageCircle, Sparkles, ArrowRight, Zap, Target, Users } from "lucide-react"
import Link from "next/link"

export function AIAssistantSection() {
  const [isHovered, setIsHovered] = useState(false)

  const features = [
    {
      icon: Target,
      title: "Recomendaciones Personalizadas",
      description: "Te ayudo a elegir los productos perfectos para tu evento específico",
    },
    {
      icon: Users,
      title: "Análisis de Audiencia",
      description: "Considero el tipo de evento y número de asistentes para mejores sugerencias",
    },
    {
      icon: Zap,
      title: "Respuestas Instantáneas",
      description: "Obtén cotizaciones y recomendaciones en tiempo real",
    },
  ]

  return (
    <section className="py-16 px-6 bg-gradient-to-br from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Main CTA Card */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            Nuevo: Asistente IA
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">¿No sabes qué productos elegir?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Nuestro asistente de inteligencia artificial te guía paso a paso para encontrar los productos promocionales
            perfectos para tu evento o empresa.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* AI Assistant Preview */}
          <Card
            className="relative overflow-hidden border-2 border-primary/20 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:border-primary/40"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardHeader className="relative">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-primary rounded-full">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Asistente 3A Branding</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">En línea</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                {/* Sample conversation */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Bot className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm font-medium mb-1">Asistente IA</p>
                      <p className="text-sm text-muted-foreground">
                        ¡Hola! Soy parte del equipo de 3A Branding 😊 Cuéntame, ¿qué tipo de evento tienes en mente?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 rounded-lg p-4 ml-8">
                  <p className="text-sm text-muted-foreground mb-1">Tú</p>
                  <p className="text-sm">Una conferencia empresarial para 200 personas</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Bot className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm font-medium mb-1">Asistente IA</p>
                      <p className="text-sm text-muted-foreground">
                        ¡Súper! Para una conferencia de ese tamaño, podríamos ir con libretas ejecutivas, bolígrafos premium y termos personalizados. Se ven bien y la gente los usa.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`mt-6 transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-70 translate-y-2"}`}
              >
                <Link href="/asistente">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Iniciar Conversación
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">¿Cómo te ayuda nuestro asistente?</h3>
              <p className="text-muted-foreground mb-6">
                Utilizamos inteligencia artificial avanzada para entender tus necesidades específicas y recomendarte los
                productos más adecuados.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="pt-4">
              <Link href="/asistente">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Probar Asistente IA
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
