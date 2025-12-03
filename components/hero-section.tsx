import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star, Users, Award } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-card to-background py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-primary text-white hover:bg-primary/90">
                ✨ 100% Mexicana - Más de 10 años de experiencia
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                <span className="text-primary">Impulsa tu</span>
                <br />
                <span className="text-foreground">presencia</span>
                <br />
                <span className="text-primary">de marca</span>
              </h1>
              <p className="text-lg text-muted-foreground text-pretty max-w-xl">
                Conectamos a las marcas y empresas con sus clientes, recordándoles lo importantes que son para ellos. La
                forma más rápida y fácil de comprar promocionales con la mejor calidad a precios más bajos.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">10+ años</div>
                  <div className="text-sm text-muted-foreground">de Experiencia</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">100%</div>
                  <div className="text-sm text-muted-foreground">Mexicana</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Mejor</div>
                  <div className="text-sm text-muted-foreground">Calidad-Precio</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                ¡Compra Ahora!
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              >
                Ver Catálogo
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-primary/5 to-muted rounded-2xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-lg">
                    <img
                      src="/taza-promocional-amarilla-personalizada.png"
                      alt="Taza promocional personalizada"
                      className="w-full h-24 object-cover rounded"
                    />
                    <p className="text-sm font-medium mt-2">Tazas Promocionales</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-lg">
                    <img
                      src="/termos-met-licos-promocionales.png"
                      alt="Termos promocionales"
                      className="w-full h-24 object-cover rounded"
                    />
                    <p className="text-sm font-medium mt-2">Termos Premium</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-white rounded-lg p-4 shadow-lg">
                    <img
                      src="/productos-promocionales-salud-y-belleza.png"
                      alt="Productos de salud y belleza"
                      className="w-full h-24 object-cover rounded"
                    />
                    <p className="text-sm font-medium mt-2">Salud y Belleza</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-lg">
                    <img
                      src="/relojes-promocionales-corporativos.png"
                      alt="Relojes promocionales"
                      className="w-full h-24 object-cover rounded"
                    />
                    <p className="text-sm font-medium mt-2">Relojes</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg transform rotate-3">
                <p className="text-sm font-bold">ARTÍCULOS PROMOCIONALES</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
