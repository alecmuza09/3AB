import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "María González",
    company: "Tech Solutions S.A.",
    position: "Directora de Marketing",
    content:
      "Excelente calidad en todos los productos. El servicio de personalización es increíble y los tiempos de entrega siempre se cumplen. Definitivamente nuestra primera opción para productos promocionales.",
    rating: 5,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 2,
    name: "Carlos Mendoza",
    company: "Innovate Corp",
    position: "Gerente General",
    content:
      "Llevamos 3 años trabajando con 3A Branding y siempre superan nuestras expectativas. La atención personalizada y la calidad de los productos hacen la diferencia.",
    rating: 5,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 3,
    name: "Ana Rodríguez",
    company: "StartUp Hub",
    position: "Coordinadora de Eventos",
    content:
      "Perfectos para nuestros eventos corporativos. Los productos siempre llegan a tiempo y con la calidad esperada. El equipo es muy profesional y atento a los detalles.",
    rating: 5,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 4,
    name: "Roberto Silva",
    company: "Global Enterprises",
    position: "Director Comercial",
    content:
      "La variedad de productos y opciones de personalización es impresionante. Siempre encontramos lo que necesitamos para nuestras campañas promocionales.",
    rating: 5,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 5,
    name: "Laura Jiménez",
    company: "Creative Agency",
    position: "Account Manager",
    content:
      "El configurador online es fantástico, nos permite mostrar a nuestros clientes cómo quedarán sus productos antes de producirlos. Muy recomendado.",
    rating: 5,
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 6,
    name: "Diego Morales",
    company: "Retail Plus",
    position: "Jefe de Compras",
    content:
      "Precios competitivos y excelente relación calidad-precio. El servicio post-venta es excepcional, siempre están disponibles para resolver cualquier duda.",
    rating: 5,
    image: "/placeholder.svg?height=60&width=60",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <Badge className="bg-accent/10 text-accent">Testimonios de Clientes</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-balance">
            Lo que dicen nuestros <span className="text-primary">clientes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Más de 5,000 empresas confían en nosotros para sus productos promocionales. Descubre por qué somos su
            primera opción.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary">5,000+</div>
            <div className="text-sm text-muted-foreground">Clientes Satisfechos</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-secondary">4.9/5</div>
            <div className="text-sm text-muted-foreground">Calificación Promedio</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-accent">98%</div>
            <div className="text-sm text-muted-foreground">Entregas a Tiempo</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary">15</div>
            <div className="text-sm text-muted-foreground">Años de Experiencia</div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-0 bg-card/50 hover:bg-card transition-colors">
              <CardContent className="p-6 space-y-4">
                {/* Quote Icon */}
                <div className="flex justify-between items-start">
                  <Quote className="h-8 w-8 text-primary/20" />
                  <div className="flex items-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <p className="text-muted-foreground text-sm leading-relaxed">"{testimonial.content}"</p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.position}</div>
                    <div className="text-xs text-primary font-medium">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-8">Empresas que confían en nosotros</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {[
              "/placeholder.svg?height=40&width=120",
              "/placeholder.svg?height=40&width=120",
              "/placeholder.svg?height=40&width=120",
              "/placeholder.svg?height=40&width=120",
              "/placeholder.svg?height=40&width=120",
            ].map((src, index) => (
              <img
                key={index}
                src={src || "/placeholder.svg"}
                alt={`Cliente ${index + 1}`}
                className="h-8 w-auto grayscale hover:grayscale-0 transition-all"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
