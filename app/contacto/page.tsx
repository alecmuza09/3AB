"use client"

import { useState } from "react"
import { useSiteContent } from "@/hooks/use-site-content"
import { TopHeader } from "@/components/top-header"
import { Footer } from "@/components/footer"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Phone, Mail, Send, CheckCircle, Linkedin, Instagram } from "lucide-react"
import { EditableText } from "@/components/editable-text"

export default function ContactoPage() {
  const { content, refetch } = useSiteContent("contacto")
  const t = (key: string, fallback: string) => content[key] ?? fallback
  const [formData, setFormData] = useState({
    nombre: "",
    empresa: "",
    email: "",
    telefono: "",
    tipoConsulta: "",
    mensaje: "",
    acepta: false,
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar el formulario
    console.log("[v0] Form submitted:", formData)
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        nombre: "",
        empresa: "",
        email: "",
        telefono: "",
        tipoConsulta: "",
        mensaje: "",
        acepta: false,
      })
    }, 3000)
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const contactInfo = [
    {
      icon: Phone,
      title: "WhatsApp",
      details: ["5567919161"],
    },
    {
      icon: Mail,
      title: "Email para pedidos",
      details: ["ad@3abranding.com"],
    },
    {
      icon: Linkedin,
      title: "LinkedIn",
      details: ["linkedin.com/company/3abranding"],
    },
    {
      icon: Instagram,
      title: "Instagram",
      details: ["@3a_branding"],
    },
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <TopHeader />
        <WhatsappButton />

        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">{t("success_title", "¡Mensaje Enviado!")}</h2>
                <p className="text-muted-foreground mb-6">
                  {t("success_text", "Gracias por contactarnos. Hemos recibido tu mensaje y nos pondremos en contacto contigo en las próximas 24 horas.")}
                </p>
                <p className="text-sm text-muted-foreground">Redirigiendo automáticamente...</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <WhatsappButton />

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <EditableText
              pageSlug="contacto"
              contentKey="title"
              value={t("title", "Contacto")}
              onSaved={refetch}
              label="Título"
              type="input"
            >
              <h1 className="text-4xl font-bold text-foreground mb-4">{t("title", "Contacto")}</h1>
            </EditableText>
            <EditableText
              pageSlug="contacto"
              contentKey="subtitle"
              value={t("subtitle", "Estamos aquí para ayudarte. Contáctanos y descubre cómo podemos impulsar tu marca.")}
              onSaved={refetch}
              label="Subtítulo"
              type="textarea"
            >
              <p className="text-lg text-muted-foreground">
                {t("subtitle", "Estamos aquí para ayudarte. Contáctanos y descubre cómo podemos impulsar tu marca.")}
              </p>
            </EditableText>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{t("form_title", "Envíanos un mensaje")}</CardTitle>
                  <p className="text-muted-foreground">
                    {t("form_subtitle", "Completa el formulario y nos pondremos en contacto contigo lo antes posible.")}
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre completo *</Label>
                        <Input
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => handleInputChange("nombre", e.target.value)}
                          placeholder="Tu nombre completo"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="empresa">Empresa</Label>
                        <Input
                          id="empresa"
                          value={formData.empresa}
                          onChange={(e) => handleInputChange("empresa", e.target.value)}
                          placeholder="Nombre de tu empresa"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                          id="telefono"
                          value={formData.telefono}
                          onChange={(e) => handleInputChange("telefono", e.target.value)}
                          placeholder="+57 300 123 4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipoConsulta">Tipo de consulta *</Label>
                      <Select
                        value={formData.tipoConsulta}
                        onValueChange={(value) => handleInputChange("tipoConsulta", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo de consulta" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cotizacion">Solicitar cotización</SelectItem>
                          <SelectItem value="catalogo">Solicitar catálogo</SelectItem>
                          <SelectItem value="diseno">Consulta de diseño</SelectItem>
                          <SelectItem value="produccion">Consulta de producción</SelectItem>
                          <SelectItem value="soporte">Soporte técnico</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mensaje">Mensaje *</Label>
                      <Textarea
                        id="mensaje"
                        value={formData.mensaje}
                        onChange={(e) => handleInputChange("mensaje", e.target.value)}
                        placeholder="Cuéntanos sobre tu proyecto, cantidad de productos, fechas de entrega, etc."
                        rows={5}
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="acepta"
                        checked={formData.acepta}
                        onCheckedChange={(checked) => handleInputChange("acepta", checked as boolean)}
                        required
                      />
                      <Label htmlFor="acepta" className="text-sm">
                        Acepto el tratamiento de mis datos personales según la política de privacidad *
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={!formData.acepta}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar mensaje
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon
                return (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">{info.title}</h3>
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-sm text-muted-foreground">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Quick Actions */}
              <Card className="bg-primary/5">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Contacto rápido</h3>
                  <div className="space-y-3">
                    <a href="https://wa.me/525567919161" target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Phone className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                    </a>
                    <a href="mailto:ad@3abranding.com" className="block">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar email
                      </Button>
                    </a>
                    <a href="https://www.linkedin.com/company/3abranding/" target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                    </a>
                    <a href="https://www.instagram.com/3a_branding/" target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
