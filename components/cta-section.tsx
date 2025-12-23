import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Phone, Mail, MessageCircle, Clock, Shield, Truck } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <div className="text-center space-y-8 mb-16">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5">¡Comienza Ahora!</Badge>
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-5xl font-bold text-balance">
              ¿Listo para <span className="text-primary">impulsar</span> tu marca?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Obtén una cotización personalizada en menos de 24 horas. Nuestro equipo de expertos te ayudará a encontrar
              los productos perfectos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
              Solicitar Cotización Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              Ver Catálogo Completo
            </Button>
          </div>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-0 bg-card/50 hover:bg-card transition-colors text-center">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Llámanos</h3>
                <p className="text-sm text-muted-foreground mb-3">Habla directamente con nuestros asesores</p>
                <Button variant="outline" size="sm">
                  +1 (555) 123-4567
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 hover:bg-card transition-colors text-center">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto">
                <Mail className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Escríbenos</h3>
                <p className="text-sm text-muted-foreground mb-3">Envíanos tu consulta por email</p>
                <Button variant="outline" size="sm">
                  ventas@3abranding.com
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 hover:bg-card transition-colors text-center">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                <MessageCircle className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Chat en Vivo</h3>
                <p className="text-sm text-muted-foreground mb-3">Chatea con nosotros en tiempo real</p>
                <Button variant="outline" size="sm">
                  Iniciar Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-2">Entrega Rápida</h4>
              <p className="text-sm text-muted-foreground">
                Producción y entrega en 7-10 días hábiles. Servicio express disponible.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h4 className="font-semibold mb-2">Garantía de Calidad</h4>
              <p className="text-sm text-muted-foreground">
                100% garantía en todos nuestros productos. Si no estás satisfecho, te devolvemos tu dinero.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Truck className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold mb-2">Envío Gratuito</h4>
              <p className="text-sm text-muted-foreground">
                Envío gratis en pedidos mayores a $500. Cobertura nacional e internacional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
