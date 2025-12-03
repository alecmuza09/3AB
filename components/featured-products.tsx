import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, ShoppingCart, Eye } from "lucide-react"

const featuredProducts = [
  {
    id: 1,
    name: "Taza Cerámica Premium",
    description: "Taza de cerámica de alta calidad, perfecta para personalización",
    price: "$12.50",
    originalPrice: "$15.00",
    image: "/taza-cer-mica-blanca-premium.png",
    rating: 4.8,
    reviews: 124,
    category: "Drinkware",
    bestseller: true,
    colors: ["Blanco", "Negro", "Azul", "Rojo"],
  },
  {
    id: 2,
    name: "Bolígrafo Metálico Ejecutivo",
    description: "Bolígrafo de metal con grabado láser, ideal para regalos corporativos",
    price: "$8.90",
    originalPrice: null,
    image: "/bol-grafo-met-lico-ejecutivo.png",
    rating: 4.9,
    reviews: 89,
    category: "Oficina",
    bestseller: false,
    colors: ["Plateado", "Dorado", "Negro"],
  },
  {
    id: 3,
    name: "Camiseta Polo Corporativa",
    description: "Polo de algodón 100%, bordado personalizable en pecho",
    price: "$18.75",
    originalPrice: "$22.00",
    image: "/polo-corporativo-azul.png",
    rating: 4.7,
    reviews: 156,
    category: "Textiles",
    bestseller: true,
    colors: ["Azul", "Blanco", "Negro", "Gris"],
  },
  {
    id: 4,
    name: "Power Bank 10000mAh",
    description: "Cargador portátil con logo personalizable, carga rápida",
    price: "$25.00",
    originalPrice: null,
    image: "/power-bank-negro-elegante.png",
    rating: 4.6,
    reviews: 78,
    category: "Tecnología",
    bestseller: false,
    colors: ["Negro", "Blanco", "Azul"],
  },
  {
    id: 5,
    name: "Agenda Ejecutiva 2024",
    description: "Agenda de cuero sintético con grabado personalizado",
    price: "$22.50",
    originalPrice: "$28.00",
    image: "/agenda-ejecutiva-cuero-negro.png",
    rating: 4.8,
    reviews: 92,
    category: "Oficina",
    bestseller: true,
    colors: ["Negro", "Marrón", "Azul Marino"],
  },
  {
    id: 6,
    name: "Termo Acero Inoxidable",
    description: "Termo de 500ml, mantiene temperatura por 12 horas",
    price: "$16.80",
    originalPrice: null,
    image: "/placeholder.svg?height=250&width=250",
    rating: 4.9,
    reviews: 134,
    category: "Drinkware",
    bestseller: false,
    colors: ["Plateado", "Negro", "Azul", "Rojo"],
  },
]

export function FeaturedProducts() {
  return (
    <section id="productos" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <Badge className="bg-secondary/10 text-secondary">Productos Destacados</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-balance">
            Los más <span className="text-primary">populares</span> de nuestra colección
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Descubre los productos más solicitados por nuestros clientes, perfectos para cualquier campaña promocional.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 hover:bg-card"
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.bestseller && <Badge className="bg-primary text-primary-foreground">Bestseller</Badge>}
                    {product.originalPrice && <Badge className="bg-secondary text-secondary-foreground">Oferta</Badge>}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Category */}
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                      {product.category}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  </div>

                  {/* Colors */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Colores:</span>
                    <div className="flex gap-1">
                      {product.colors.slice(0, 3).map((color, index) => (
                        <div key={index} className="w-4 h-4 rounded-full border border-border bg-muted" title={color} />
                      ))}
                      {product.colors.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{product.colors.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">por unidad</span>
                    </div>

                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Cotizar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Ver Todos los Productos
          </Button>
        </div>
      </div>
    </section>
  )
}
