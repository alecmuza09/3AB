"use client"

import { useSiteContent } from "@/hooks/use-site-content"
import { TopHeader } from "@/components/top-header"
import { Footer } from "@/components/footer"
import { WhatsappButton } from "@/components/whatsapp-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  Eye,
  Award,
  Lightbulb,
  Clock,
  Globe,
  Truck,
  Recycle,
  ShoppingCart,
  Zap,
  Gift,
  Building,
  CheckCircle,
  TrendingUp,
  Heart,
  Sparkles,
  Users,
  Leaf,
  History,
  Shield,
} from "lucide-react"
import Image from "next/image"
import { EditableImage } from "@/components/editable-image"
import { EditableText } from "@/components/editable-text"
import { EditableBlock } from "@/components/editable-block"

function parseFeatures(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseList(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function NosotrosPage() {
  const { content, refetch } = useSiteContent("nosotros")
  const t = (key: string, fallback: string) => content[key] ?? fallback

  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <WhatsappButton />

      <main>
        <EditableImage
          pageSlug="nosotros"
          imageKey="banner_image"
          currentImageUrl={t("banner_image", "")}
          onSaved={refetch}
          imageLabel="Banner de Nosotros"
          altText="Quiénes Somos - 3A Branding"
        >
          <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
            {t("banner_image", "") ? (
              <Image
                src={t("banner_image", "")}
                alt="Quiénes Somos - 3A Branding"
                fill
                className="object-cover object-center"
                priority
                unoptimized={t("banner_image", "").startsWith("http")}
              />
            ) : (
              <div className="absolute inset-0 bg-gray-200" />
            )}
          </div>
        </EditableImage>

        <div className="p-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
              <EditableText
                pageSlug="nosotros"
                contentKey="title"
                value={t("title", "Nosotros")}
                onSaved={refetch}
                label="Título"
                type="input"
              >
                <h1 className="text-4xl font-bold text-foreground mb-4">{t("title", "Nosotros")}</h1>
              </EditableText>
              <EditableText
                pageSlug="nosotros"
                contentKey="subtitle"
                value={t("subtitle", "Somos 3A Branding, una empresa mexicana que combina creatividad, tecnología y un servicio único en el mercado para ayudarte a dar vida a tus ideas y crear conexiones que perduran.")}
                onSaved={refetch}
                label="Subtítulo"
                type="textarea"
              >
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  {t("subtitle", "Somos 3A Branding, una empresa mexicana que combina creatividad, tecnología y un servicio único en el mercado para ayudarte a dar vida a tus ideas y crear conexiones que perduran.")}
                </p>
              </EditableText>
            </div>

            {/* Introducción Principal */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <EditableText
                  pageSlug="nosotros"
                  contentKey="intro_p1"
                  value={t("intro_p1", "Nuestro propósito es conectar a marcas, empresas y personas con quienes más les importan, recordando su valor a través de detalles significativos.")}
                  onSaved={refetch}
                  label="Introducción Párrafo 1"
                  type="textarea"
                >
                  <p className="text-muted-foreground leading-relaxed mb-4 text-lg">
                    {t("intro_p1", "Nuestro propósito es conectar a marcas, empresas y personas con quienes más les importan, recordando su valor a través de detalles significativos.")}
                  </p>
                </EditableText>
                <EditableText
                  pageSlug="nosotros"
                  contentKey="intro_p2"
                  value={t("intro_p2", "Con más de 10 años de experiencia en el mercado de promocionales, hemos evolucionado hasta convertirnos en la forma más fácil y accesible de comprar promocionales en México, sin dejar atrás la calidad y la atención que siempre nos han distinguido.")}
                  onSaved={refetch}
                  label="Introducción Párrafo 2"
                  type="textarea"
                >
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {t("intro_p2", "Con más de 10 años de experiencia en el mercado de promocionales, hemos evolucionado hasta convertirnos en la forma más fácil y accesible de comprar promocionales en México, sin dejar atrás la calidad y la atención que siempre nos han distinguido.")}
                  </p>
                </EditableText>
              </CardContent>
            </Card>

            {/* ¿Por qué elegir 3A Branding? */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Award className="h-8 w-8 text-primary mr-3" />
                  <EditableText
                    pageSlug="nosotros"
                    contentKey="why_title"
                    value={t("why_title", "¿Por qué elegir 3A Branding?")}
                    onSaved={refetch}
                    label="Por qué Título"
                    type="input"
                  >
                    <h2 className="text-2xl font-bold">{t("why_title", "¿Por qué elegir 3A Branding?")}</h2>
                  </EditableText>
                </div>
                <EditableText
                  pageSlug="nosotros"
                  contentKey="why_intro"
                  value={t("why_intro", "Te ofrecemos valor real en cada etapa:")}
                  onSaved={refetch}
                  label="Por qué Intro"
                  type="input"
                >
                  <p className="text-muted-foreground mb-6">
                    {t("why_intro", "Te ofrecemos valor real en cada etapa:")}
                  </p>
                </EditableText>
                
                {/* Corto Plazo */}
                <EditableBlock
                  pageSlug="nosotros"
                  keys={{
                    title: "why_short_title",
                    description: "why_short_desc",
                    features: "why_short_features"
                  }}
                  title={t("why_short_title", "A corto plazo")}
                  description={t("why_short_desc", "Resultados inmediatos: procesos rápidos y automáticos que te permiten cotizar, personalizar y ordenar sin complicaciones.")}
                  features={parseFeatures(t("why_short_features", "Menor tiempo de gestión\nMejor control del presupuesto\nMayor rotación y apoyo directo a tus ventas"))}
                  onSaved={refetch}
                  blockLabel="Corto Plazo"
                >
                  <div className="mb-6 p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
                    <div className="flex items-center mb-4">
                      <Zap className="h-6 w-6 text-primary mr-3" />
                      <h3 className="text-xl font-semibold">{t("why_short_title", "A corto plazo")}</h3>
                    </div>
                    <p className="text-muted-foreground mb-3 font-medium">{t("why_short_desc", "Resultados inmediatos: procesos rápidos y automáticos que te permiten cotizar, personalizar y ordenar sin complicaciones.")}</p>
                    <div className="space-y-2">
                      {parseFeatures(t("why_short_features", "Menor tiempo de gestión\nMejor control del presupuesto\nMayor rotación y apoyo directo a tus ventas")).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </EditableBlock>

                {/* Mediano Plazo */}
                <EditableBlock
                  pageSlug="nosotros"
                  keys={{
                    title: "why_medium_title",
                    description: "why_medium_desc",
                    features: "why_medium_features"
                  }}
                  title={t("why_medium_title", "A mediano plazo")}
                  description={t("why_medium_desc", "Construcción de marca: productos de calidad que generan recordación, identidad y presencia en el día a día.")}
                  features={parseFeatures(t("why_medium_features", "Mayor reconocimiento\nMensajes consistentes\nExperiencias memorables"))}
                  onSaved={refetch}
                  blockLabel="Mediano Plazo"
                >
                  <div className="mb-6 p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
                    <div className="flex items-center mb-4">
                      <TrendingUp className="h-6 w-6 text-primary mr-3" />
                      <h3 className="text-xl font-semibold">{t("why_medium_title", "A mediano plazo")}</h3>
                    </div>
                    <p className="text-muted-foreground mb-3 font-medium">{t("why_medium_desc", "Construcción de marca: productos de calidad que generan recordación, identidad y presencia en el día a día.")}</p>
                    <div className="space-y-2">
                      {parseFeatures(t("why_medium_features", "Mayor reconocimiento\nMensajes consistentes\nExperiencias memorables")).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </EditableBlock>

                {/* Largo Plazo */}
                <EditableBlock
                  pageSlug="nosotros"
                  keys={{
                    title: "why_long_title",
                    description: "why_long_desc",
                    features: "why_long_features"
                  }}
                  title={t("why_long_title", "A largo plazo")}
                  description={t("why_long_desc", "Relaciones que perduran: los promocionales adecuados fortalecen la lealtad, el vínculo emocional y las recomendaciones genuinas.")}
                  features={parseFeatures(t("why_long_features", "Más fidelidad\nMás recomendaciones\nMás conexión con las personas"))}
                  onSaved={refetch}
                  blockLabel="Largo Plazo"
                >
                  <div className="p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
                    <div className="flex items-center mb-4">
                      <Heart className="h-6 w-6 text-primary mr-3" />
                      <h3 className="text-xl font-semibold">{t("why_long_title", "A largo plazo")}</h3>
                    </div>
                    <p className="text-muted-foreground mb-3 font-medium">{t("why_long_desc", "Relaciones que perduran: los promocionales adecuados fortalecen la lealtad, el vínculo emocional y las recomendaciones genuinas.")}</p>
                    <div className="space-y-2">
                      {parseFeatures(t("why_long_features", "Más fidelidad\nMás recomendaciones\nMás conexión con las personas")).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </EditableBlock>
              </CardContent>
            </Card>

            {/* Con 3A Branding obtienes */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Sparkles className="h-8 w-8 text-primary mr-3" />
                  <EditableText
                    pageSlug="nosotros"
                    contentKey="benefits_title"
                    value={t("benefits_title", "Con 3A Branding obtienes:")}
                    onSaved={refetch}
                    label="Beneficios Título"
                    type="input"
                  >
                    <h2 className="text-2xl font-bold">{t("benefits_title", "Con 3A Branding obtienes:")}</h2>
                  </EditableText>
                </div>
                <EditableText
                  pageSlug="nosotros"
                  contentKey="benefits_list"
                  value={t("benefits_list", "Compra 100% digital con cotización y visualización automática y asistida por IA.\nFlexibilidad total, desde 1 pieza hasta miles.\nOpciones sustentables para marcas responsables.\nAtención humana cuando la necesitas, sin perder eficiencia.\nMás de 10 años de experiencia trabajando con marcas, equipos y personas en todo México.")}
                  onSaved={refetch}
                  label="Lista de Beneficios (una por línea)"
                  type="textarea"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    {parseList(t("benefits_list", "Compra 100% digital con cotización y visualización automática y asistida por IA.\nFlexibilidad total, desde 1 pieza hasta miles.\nOpciones sustentables para marcas responsables.\nAtención humana cuando la necesitas, sin perder eficiencia.\nMás de 10 años de experiencia trabajando con marcas, equipos y personas en todo México.")).map((benefit, idx, arr) => (
                      <div key={idx} className={`flex items-start gap-3 ${idx === arr.length - 1 ? 'md:col-span-2' : ''}`}>
                        <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </EditableText>
              </CardContent>
            </Card>

            {/* Nuestra Historia */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <History className="h-8 w-8 text-primary mr-3" />
                  <EditableText
                    pageSlug="nosotros"
                    contentKey="history_title"
                    value={t("history_title", "Nuestra historia")}
                    onSaved={refetch}
                    label="Historia Título"
                    type="input"
                  >
                    <h2 className="text-2xl font-bold">{t("history_title", "Nuestra historia")}</h2>
                  </EditableText>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <EditableText
                    pageSlug="nosotros"
                    contentKey="history_p1"
                    value={t("history_p1", "3A Branding nació en 2015 con un objetivo claro: ofrecer al mercado de artículos promocionales una propuesta basada en calidad, innovación y un servicio realmente orientado al cliente. Desde el inicio, la empresa ha trabajado para diferenciarse a través de soluciones creativas, procesos eficientes y una atención cercana que responda a las necesidades reales de marcas y organizaciones.")}
                    onSaved={refetch}
                    label="Historia Párrafo 1"
                    type="textarea"
                  >
                    <p>{t("history_p1", "3A Branding nació en 2015 con un objetivo claro: ofrecer al mercado de artículos promocionales una propuesta basada en calidad, innovación y un servicio realmente orientado al cliente. Desde el inicio, la empresa ha trabajado para diferenciarse a través de soluciones creativas, procesos eficientes y una atención cercana que responda a las necesidades reales de marcas y organizaciones.")}</p>
                  </EditableText>
                  <EditableText
                    pageSlug="nosotros"
                    contentKey="history_p2"
                    value={t("history_p2", "A lo largo de estos años, 3A Branding ha consolidado relaciones con empresas de diversos sectores, creciendo junto a ellas y adaptándose a un entorno cada vez más dinámico. Esta evolución constante ha sido posible gracias a una lectura profunda del mercado y a la búsqueda permanente de nuevas formas de simplificar y mejorar la experiencia del cliente.")}
                    onSaved={refetch}
                    label="Historia Párrafo 2"
                    type="textarea"
                  >
                    <p>{t("history_p2", "A lo largo de estos años, 3A Branding ha consolidado relaciones con empresas de diversos sectores, creciendo junto a ellas y adaptándose a un entorno cada vez más dinámico. Esta evolución constante ha sido posible gracias a una lectura profunda del mercado y a la búsqueda permanente de nuevas formas de simplificar y mejorar la experiencia del cliente.")}</p>
                  </EditableText>
                  <EditableText
                    pageSlug="nosotros"
                    contentKey="history_p3"
                    value={t("history_p3", "Hoy, con más de una década de trayectoria, 3A Branding se distingue por combinar tecnología, creatividad y servicio en cada proyecto, manteniendo el mismo enfoque que los ha guiado desde el primer día: entregar soluciones de alto valor, de manera ágil, clara y accesible.")}
                    onSaved={refetch}
                    label="Historia Párrafo 3"
                    type="textarea"
                  >
                    <p>{t("history_p3", "Hoy, con más de una década de trayectoria, 3A Branding se distingue por combinar tecnología, creatividad y servicio en cada proyecto, manteniendo el mismo enfoque que los ha guiado desde el primer día: entregar soluciones de alto valor, de manera ágil, clara y accesible.")}</p>
                  </EditableText>
                </div>
              </CardContent>
            </Card>

            {/* Nuestro Propósito */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Target className="h-8 w-8 text-primary mr-3" />
                  <EditableText
                    pageSlug="nosotros"
                    contentKey="purpose_title"
                    value={t("purpose_title", "Nuestro propósito")}
                    onSaved={refetch}
                    label="Propósito Título"
                    type="input"
                  >
                    <h2 className="text-2xl font-bold">{t("purpose_title", "Nuestro propósito")}</h2>
                  </EditableText>
                </div>
                <EditableText
                  pageSlug="nosotros"
                  contentKey="purpose_text"
                  value={t("purpose_text", "3A Branding nace para crear conexiones. Ayudamos a que marcas, empresas y personas comuniquen su esencia a través de soluciones que generan cercanía, emoción y recuerdo. Nuestro propósito es entender lo que cada cliente quiere transmitir y convertirlo en experiencias que conectan de verdad.")}
                  onSaved={refetch}
                  label="Propósito Texto"
                  type="textarea"
                >
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {t("purpose_text", "3A Branding nace para crear conexiones. Ayudamos a que marcas, empresas y personas comuniquen su esencia a través de soluciones que generan cercanía, emoción y recuerdo. Nuestro propósito es entender lo que cada cliente quiere transmitir y convertirlo en experiencias que conectan de verdad.")}
                  </p>
                </EditableText>
              </CardContent>
            </Card>

            {/* Nuestro Compromiso */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Shield className="h-8 w-8 text-primary mr-3" />
                  <EditableText
                    pageSlug="nosotros"
                    contentKey="commitment_title"
                    value={t("commitment_title", "Nuestro compromiso")}
                    onSaved={refetch}
                    label="Compromiso Título"
                    type="input"
                  >
                    <h2 className="text-2xl font-bold">{t("commitment_title", "Nuestro compromiso")}</h2>
                  </EditableText>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <EditableText
                    pageSlug="nosotros"
                    contentKey="commitment_p1"
                    value={t("commitment_p1", "En 3A Branding trabajamos con un compromiso que guía cada decisión: entregar excelencia en todo lo que hacemos. Nuestro enfoque está en ofrecer soluciones claras, confiables y alineadas a las necesidades reales de nuestros clientes, con la transparencia y cercanía que nos caracteriza.")}
                    onSaved={refetch}
                    label="Compromiso Párrafo 1"
                    type="textarea"
                  >
                    <p>{t("commitment_p1", "En 3A Branding trabajamos con un compromiso que guía cada decisión: entregar excelencia en todo lo que hacemos. Nuestro enfoque está en ofrecer soluciones claras, confiables y alineadas a las necesidades reales de nuestros clientes, con la transparencia y cercanía que nos caracteriza.")}</p>
                  </EditableText>
                  <EditableText
                    pageSlug="nosotros"
                    contentKey="commitment_p2"
                    value={t("commitment_p2", "También entendemos el impacto que nuestra industria puede generar en el entorno. Como parte de nuestro compromiso, impulsamos prácticas sostenibles, promovemos alternativas responsables y buscamos continuamente opciones que permitan a nuestros clientes elegir productos con menor impacto ambiental. Nuestro objetivo es avanzar hacia un modelo de negocio que sea rentable, consciente y sostenible.")}
                    onSaved={refetch}
                    label="Compromiso Párrafo 2"
                    type="textarea"
                  >
                    <p>{t("commitment_p2", "También entendemos el impacto que nuestra industria puede generar en el entorno. Como parte de nuestro compromiso, impulsamos prácticas sostenibles, promovemos alternativas responsables y buscamos continuamente opciones que permitan a nuestros clientes elegir productos con menor impacto ambiental. Nuestro objetivo es avanzar hacia un modelo de negocio que sea rentable, consciente y sostenible.")}</p>
                  </EditableText>
                  <EditableText
                    pageSlug="nosotros"
                    contentKey="commitment_p3"
                    value={t("commitment_p3", "En 3A Branding, nuestro compromiso es simple y firme: calidad, transparencia, confianza y responsabilidad con nuestros clientes y con el entorno.")}
                    onSaved={refetch}
                    label="Compromiso Párrafo 3"
                    type="input"
                  >
                    <p className="font-semibold text-foreground pt-4">
                      {t("commitment_p3", "En 3A Branding, nuestro compromiso es simple y firme: calidad, transparencia, confianza y responsabilidad con nuestros clientes y con el entorno.")}
                    </p>
                  </EditableText>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
