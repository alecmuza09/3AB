"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, Zap, Target, MessageCircle } from "lucide-react"
import Link from "next/link"

export function AIAssistantSection() {
  const features = [
    {
      icon: Target,
      title: "Análisis de necesidades",
      description: "Comprende tu evento o proyecto para recomendarte los productos ideales.",
    },
    {
      icon: MessageCircle,
      title: "Respuestas instantáneas",
      description: "Obtén recomendaciones personalizadas en segundos, 24/7.",
    },
    {
      icon: Zap,
      title: "Decisiones más rápidas",
      description: "Reduce el tiempo de selección con sugerencias inteligentes.",
    },
  ]

  return (
    <section className="py-20 lg:py-24 bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div>
              <Badge className="bg-[#DC2626] text-white border-0 px-3 py-1.5 text-xs font-medium">
                <Zap className="h-3 w-3 mr-1" />
                Inteligencia Artificial
              </Badge>
            </div>

            {/* Headline */}
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              ¿No sabes qué productos elegir?{" "}
              <span className="text-[#DC2626]">Te ayudamos</span>
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-300 leading-relaxed">
              Nuestro asistente de inteligencia artificial te acompaña paso a paso para identificar los productos promocionales más adecuados, comprendiendo tus necesidades específicas.
            </p>

            {/* Features */}
            <div className="grid gap-6 pt-4">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="p-3 bg-[#DC2626] rounded-full flex-shrink-0">
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link href="/asistente">
                <Button size="lg" className="bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg px-8">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Probar Asistente IA
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Chat Interface */}
          <div className="relative">
            <Card className="bg-white rounded-2xl shadow-2xl border-0 overflow-hidden">
              <CardContent className="p-0">
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#DC2626] rounded-full">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Asistente 3A Branding</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-gray-500">En línea</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-4 bg-gray-50 min-h-[300px]">
                  {/* Assistant Message 1 */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <Sparkles className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-200 rounded-lg px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-gray-800">
                        ¡Hola! Soy parte del equipo de 3A Branding. Cuéntame, ¿qué tipo de evento tienes en mente?
                      </p>
                    </div>
                  </div>

                  {/* User Message */}
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-[#DC2626] rounded-lg px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-white">
                        Tenemos una conferencia para 200 personas
                      </p>
                    </div>
                  </div>

                  {/* Assistant Message 2 */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <Sparkles className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-200 rounded-lg px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-gray-800">
                        ¡Perfecto! Para una conferencia te recomiendo: bolígrafos premium, termos personalizados y libretas ejecutivas. ¿Te gustaría ver opciones?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 px-4 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#DC2626] text-sm"
                      readOnly
                    />
                    <Button
                      size="sm"
                      className="bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-full p-2 h-10 w-10"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
