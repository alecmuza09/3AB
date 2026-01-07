import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Instagram, Linkedin, Mail, Phone, ArrowRight } from "lucide-react"

export function Footer() {
  return (
    <footer id="contacto" className="bg-foreground text-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-background/20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Mantente al día con nuestras novedades</h3>
              <p className="text-background/70">Recibe ofertas exclusivas, nuevos productos y consejos de marketing.</p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-3 rounded-lg bg-background text-foreground"
              />
              <Button className="bg-primary hover:bg-primary/90 px-6">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Image
              src="/images/3a-logo.png"
              alt="3A Branding"
              width={120}
              height={40}
              className="h-8 w-auto brightness-0 invert"
            />
            <p className="text-background/70 text-sm">
              Especialistas en productos promocionales de alta calidad. Más de 15 años ayudando a empresas a impulsar su
              marca.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/company/3abranding/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background hover:text-primary transition-colors"
              >
                <Button variant="ghost" size="sm" className="text-background hover:text-primary hover:bg-background/10">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </a>
              <a
                href="https://www.instagram.com/3a_branding/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background hover:text-primary transition-colors"
              >
                <Button variant="ghost" size="sm" className="text-background hover:text-primary hover:bg-background/10">
                  <Instagram className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Productos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Artículos de Oficina
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Textiles Corporativos
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Tazas y Termos
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Tecnología
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Regalos Corporativos
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Hogar y Cocina
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Servicios</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Personalización
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Diseño Gráfico
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Cotizaciones
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Envío Express
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Soporte 24/7
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background transition-colors">
                  Garantía
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contacto</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href="https://wa.me/525567919161" target="_blank" rel="noopener noreferrer" className="text-background/70 hover:text-background transition-colors">
                  5567919161
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:ad@3abranding.com" className="text-background/70 hover:text-background transition-colors">
                  ad@3abranding.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-primary" />
                <a href="https://www.linkedin.com/company/3abranding/" target="_blank" rel="noopener noreferrer" className="text-background/70 hover:text-background transition-colors">
                  LinkedIn
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-primary" />
                <a href="https://www.instagram.com/3a_branding/" target="_blank" rel="noopener noreferrer" className="text-background/70 hover:text-background transition-colors">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-background/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/70 text-sm">© 2024 3A Branding. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-background/70 hover:text-background transition-colors">
              Términos y Condiciones
            </a>
            <a href="#" className="text-background/70 hover:text-background transition-colors">
              Política de Privacidad
            </a>
            <a href="#" className="text-background/70 hover:text-background transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
