import { WooCommerceProduct, getProductById as getWooCommerceProductById, getVisibleProducts } from "./woocommerce-products"

// Productos hardcoded (legacy)
export interface LegacyProduct {
  id: string
  name: string
  category: string
  price: string
  image: string
  rating: number
  description: string
  stock: number
}

export const legacyProducts: LegacyProduct[] = [
  {
    id: "legacy-1",
    name: "Bolígrafo Promocional Premium",
    category: "Bolígrafos",
    price: "Desde $8.000",
    image: "/boligrafo-promocional.png",
    rating: 4.8,
    description: "Bolígrafo de metal con grabado láser personalizado, ideal para eventos corporativos.",
    stock: 0,
  },
  {
    id: "legacy-2",
    name: "Taza Cerámica Personalizada",
    category: "Tazas",
    price: "Desde $15.000",
    image: "/taza-promocional-amarilla-personalizada.png",
    rating: 4.9,
    description: "Taza de cerámica de alta calidad con impresión full color y acabado brillante.",
    stock: 0,
  },
  {
    id: "legacy-3",
    name: "Termo Metálico Premium",
    category: "Termos",
    price: "Desde $35.000",
    image: "/termos-met-licos-promocionales.png",
    rating: 4.7,
    description: "Termo de acero inoxidable con aislamiento térmico de 12 horas y grabado personalizado.",
    stock: 0,
  },
  {
    id: "legacy-4",
    name: "Gorra Bordada Corporativa",
    category: "Gorras",
    price: "Desde $18.000",
    image: "/gorra-corporativa.png",
    rating: 4.6,
    description: "Gorra de algodón con bordado 3D y ajuste posterior, perfecta para uniformes.",
    stock: 0,
  },
  {
    id: "legacy-5",
    name: "USB Personalizado 16GB",
    category: "USB",
    price: "Desde $25.000",
    image: "/usb-personalizado.png",
    rating: 4.5,
    description: "Memoria USB de 16GB con carcasa metálica y grabado láser de tu logo.",
    stock: 0,
  },
  {
    id: "legacy-6",
    name: "Mochila Ejecutiva",
    category: "Mochilas",
    price: "Desde $45.000",
    image: "/mochila-ejecutiva.png",
    rating: 4.8,
    description: "Mochila de poliéster resistente con compartimento para laptop y bordado personalizado.",
    stock: 0,
  },
  {
    id: "legacy-7",
    name: "Playera Polo Empresarial",
    category: "Playeras",
    price: "Desde $28.000",
    image: "/polo-shirt-corporate.png",
    rating: 4.7,
    description: "Playera polo de algodón peinado con bordado corporativo y corte moderno.",
    stock: 0,
  },
  {
    id: "legacy-8",
    name: "Reloj de Pulsera Corporativo",
    category: "Relojes",
    price: "Desde $55.000",
    image: "/relojes-promocionales-corporativos.png",
    rating: 4.6,
    description: "Reloj elegante con movimiento japonés y grabado personalizado en la parte posterior.",
    stock: 0,
  },
  {
    id: "legacy-9",
    name: "Folder Ejecutivo",
    category: "Folders",
    price: "Desde $12.000",
    image: "/folder-ejecutivo.png",
    rating: 4.4,
    description: "Folder de cuero sintético con porta tarjetas y bloc de notas incluido.",
    stock: 0,
  },
  {
    id: "legacy-10",
    name: "Placa de Reconocimiento",
    category: "Placas",
    price: "Desde $35.000",
    image: "/placa-reconocimiento.png",
    rating: 4.9,
    description: "Placa de acrílico con base de madera y grabado láser de alta precisión.",
    stock: 0,
  },
  {
    id: "legacy-11",
    name: "Gafete Identificación",
    category: "Gafetes",
    price: "Desde $5.000",
    image: "/gafete-identificacion.png",
    rating: 4.3,
    description: "Gafete de PVC con impresión full color y porta gafete incluido.",
    stock: 0,
  },
  {
    id: "legacy-12",
    name: "Calendario de Escritorio",
    category: "Calendarios",
    price: "Desde $20.000",
    image: "/calendario-escritorio.png",
    rating: 4.5,
    description: "Calendario de escritorio con base metálica y hojas intercambiables personalizadas.",
    stock: 0,
  },
]

// Unión de tipos de productos
export type AnyProduct = WooCommerceProduct | LegacyProduct

// Función para obtener cualquier producto por ID
export function getAnyProductById(id: string): AnyProduct | null {
  // Primero buscar en productos legacy
  const legacyProduct = legacyProducts.find((p) => p.id === id)
  if (legacyProduct) {
    return legacyProduct
  }

  // Luego buscar en productos WooCommerce
  const wooCommerceProduct = getWooCommerceProductById(id)
  if (wooCommerceProduct) {
    return wooCommerceProduct
  }

  return null
}

// Función para verificar si es un producto legacy
export function isLegacyProduct(product: AnyProduct): product is LegacyProduct {
  return "rating" in product && !("type" in product)
}

// Función para obtener todos los productos (legacy + WooCommerce)
export function getAllProductsForDisplay() {
  const wooCommerceProducts = getVisibleProducts()
  
  // Convertir productos WooCommerce al formato de display
  const convertedWooCommerce = wooCommerceProducts.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price > 0 
      ? `$${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "Consultar precio",
    image: product.image || `/placeholder.svg?height=200&width=300&query=${product.name}`,
    rating: 4.5,
    description: product.description || `${product.name} - ${product.attributes.material || "Producto promocional"} con personalización disponible`,
    stock: product.stock || 0,
    attributes: product.attributes,
    variations: product.variations,
    sku: product.sku,
  }))

  // Combinar productos legacy y WooCommerce
  return [...legacyProducts, ...convertedWooCommerce]
}

