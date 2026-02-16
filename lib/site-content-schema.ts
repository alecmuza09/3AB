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
      { key: "ai_badge", label: "Badge sección IA", type: "text", default: "Inteligencia Artificial" },
      { key: "ai_title_line1", label: "Título IA (línea 1)", type: "text", default: "¿No sabes qué productos elegir?" },
      { key: "ai_title_line2", label: "Título IA (línea 2)", type: "text", default: "Te ayudamos" },
      { key: "ai_subtitle", label: "Subtítulo IA", type: "text", default: "Nuestro asistente de inteligencia artificial te acompaña paso a paso para identificar los productos promocionales más adecuados, comprendiendo tus necesidades específicas." },
      { key: "ai_feature1_title", label: "IA Característica 1 título", type: "text", default: "Análisis de necesidades" },
      { key: "ai_feature1_desc", label: "IA Característica 1 descripción", type: "text", default: "Comprende tu evento o proyecto para recomendarte los productos ideales." },
      { key: "ai_feature2_title", label: "IA Característica 2 título", type: "text", default: "Respuestas instantáneas" },
      { key: "ai_feature2_desc", label: "IA Característica 2 descripción", type: "text", default: "Obtén recomendaciones personalizadas en segundos, 24/7." },
      { key: "ai_feature3_title", label: "IA Característica 3 título", type: "text", default: "Decisiones más rápidas" },
      { key: "ai_feature3_desc", label: "IA Característica 3 descripción", type: "text", default: "Reduce el tiempo de selección con sugerencias inteligentes." },
      { key: "ai_cta_text", label: "Texto botón IA", type: "text", default: "Probar Asistente IA" },
      { key: "categories_badge", label: "Badge categorías", type: "text", default: "Catálogo" },
      { key: "categories_title", label: "Título categorías", type: "text", default: "Explora nuestras categorías" },
      { key: "categories_link_text", label: "Texto enlace catálogo", type: "text", default: "Ver catálogo completo" },
    ],
  },
  {
    slug: "nosotros",
    name: "Nosotros",
    fields: [
      { key: "banner_image", label: "Imagen banner (URL)", type: "image", default: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3A_banners_1920x720_nosotros-WznuT9mn7xdXXoRlIIIyEgsYihr7QF.png" },
      { key: "title", label: "Título principal", type: "text", default: "Nosotros" },
      { key: "subtitle", label: "Subtítulo", type: "text", default: "Somos 3A Branding, una empresa mexicana que combina creatividad, tecnología y un servicio único en el mercado para ayudarte a dar vida a tus ideas y crear conexiones que perduran." },
      
      // Introducción
      { key: "intro_p1", label: "Introducción: Párrafo 1", type: "html", default: "Nuestro propósito es conectar a marcas, empresas y personas con quienes más les importan, recordando su valor a través de detalles significativos." },
      { key: "intro_p2", label: "Introducción: Párrafo 2", type: "html", default: "Con más de 10 años de experiencia en el mercado de promocionales, hemos evolucionado hasta convertirnos en la forma más fácil y accesible de comprar promocionales en México, sin dejar atrás la calidad y la atención que siempre nos han distinguido." },
      
      // Por qué elegir 3A Branding
      { key: "why_title", label: "¿Por qué elegirnos?: Título", type: "text", default: "¿Por qué elegir 3A Branding?" },
      { key: "why_intro", label: "¿Por qué elegirnos?: Intro", type: "text", default: "Te ofrecemos valor real en cada etapa:" },
      { key: "why_short_title", label: "Corto plazo: Título", type: "text", default: "A corto plazo" },
      { key: "why_short_desc", label: "Corto plazo: Descripción", type: "text", default: "Resultados inmediatos: procesos rápidos y automáticos que te permiten cotizar, personalizar y ordenar sin complicaciones." },
      { key: "why_short_features", label: "Corto plazo: Lista (una por línea)", type: "html", default: "Menor tiempo de gestión\nMejor control del presupuesto\nMayor rotación y apoyo directo a tus ventas" },
      { key: "why_medium_title", label: "Mediano plazo: Título", type: "text", default: "A mediano plazo" },
      { key: "why_medium_desc", label: "Mediano plazo: Descripción", type: "text", default: "Construcción de marca: productos de calidad que generan recordación, identidad y presencia en el día a día." },
      { key: "why_medium_features", label: "Mediano plazo: Lista (una por línea)", type: "html", default: "Mayor reconocimiento\nMensajes consistentes\nExperiencias memorables" },
      { key: "why_long_title", label: "Largo plazo: Título", type: "text", default: "A largo plazo" },
      { key: "why_long_desc", label: "Largo plazo: Descripción", type: "text", default: "Relaciones que perduran: los promocionales adecuados fortalecen la lealtad, el vínculo emocional y las recomendaciones genuinas." },
      { key: "why_long_features", label: "Largo plazo: Lista (una por línea)", type: "html", default: "Más fidelidad\nMás recomendaciones\nMás conexión con las personas" },
      
      // Con 3A Branding obtienes
      { key: "benefits_title", label: "Beneficios: Título", type: "text", default: "Con 3A Branding obtienes:" },
      { key: "benefits_list", label: "Beneficios: Lista (una por línea)", type: "html", default: "Compra 100% digital con cotización y visualización automática y asistida por IA.\nFlexibilidad total, desde 1 pieza hasta miles.\nOpciones sustentables para marcas responsables.\nAtención humana cuando la necesitas, sin perder eficiencia.\nMás de 10 años de experiencia trabajando con marcas, equipos y personas en todo México." },
      
      // Historia
      { key: "history_title", label: "Historia: Título", type: "text", default: "Nuestra historia" },
      { key: "history_p1", label: "Historia: Párrafo 1", type: "html", default: "3A Branding nació en 2015 con un objetivo claro: ofrecer al mercado de artículos promocionales una propuesta basada en calidad, innovación y un servicio realmente orientado al cliente. Desde el inicio, la empresa ha trabajado para diferenciarse a través de soluciones creativas, procesos eficientes y una atención cercana que responda a las necesidades reales de marcas y organizaciones." },
      { key: "history_p2", label: "Historia: Párrafo 2", type: "html", default: "A lo largo de estos años, 3A Branding ha consolidado relaciones con empresas de diversos sectores, creciendo junto a ellas y adaptándose a un entorno cada vez más dinámico. Esta evolución constante ha sido posible gracias a una lectura profunda del mercado y a la búsqueda permanente de nuevas formas de simplificar y mejorar la experiencia del cliente." },
      { key: "history_p3", label: "Historia: Párrafo 3", type: "html", default: "Hoy, con más de una década de trayectoria, 3A Branding se distingue por combinar tecnología, creatividad y servicio en cada proyecto, manteniendo el mismo enfoque que los ha guiado desde el primer día: entregar soluciones de alto valor, de manera ágil, clara y accesible." },
      
      // Propósito
      { key: "purpose_title", label: "Propósito: Título", type: "text", default: "Nuestro propósito" },
      { key: "purpose_text", label: "Propósito: Texto", type: "html", default: "3A Branding nace para crear conexiones. Ayudamos a que marcas, empresas y personas comuniquen su esencia a través de soluciones que generan cercanía, emoción y recuerdo. Nuestro propósito es entender lo que cada cliente quiere transmitir y convertirlo en experiencias que conectan de verdad." },
      
      // Compromiso
      { key: "commitment_title", label: "Compromiso: Título", type: "text", default: "Nuestro compromiso" },
      { key: "commitment_p1", label: "Compromiso: Párrafo 1", type: "html", default: "En 3A Branding trabajamos con un compromiso que guía cada decisión: entregar excelencia en todo lo que hacemos. Nuestro enfoque está en ofrecer soluciones claras, confiables y alineadas a las necesidades reales de nuestros clientes, con la transparencia y cercanía que nos caracteriza." },
      { key: "commitment_p2", label: "Compromiso: Párrafo 2", type: "html", default: "También entendemos el impacto que nuestra industria puede generar en el entorno. Como parte de nuestro compromiso, impulsamos prácticas sostenibles, promovemos alternativas responsables y buscamos continuamente opciones que permitan a nuestros clientes elegir productos con menor impacto ambiental. Nuestro objetivo es avanzar hacia un modelo de negocio que sea rentable, consciente y sostenible." },
      { key: "commitment_p3", label: "Compromiso: Párrafo 3", type: "html", default: "En 3A Branding, nuestro compromiso es simple y firme: calidad, transparencia, confianza y responsabilidad con nuestros clientes y con el entorno." },
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
      
      // Servicios principales
      { key: "services_badge", label: "Badge servicios principales", type: "text", default: "Nuestros Servicios" },
      { key: "services_title", label: "Título servicios principales", type: "text", default: "Soluciones Completas para tu Marca" },
      { key: "services_subtitle", label: "Subtítulo servicios principales", type: "text", default: "Ofrecemos un servicio integral que cubre todas las necesidades de tu proyecto, desde la conceptualización hasta la entrega final." },
      { key: "service1_title", label: "Servicio 1: Título", type: "text", default: "Diseño y Personalización" },
      { key: "service1_description", label: "Servicio 1: Descripción", type: "text", default: "Creamos diseños únicos que reflejan la esencia de tu marca con profesionalismo y creatividad." },
      { key: "service1_features", label: "Servicio 1: Lista (una por línea)", type: "html", default: "Diseño gráfico profesional a medida\nMockups 3D realistas pre-producción\nMúltiples técnicas de marcado\nAsesoría creativa personalizada\nAdaptación de logotipos y branding" },
      { key: "service2_title", label: "Servicio 2: Título", type: "text", default: "Producción y Manufactura" },
      { key: "service2_description", label: "Servicio 2: Descripción", type: "text", default: "Fabricamos productos de alta calidad con los mejores materiales y procesos certificados." },
      { key: "service2_features", label: "Servicio 2: Lista (una por línea)", type: "html", default: "Control de calidad riguroso en cada etapa\nMateriales premium certificados\nProducción escalable de 1 a 100,000+ piezas\nCertificaciones internacionales ISO\nTiempos de entrega garantizados" },
      { key: "service3_title", label: "Servicio 3: Título", type: "text", default: "Logística y Entrega" },
      { key: "service3_description", label: "Servicio 3: Descripción", type: "text", default: "Manejamos toda la logística para que recibas tus productos en tiempo y forma, donde los necesites." },
      { key: "service3_features", label: "Servicio 3: Lista (una por línea)", type: "html", default: "Envíos a nivel nacional e internacional\nTracking en tiempo real\nEmpaque personalizado premium\nEntrega programada para eventos\nCoordinación de entregas múltiples" },
      { key: "service4_title", label: "Servicio 4: Título", type: "text", default: "Atención al Cliente" },
      { key: "service4_description", label: "Servicio 4: Descripción", type: "text", default: "Soporte personalizado y especializado durante todo el proceso de tu proyecto." },
      { key: "service4_features", label: "Servicio 4: Lista (una por línea)", type: "html", default: "Asesor dedicado a tu cuenta\nSoporte continuo vía WhatsApp\nSeguimiento detallado de pedidos\nGarantía de satisfacción 100%\nAtención post-venta profesional" },
      
      // Técnicas de personalización
      { key: "techniques_badge", label: "Badge técnicas", type: "text", default: "Técnicas de Personalización" },
      { key: "techniques_title", label: "Título técnicas", type: "text", default: "Tecnología de Vanguardia para Resultados Perfectos" },
      { key: "techniques_subtitle", label: "Subtítulo técnicas", type: "text", default: "Contamos con las mejores técnicas y equipos profesionales para personalizar tus productos con la máxima calidad." },
      
      // CTA final
      { key: "cta_title", label: "CTA: Título", type: "text", default: "¿Listo para Impulsar tu Marca?" },
      { key: "cta_subtitle", label: "CTA: Subtítulo", type: "text", default: "Contáctanos hoy mismo y descubre cómo podemos ayudarte a crear productos promocionales que realmente conecten con tu audiencia y fortalezcan tu presencia de marca." },
      { key: "cta_button1", label: "CTA: Botón 1", type: "text", default: "Solicitar Cotización Ahora" },
      { key: "cta_button2", label: "CTA: Botón 2", type: "text", default: "Agendar Consulta Gratis" },
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
      { key: "intro_text", label: "Texto introductorio", type: "html", default: "Descarga nuestros catálogos digitales y descubre la amplia variedad de productos promocionales que tenemos para ti. Cada catálogo incluye especificaciones detalladas, opciones de personalización y precios competitivos." },
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
