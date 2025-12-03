"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WhatsappButton() {
  const handleWhatsAppClick = () => {
    // Replace with actual WhatsApp number
    const phoneNumber = "5215512345678" // Example Mexican number
    const message = "Hola, me interesa conocer más sobre sus productos promocionales"
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300 p-0"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-white" />
    </Button>
  )
}
