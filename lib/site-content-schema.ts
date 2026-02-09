/**
 * Schema del CMS: páginas y secciones editables con valores por defecto.
 * Añade aquí nuevas páginas o keys para que aparezcan en el admin.
 */
export type ContentType = "text" | "image" | "html"

export interface SiteContentField {
  key: string
  label: string
  type: ContentType
  default: string
  placeholder?: string
  hint?: string
}

export interface PageSchema {
  slug: string
  name: string
  fields: SiteContentField[]
}

/** Definición de todas las secciones editables por página */
export const SITE_CONTENT_SCHEMA: PageSchema[] = [
  {
    slug: "home",
    name: "Inicio",
    fields: [
      { key: "hero_badge", label: "Badge del hero", type: "text", default: "Artículos Promocionales con IA" },
      { key: "hero_title_line1", label: "Título hero (línea 1)", type: "text", default: "La forma más fácil de comprar" },
      { key: "hero_title_line2", label: "Título hero (línea 2)", type: "text", default: "promocionales" },
      { key: "hero_subtitle", label: "Subtítulo hero", type: "text", default: "Conectamos marcas, personas y momentos. Cotiza, personaliza y ordena de manera automática con la calidad y el precio que necesitas." },
      { key: "hero_image", label: "Imagen principal hero (URL)", type: "image", default: "/placeholder.svg?height=500&width=600", placeholder: "https://..." },
      { key: "hero_cta_primary", label: "Texto botón principal", type: "text", default: "Explorar productos" },
      { key: "hero_cta_secondary", label: "Texto botón secundario", type: "text", default: "Personalizar ahora" },
      { key: "hero_social_proof", label: "Prueba social (ej. empresas)", type: "text", default: "1K 2K 3K 4K +4,000 empresas confían en nosotros" },
      { key: "hero_badge_250", label: "Badge 250+ productos", type: "text", default: "250+ Productos" },
      { key: "hero_badge_ia", label: "Badge asistente IA", type: "text", default: "Asistente IA Disponible 24/7" },
      { key: "about_badge", label: "Badge sección nosotros", type: "text", default: "Nosotros" },
      { key: "about_title", label: "Título sección nosotros", type: "text", default: "Tu aliado en marketing promocional" },
      { key: "about_subtitle", label: "Subtítulo sección nosotros", type: "text", default: "Somos una empresa 100% mexicana con más de 10 años conectando marcas con personas a través de artículos promocionales de calidad." },
      { key: "about_stat1_value", label: "Estadística 1 valor", type: "text", default: "+10" },
      { key: "about_stat1_label", label: "Estadística 1 etiqueta", type: "text", default: "Años de experiencia" },
      { key: "about_stat2_value", label: "Estadística 2 valor", type: "text", default: "4K+" },
      { key: "about_stat2_label", label: "Estadística 2 etiqueta", type: "text", default: "Clientes satisfechos" },
      { key: "about_stat3_value", label: "Estadística 3 valor", type: "text", default: "100%" },
      { key: "about_stat3_label", label: "Estadística 3 etiqueta", type: "text", default: "Empresa mexicana" },
      { key: "about_stat4_value", label: "Estadística 4 valor", type: "text", default: "250+" },
      { key: "about_stat4_label", label: "Estadística 4 etiqueta", type: "text", default: "Productos disponibles" },
      { key: "about_feature1_title", label: "Característica 1 título", type: "text", default: "Calidad Premium" },
      { key: "about_feature1_desc", label: "Característica 1 descripción", type: "text", default: "Trabajamos solo con proveedores certificados para garantizar productos de primera." },
      { key: "about_feature2_title", label: "Característica 2 título", type: "text", default: "Atención Personalizada" },
      { key: "about_feature2_desc", label: "Característica 2 descripción", type: "text", default: "Cada cliente es único. Nos adaptamos a tus necesidades específicas." },
      { key: "about_feature3_title", label: "Característica 3 título", type: "text", default: "Innovación Constante" },
      { key: "about_feature3_desc", label: "Característica 3 descripción", type: "text", default: "Integramos tecnología de punta como IA para mejorar tu experiencia." },
      { key: "how_badge", label: "Badge proceso", type: "text", default: "Proceso Simple" },
      { key: "how_title", label: "Título proceso", type: "text", default: "Elige, diseña y ordena promocionales de forma simple" },
      { key: "how_subtitle", label: "Subtítulo proceso", type: "text", default: "En solo 3 pasos tendrás tus artículos personalizados listos para entregar" },
      { key: "how_step1_title", label: "Paso 1 título", type: "text", default: "Elige tu producto" },
      { key: "how_step1_desc", label: "Paso 1 descripción", type: "text", default: "Explora el catálogo y encuentra la opción ideal para tu marca, tu equipo o tu proyecto." },
      { key: "how_step2_title", label: "Paso 2 título", type: "text", default: "Diseña y personaliza" },
      { key: "how_step2_desc", label: "Paso 2 descripción", type: "text", default: "Ajusta colores, impresión o bordado y visualiza cómo se verá tu diseño antes de producirlo." },
      { key: "how_step3_title", label: "Paso 3 título", type: "text", default: "Ordena y recibe" },
      { key: "how_step3_desc", label: "Paso 3 descripción", type: "text", default: "Define cantidades, confirma tu pedido y recibe tus promocionales donde los necesites." },
    ],
  },
  {
    slug: "nosotros",
    name: "Nosotros",
    fields: [
      { key: "banner_image", label: "Imagen banner (URL)", type: "image", default: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3A_banners_1920x720_nosotros-WznuT9mn7xdXXoRlIIIyEgsYihr7QF.png" },
      { key: "title", label: "Título principal", type: "text", default: "Nosotros" },
      { key: "subtitle", label: "Subtítulo", type: "text", default: "Somos 3A Branding, una empresa mexicana que combina creatividad, tecnología y un servicio único en el mercado para ayudarte a dar vida a tus ideas y crear conexiones que perduran." },
      { key: "intro_p1", label: "Párrafo intro 1", type: "html", default: "Nuestro propósito es conectar a marcas, empresas y personas con quienes más les importan, recordando su valor a través de detalles significativos." },
      { key: "intro_p2", label: "Párrafo intro 2", type: "html", default: "Con más de 10 años de experiencia en el mercado de promocionales, hemos evolucionado hasta convertirnos en la forma más fácil y accesible de comprar promocionales en México, sin dejar atrás la calidad y la atención que siempre nos han distinguido." },
      { key: "why_title", label: "Título ¿Por qué elegirnos?", type: "text", default: "¿Por qué elegir 3A Branding?" },
    ],
  },
  {
    slug: "productos",
    name: "Productos",
    fields: [
      { key: "banner_image", label: "Imagen banner (URL)", type: "image", default: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3A_banners_1920x720_PRODUCTOS-eD68qdAhB00ubdTk4yOphghZ7XgISO.png" },
      { key: "title", label: "Título", type: "text", default: "Catálogo de Productos" },
      { key: "subtitle", label: "Subtítulo", type: "text", default: "Productos promocionales personalizables de alta calidad." },
    ],
  },
  {
    slug: "servicios",
    name: "Servicios",
    fields: [
      { key: "banner_image", label: "Imagen banner (URL)", type: "image", default: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3A_banners_1920x720_SERVICIOS-wGr5lGK0SzOv8Qg70q5lfvL9keA81g.png" },
      { key: "hero_badge", label: "Badge del hero", type: "text", default: "Soluciones Integrales" },
      { key: "hero_title", label: "Título del hero", type: "text", default: "Servicios que Transforman tu Marca" },
      { key: "hero_subtitle", label: "Subtítulo del hero", type: "text", default: "Desde el diseño hasta la entrega, manejamos cada detalle de tu proyecto con excelencia y dedicación." },
      { key: "title", label: "Título principal (sección)", type: "text", default: "Servicios" },
      { key: "subtitle", label: "Subtítulo (sección)", type: "text", default: "Soluciones integrales para impulsar tu marca." },
      { key: "service1_title", label: "Bloque 1: Título", type: "text", default: "Diseño y Personalización" },
      { key: "service1_description", label: "Bloque 1: Descripción", type: "text", default: "Creamos diseños únicos que reflejan la esencia de tu marca con profesionalismo y creatividad." },
      { key: "service1_features", label: "Bloque 1: Lista (una por línea)", type: "html", default: "Diseño gráfico profesional a medida\nMockups 3D realistas pre-producción\nMúltiples técnicas de marcado\nAsesoría creativa personalizada\nAdaptación de logotipos y branding" },
      { key: "service2_title", label: "Bloque 2: Título", type: "text", default: "Producción y Manufactura" },
      { key: "service2_description", label: "Bloque 2: Descripción", type: "text", default: "Fabricamos productos de alta calidad con los mejores materiales y procesos certificados." },
      { key: "service2_features", label: "Bloque 2: Lista (una por línea)", type: "html", default: "Control de calidad riguroso en cada etapa\nMateriales premium certificados\nProducción escalable de 1 a 100,000+ piezas\nCertificaciones internacionales ISO\nTiempos de entrega garantizados" },
      { key: "service3_title", label: "Bloque 3: Título", type: "text", default: "Logística y Entrega" },
      { key: "service3_description", label: "Bloque 3: Descripción", type: "text", default: "Manejamos toda la logística para que recibas tus productos en tiempo y forma, donde los necesites." },
      { key: "service3_features", label: "Bloque 3: Lista (una por línea)", type: "html", default: "Envíos a nivel nacional e internacional\nTracking en tiempo real\nEmpaque personalizado premium\nEntrega programada para eventos\nCoordinación de entregas múltiples" },
      { key: "service4_title", label: "Bloque 4: Título", type: "text", default: "Atención al Cliente" },
      { key: "service4_description", label: "Bloque 4: Descripción", type: "text", default: "Soporte personalizado y especializado durante todo el proceso de tu proyecto." },
      { key: "service4_features", label: "Bloque 4: Lista (una por línea)", type: "html", default: "Asesor dedicado a tu cuenta\nSoporte continuo vía WhatsApp\nSeguimiento detallado de pedidos\nGarantía de satisfacción 100%\nAtención post-venta profesional" },
    ],
  },
  {
    slug: "contacto",
    name: "Contacto",
    fields: [
      { key: "banner_image", label: "Imagen banner (URL)", type: "image", default: "" },
      { key: "title", label: "Título principal", type: "text", default: "Contacto" },
      { key: "subtitle", label: "Subtítulo", type: "text", default: "Estamos aquí para ayudarte. Contáctanos y descubre cómo podemos impulsar tu marca." },
      { key: "form_title", label: "Título del formulario", type: "text", default: "Envíanos un mensaje" },
      { key: "form_subtitle", label: "Subtítulo del formulario", type: "text", default: "Completa el formulario y nos pondremos en contacto contigo lo antes posible." },
      { key: "success_title", label: "Título mensaje enviado", type: "text", default: "¡Mensaje Enviado!" },
      { key: "success_text", label: "Texto mensaje enviado", type: "text", default: "Gracias por contactarnos. Hemos recibido tu mensaje y nos pondremos en contacto contigo en las próximas 24 horas." },
    ],
  },
  {
    slug: "catalogos",
    name: "Catálogos",
    fields: [
      { key: "banner_image", label: "Imagen banner (URL)", type: "image", default: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3A_banners_1920x720_CATALOGOS-rG2mR0uYlwK1bFLO7gxvbiOV9hUI6a.png" },
      { key: "title", label: "Título principal", type: "text", default: "Catálogos" },
      { key: "subtitle", label: "Subtítulo", type: "text", default: "Explora nuestros catálogos y encuentra los productos perfectos para tu marca." },
    ],
  },
  {
    slug: "pedidos",
    name: "Pedidos",
    fields: [
      { key: "banner_image", label: "Imagen banner (URL)", type: "image", default: "" },
      { key: "title", label: "Título principal", type: "text", default: "Mis pedidos" },
      { key: "subtitle", label: "Subtítulo", type: "text", default: "Consulta el estado de tus proyectos, descargas y documentación." },
      { key: "empty_title", label: "Título sin pedidos", type: "text", default: "Todavía no tienes pedidos" },
      { key: "empty_text", label: "Texto sin pedidos", type: "text", default: "Una vez que confirmes tu primer pedido, verás aquí el resumen de producción, envíos y documentos." },
    ],
  },
]

/** Valores por defecto planos: page_slug -> { section_key -> value } */
export function getDefaultsForPage(pageSlug: string): Record<string, string> {
  const page = SITE_CONTENT_SCHEMA.find((p) => p.slug === pageSlug)
  if (!page) return {}
  return Object.fromEntries(page.fields.map((f) => [f.key, f.default]))
}
