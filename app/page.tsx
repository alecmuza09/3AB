import { Sidebar } from "@/components/sidebar"
import { HeroSection } from "@/components/hero-section"
import { CategoriesSection } from "@/components/categories-section"
import { FeaturedProducts } from "@/components/featured-products"
import { CustomizationSection } from "@/components/customization-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { WhatsappButton } from "@/components/whatsapp-button"
import { AIAssistantSection } from "@/components/ai-assistant-section"
import { PromotionalBanners } from "@/components/promotional-banners"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-64">
        {/* Hero Section - Primera impresión */}
        <HeroSection />
        
        {/* Promotional Banners - Mantener interés después del hero */}
        <div className="border-t border-border/50">
          <PromotionalBanners />
        </div>
        
        {/* Categories - Exploración de productos */}
        <div className="border-t border-border/50">
          <CategoriesSection />
        </div>
        
        {/* Featured Products - Productos destacados */}
        <div className="border-t border-border/50">
          <FeaturedProducts />
        </div>
        
        {/* AI Assistant - Herramienta de ayuda */}
        <div className="border-t border-border/50">
          <AIAssistantSection />
        </div>
        
        {/* Customization - Personalización */}
        <div className="border-t border-border/50">
          <CustomizationSection />
        </div>
        
        {/* Testimonials - Construcción de confianza */}
        <div className="border-t border-border/50">
          <TestimonialsSection />
        </div>
        
        {/* CTA - Llamada a la acción final */}
        <div className="border-t border-border/50">
          <CTASection />
        </div>
        
        {/* Footer */}
        <Footer />
      </main>
      <WhatsappButton />
    </div>
  )
}
