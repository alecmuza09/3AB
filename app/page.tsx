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
        <HeroSection />
        <AIAssistantSection />
        <PromotionalBanners />
        <CategoriesSection />
        <FeaturedProducts />
        <CustomizationSection />
        <TestimonialsSection />
        <CTASection />
        <Footer />
      </main>
      <WhatsappButton />
    </div>
  )
}
