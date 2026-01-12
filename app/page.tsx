import { TopHeader } from "@/components/top-header"
import { HeroSection } from "@/components/hero-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { AIAssistantSection } from "@/components/ai-assistant-section"
import { CategoriesSection } from "@/components/categories-section"
import { AboutUsSection } from "@/components/about-us-section"
import { Footer } from "@/components/footer"
import { WhatsappButton } from "@/components/whatsapp-button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <TopHeader />
      <main>
        {/* Hero Section - Primera impresión */}
        <HeroSection />
        
        {/* Como Trabajamos - Proceso Simple */}
        <HowItWorksSection />
        
        {/* Asistente AI - Herramienta de ayuda */}
        <AIAssistantSection />
        
        {/* Categorías - Exploración de productos */}
        <CategoriesSection />
        
        {/* Nosotros - Sobre la empresa */}
        <AboutUsSection />
        
        {/* Footer */}
        <Footer />
      </main>
      <WhatsappButton />
    </div>
  )
}
