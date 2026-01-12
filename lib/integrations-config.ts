/**
 * Configuración de Integraciones de 3A Branding
 * 
 * Este archivo contiene la configuración y validación de todas las 
 * integraciones de terceros utilizadas en la plataforma.
 */

// ============================================
// SUPABASE - Base de Datos
// ============================================
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  isEnabled: () => !!(supabaseConfig.url && supabaseConfig.anonKey),
  isServerEnabled: () => !!(supabaseConfig.url && supabaseConfig.serviceRoleKey),
}

// ============================================
// YOLO ENVÍO - Gestión de Envíos
// ============================================
export const yoloenvioConfig = {
  apiKey: process.env.YOLOENVIO_API_KEY || '',
  apiSecret: process.env.YOLOENVIO_API_SECRET || '',
  webhookSecret: process.env.YOLOENVIO_WEBHOOK_SECRET || '',
  mode: process.env.YOLOENVIO_MODE || 'sandbox',
  baseUrl: process.env.YOLOENVIO_MODE === 'production' 
    ? 'https://api.yoloenvio.com' 
    : 'https://sandbox.yoloenvio.com',
  isEnabled: () => !!(yoloenvioConfig.apiKey && yoloenvioConfig.apiSecret),
}

// ============================================
// STRIPE - Pagos Internacionales
// ============================================
export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  currency: 'mxn',
  isEnabled: () => !!(stripeConfig.publishableKey && stripeConfig.secretKey),
}

// ============================================
// MERCADO PAGO - Pagos México y LATAM
// ============================================
export const mercadopagoConfig = {
  publicKey: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '',
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
  isEnabled: () => !!(mercadopagoConfig.publicKey && mercadopagoConfig.accessToken),
}

// ============================================
// PAYPAL - Pagos Alternativos
// ============================================
export const paypalConfig = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
  mode: process.env.PAYPAL_MODE || 'sandbox',
  isEnabled: () => !!(paypalConfig.clientId && paypalConfig.clientSecret),
}

// ============================================
// OPENPAY - Pagos México
// ============================================
export const openpayConfig = {
  merchantId: process.env.OPENPAY_MERCHANT_ID || '',
  publicKey: process.env.OPENPAY_PUBLIC_KEY || '',
  privateKey: process.env.OPENPAY_PRIVATE_KEY || '',
  production: process.env.OPENPAY_PRODUCTION === 'true',
  isEnabled: () => !!(openpayConfig.merchantId && openpayConfig.publicKey),
}

// ============================================
// EMAIL - Notificaciones
// ============================================
export const emailConfig = {
  provider: process.env.EMAIL_PROVIDER || 'resend',
  resendApiKey: process.env.RESEND_API_KEY || '',
  from: process.env.EMAIL_FROM || 'ventas@3abranding.com',
  isEnabled: () => !!emailConfig.resendApiKey,
}

// ============================================
// WHATSAPP BUSINESS - Comunicación
// ============================================
export const whatsappConfig = {
  phoneNumber: process.env.WHATSAPP_PHONE_NUMBER || '',
  apiKey: process.env.WHATSAPP_BUSINESS_API_KEY || '',
  apiUrl: process.env.WHATSAPP_BUSINESS_API_URL || '',
  isEnabled: () => !!whatsappConfig.apiKey,
}

// ============================================
// CLOUDINARY - Almacenamiento de Imágenes
// ============================================
export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  isEnabled: () => !!(cloudinaryConfig.cloudName && cloudinaryConfig.apiKey),
}

// ============================================
// ANALYTICS - Google Analytics y Facebook
// ============================================
export const analyticsConfig = {
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || '',
  facebookPixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '',
  hotjarId: process.env.NEXT_PUBLIC_HOTJAR_ID || '',
  isGAEnabled: () => !!analyticsConfig.googleAnalyticsId,
  isFBPixelEnabled: () => !!analyticsConfig.facebookPixelId,
}

// ============================================
// FACTURACIÓN ELECTRÓNICA - México
// ============================================
export const facturacionConfig = {
  provider: 'facturapi', // facturapi, facturama, etc.
  secretKey: process.env.FACTURAPI_SECRET_KEY || '',
  publicKey: process.env.FACTURAPI_PUBLIC_KEY || '',
  isEnabled: () => !!facturacionConfig.secretKey,
}

// ============================================
// API DE INVENTARIO - 4Promotional
// ============================================
export const inventarioApiConfig = {
  baseUrl: process.env.INVENTARIO_API_BASE_URL || 'https://4promotional.net:9090/WsEstrategia',
  apiKey: process.env.INVENTARIO_API_KEY || '',
  timeout: parseInt(process.env.INVENTARIO_API_TIMEOUT || '30000', 10),
  isEnabled: () => !!inventarioApiConfig.baseUrl,
}

// ============================================
// CONFIGURACIÓN GENERAL
// ============================================
export const appConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}

// ============================================
// VALIDACIÓN DE CONFIGURACIÓN
// ============================================
export function validateIntegrations() {
  const integrations = {
    supabase: supabaseConfig.isEnabled(),
    yoloenvio: yoloenvioConfig.isEnabled(),
    stripe: stripeConfig.isEnabled(),
    mercadopago: mercadopagoConfig.isEnabled(),
    paypal: paypalConfig.isEnabled(),
    openpay: openpayConfig.isEnabled(),
    email: emailConfig.isEnabled(),
    whatsapp: whatsappConfig.isEnabled(),
    cloudinary: cloudinaryConfig.isEnabled(),
    facturacion: facturacionConfig.isEnabled(),
    inventarioApi: inventarioApiConfig.isEnabled(),
  }

  return integrations
}

// ============================================
// OBTENER ESTADO DE INTEGRACIONES
// ============================================
export function getIntegrationsStatus() {
  return [
    {
      name: 'Supabase',
      category: 'Base de Datos',
      status: supabaseConfig.isEnabled(),
      description: 'Base de datos PostgreSQL y autenticación',
      required: true,
    },
    {
      name: 'YoloEnvio',
      category: 'Envíos',
      status: yoloenvioConfig.isEnabled(),
      description: 'Gestión y rastreo de envíos',
      required: true,
    },
    {
      name: 'Stripe',
      category: 'Pagos',
      status: stripeConfig.isEnabled(),
      description: 'Pagos con tarjeta internacional',
      required: false,
    },
    {
      name: 'Mercado Pago',
      category: 'Pagos',
      status: mercadopagoConfig.isEnabled(),
      description: 'Pagos para México y LATAM',
      required: true,
    },
    {
      name: 'PayPal',
      category: 'Pagos',
      status: paypalConfig.isEnabled(),
      description: 'Pagos con cuenta PayPal',
      required: false,
    },
    {
      name: 'Openpay',
      category: 'Pagos',
      status: openpayConfig.isEnabled(),
      description: 'Pagos México (SPEI, Tarjetas)',
      required: false,
    },
    {
      name: 'Email',
      category: 'Comunicación',
      status: emailConfig.isEnabled(),
      description: 'Envío de notificaciones por email',
      required: true,
    },
    {
      name: 'WhatsApp Business',
      category: 'Comunicación',
      status: whatsappConfig.isEnabled(),
      description: 'Mensajes automatizados por WhatsApp',
      required: false,
    },
    {
      name: 'Cloudinary',
      category: 'Almacenamiento',
      status: cloudinaryConfig.isEnabled(),
      description: 'Almacenamiento y optimización de imágenes',
      required: true,
    },
    {
      name: 'Facturación Electrónica',
      category: 'Facturación',
      status: facturacionConfig.isEnabled(),
      description: 'Generación de facturas (SAT México)',
      required: true,
    },
    {
      name: 'Google Analytics',
      category: 'Analytics',
      status: analyticsConfig.isGAEnabled(),
      description: 'Análisis de tráfico y conversiones',
      required: false,
    },
    {
      name: 'API de Inventario',
      category: 'Productos',
      status: inventarioApiConfig.isEnabled(),
      description: 'Sincronización de inventario desde 4Promotional',
      required: false,
    },
  ]
}









