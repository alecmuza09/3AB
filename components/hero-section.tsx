import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Award, Star, ShoppingBag, Calculator, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-6">
              <div className="flex justify-center lg:justify-start">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-medium">
                  ✨ 100% Mexicana - Más de 10 años de experiencia
                </Badge>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance leading-tight tracking-tight">
                <span className="text-foreground">La forma más fácil de comprar</span>
                <br />
                <span className="text-primary">promocionales personalizados</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Dale vida a tus ideas con 3A Branding. Cotiza, personaliza, visualiza y ordena de manera automática, 
                con la calidad, el precio y la atención que necesitas.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 lg:gap-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">+10 años</div>
                  <div className="text-sm text-muted-foreground">de experiencia</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">100%</div>
                  <div className="text-sm text-muted-foreground">mexicana</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Star className="h-5 w-5 text-primary fill-primary" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">Mejor</div>
                  <div className="text-sm text-muted-foreground">calidad-precio</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/productos" className="flex-1 sm:flex-initial">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Explorar productos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/cotizaciones" className="flex-1 sm:flex-initial">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent transition-all duration-300"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Cotizar ahora
                </Button>
              </Link>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
              <Link href="/asistente">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/5"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Asistente IA
                </Button>
              </Link>
              <Link href="/servicios">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/5"
                >
                  Cómo funciona
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative hidden lg:block">
            <div className="relative bg-gradient-to-br from-primary/5 via-muted/30 to-primary/5 rounded-3xl p-8 lg:p-12 shadow-2xl border border-primary/10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img
                      src="/taza-promocional-amarilla-personalizada.png"
                      alt="Taza promocional personalizada"
                      className="w-full h-28 object-cover rounded-lg"
                    />
                    <p className="text-sm font-semibold mt-3 text-center">Tazas Promocionales</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img
                      src="/termos-met-licos-promocionales.png"
                      alt="Termos promocionales"
                      className="w-full h-28 object-cover rounded-lg"
                    />
                    <p className="text-sm font-semibold mt-3 text-center">Termos Premium</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img
                      src="/productos-promocionales-salud-y-belleza.png"
                      alt="Productos de salud y belleza"
                      className="w-full h-28 object-cover rounded-lg"
                    />
                    <p className="text-sm font-semibold mt-3 text-center">Salud y Belleza</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img
                      src="/relojes-promocionales-corporativos.png"
                      alt="Relojes promocionales"
                      className="w-full h-28 object-cover rounded-lg"
                    />
                    <p className="text-sm font-semibold mt-3 text-center">Relojes</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-5 py-3 rounded-xl shadow-xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <p className="text-sm font-bold">ARTÍCULOS PROMOCIONALES</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
