export interface ProductVariation {
  id: string
  sku: string
  name: string
  price: number
  stock: number
  color?: string
  attributes: Record<string, string>
}

export interface WooCommerceProduct {
  id: string
  sku: string
  name: string
  type: "variable" | "simple"
  category: string
  categories: string[]
  description: string
  price: number
  minPrice?: number
  maxPrice?: number
  stock: number
  visibility: "visible" | "hidden"
  published: boolean
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
  attributes: {
    medidas?: string
    areaImpresion?: string
    tecnicaImpresion?: string[]
    material?: string
    capacidad?: string
    color?: string[]
    proveedor?: string
  }
  variations?: ProductVariation[]
  image?: string
  minQuantity?: number
  multipleOf?: number
}

export const woocommerceProducts: WooCommerceProduct[] = [
  // Licorera Jebel
  {
    id: "60300-ON",
    sku: "60300 ON",
    name: "Licorera Jebel",
    type: "variable",
    category: "Bar",
    categories: ["Bar", "Sublimacion"],
    description: "Licorera Jebel con capacidad de 196 ml, ideal para regalos corporativos",
    price: 116.18,
    stock: 0,
    visibility: "hidden",
    published: true,
    weight: 0.011,
    dimensions: {
      length: 10,
      width: 12.5,
    },
    attributes: {
      medidas: "10 x 12.5 cm",
      areaImpresion: "7 x 7 cm",
      tecnicaImpresion: ["Láser"],
      material: "Acero Inoxidable / Curpiel",
      capacidad: "196 ml",
      color: ["CAFE"],
      proveedor: "promocionalesenlinea",
    },
    variations: [
      {
        id: "60300-C-ON-CAFE",
        sku: "60300 C ON CAFE",
        name: "Licorera Jebel - CAFE",
        price: 116.18,
        stock: 0,
        color: "CAFE",
        attributes: {
          Color: "CAFE",
        },
      },
    ],
    minQuantity: 1,
    multipleOf: 1,
  },
  
  // Tagu - Bolígrafo Metálico
  {
    id: "AL-17020",
    sku: "AL 17020",
    name: "Tagu",
    type: "variable",
    category: "Escritura",
    categories: ["Escritura", "Boligrafos Metalicos"],
    description: "Bolígrafo metálico Tagu con múltiples opciones de personalización",
    price: 13.04,
    stock: 0,
    visibility: "visible",
    published: true,
    weight: 0.02,
    dimensions: {
      length: 14.0,
      width: 14.0,
    },
    attributes: {
      medidas: "1.2 x 14.0 cm",
      areaImpresion: "1 x 2 cm",
      tecnicaImpresion: ["Grabado Láser", "Serigrafía", "Tampografía"],
      material: "Dato no disponible",
      capacidad: "Dato no disponible",
      color: ["AZUL", "AZUL CLARO", "BLANCO", "MORADO", "NARANJA", "NEGRO", "ROJO", "ROSA", "VERDE"],
      proveedor: "4promotional",
    },
    variations: [
      {
        id: "AL-17020-AZUL",
        sku: "AL 17020 4P AZUL",
        name: "Tagu - AZUL",
        price: 13.04,
        stock: 53,
        color: "AZUL",
        attributes: {
          Color: "AZUL",
        },
      },
      {
        id: "AL-17020-AZUL-CLARO",
        sku: "AL 17020 4P AZUL CLARO",
        name: "Tagu - AZUL CLARO",
        price: 13.04,
        stock: 2414,
        color: "AZUL CLARO",
        attributes: {
          Color: "AZUL CLARO",
        },
      },
      {
        id: "AL-17020-BLANCO",
        sku: "AL 17020 4P BLANCO",
        name: "Tagu - BLANCO",
        price: 13.04,
        stock: 7700,
        color: "BLANCO",
        attributes: {
          Color: "BLANCO",
        },
      },
      {
        id: "AL-17020-MORADO",
        sku: "AL 17020 4P MORADO",
        name: "Tagu - MORADO",
        price: 13.04,
        stock: 329,
        color: "MORADO",
        attributes: {
          Color: "MORADO",
        },
      },
      {
        id: "AL-17020-NARANJA",
        sku: "AL 17020 4P NARANJA",
        name: "Tagu - NARANJA",
        price: 13.04,
        stock: 3768,
        color: "NARANJA",
        attributes: {
          Color: "NARANJA",
        },
      },
      {
        id: "AL-17020-NEGRO",
        sku: "AL 17020 4P NEGRO",
        name: "Tagu - NEGRO",
        price: 13.04,
        stock: 16039,
        color: "NEGRO",
        attributes: {
          Color: "NEGRO",
        },
      },
      {
        id: "AL-17020-ROJO",
        sku: "AL 17020 4P ROJO",
        name: "Tagu - ROJO",
        price: 13.04,
        stock: 1219,
        color: "ROJO",
        attributes: {
          Color: "ROJO",
        },
      },
      {
        id: "AL-17020-ROSA",
        sku: "AL 17020 4P ROSA",
        name: "Tagu - ROSA",
        price: 13.04,
        stock: 0,
        color: "ROSA",
        attributes: {
          Color: "ROSA",
        },
      },
      {
        id: "AL-17020-VERDE",
        sku: "AL 17020 4P VERDE",
        name: "Tagu - VERDE",
        price: 13.04,
        stock: 950,
        color: "VERDE",
        attributes: {
          Color: "VERDE",
        },
      },
    ],
    minQuantity: 1,
    multipleOf: 1,
  },
  
  // Pastillero redondo
  {
    id: "BE-004",
    sku: "BE-004",
    name: "Pastillero redondo",
    type: "variable",
    category: "Salud",
    categories: ["Salud", "Cuidado Personal", "Salud Y Belleza"],
    description: "Pastillero redondo de plástico con personalización",
    price: 14.12,
    stock: 0,
    visibility: "visible",
    published: true,
    weight: 0.026,
    dimensions: {
      length: 7,
    },
    attributes: {
      medidas: "7 cm.",
      areaImpresion: "3 cm.",
      tecnicaImpresion: ["Serigrafía"],
      material: "Plástico",
      capacidad: "Dato no disponible",
      color: ["AZUL MARINO", "BLANCO", "ROJO"],
      proveedor: "innovation",
    },
    variations: [
      {
        id: "BE-004-AZUL-MARINO",
        sku: "BE-004A IN AZUL MARINO",
        name: "Pastillero redondo - AZUL MARINO",
        price: 14.12,
        stock: 2,
        color: "AZUL MARINO",
        attributes: {
          Color: "AZUL MARINO",
        },
      },
      {
        id: "BE-004-BLANCO",
        sku: "BE-004B IN BLANCO",
        name: "Pastillero redondo - BLANCO",
        price: 14.12,
        stock: 108,
        color: "BLANCO",
        attributes: {
          Color: "BLANCO",
        },
      },
      {
        id: "BE-004-ROJO",
        sku: "BE-004R IN ROJO",
        name: "Pastillero redondo - ROJO",
        price: 14.12,
        stock: 1494,
        color: "ROJO",
        attributes: {
          Color: "ROJO",
        },
      },
    ],
    minQuantity: 1,
    multipleOf: 1,
  },
  
  // Espejo redondo
  {
    id: "BE-006",
    sku: "BE-006",
    name: "Espejo redondo",
    type: "variable",
    category: "Belleza",
    categories: ["Belleza", "Salud Y Belleza"],
    description: "Espejo redondo de plástico con personalización",
    price: 0,
    stock: 0,
    visibility: "visible",
    published: true,
    weight: 0.02,
    dimensions: {
      length: 6.5,
      width: 6,
    },
    attributes: {
      medidas: "6.5x6 cm.",
      areaImpresion: "3x3 cm.",
      tecnicaImpresion: ["Serigrafía"],
      material: "Plástico",
      capacidad: "Dato no disponible",
      color: ["AZUL", "BLANCO", "MORADO", "NARANJA", "ROJO", "ROSA"],
      proveedor: "innovation",
    },
    variations: [],
    minQuantity: 1,
    multipleOf: 1,
  },
  
  // Set de manicura ovalado
  {
    id: "BE-007",
    sku: "BE-007",
    name: "Set de manicura ovalado",
    type: "variable",
    category: "Belleza",
    categories: ["Belleza", "Salud Y Belleza"],
    description: "Set de manicura ovalado de metal con personalización",
    price: 0,
    stock: 0,
    visibility: "visible",
    published: true,
    weight: 0.075,
    dimensions: {
      length: 11.5,
      width: 4.5,
    },
    attributes: {
      medidas: "11.5x4.5 cm.",
      areaImpresion: "3x3 cm.",
      tecnicaImpresion: ["Tampografía"],
      material: "Metal",
      capacidad: "Dato no disponible",
      color: ["ROJO"],
      proveedor: "innovation",
    },
    variations: [],
    minQuantity: 1,
    multipleOf: 1,
  },
  
  // Set de manicura Lhasa
  {
    id: "BE-014",
    sku: "BE-014",
    name: "Set de manicura Lhasa",
    type: "variable",
    category: "Belleza",
    categories: ["Belleza", "Salud Y Belleza"],
    description: "Set de manicura Lhasa de plástico con personalización",
    price: 0,
    stock: 0,
    visibility: "visible",
    published: true,
    weight: 0.075,
    dimensions: {
      length: 9.5,
      width: 5,
    },
    attributes: {
      medidas: "9.5x5 cm.",
      areaImpresion: "3x2.5 cm.",
      tecnicaImpresion: ["Tampografía"],
      material: "Plástico",
      capacidad: "Dato no disponible",
      color: ["AZUL", "MORADO", "NARANJA", "ROJO", "ROSA", "VERDE LIMON"],
      proveedor: "innovation",
    },
    variations: [],
    minQuantity: 1,
    multipleOf: 1,
  },
  
  // Espejo redondo doble
  {
    id: "BE-015",
    sku: "BE-015",
    name: "Espejo redondo doble",
    type: "variable",
    category: "Belleza",
    categories: ["Belleza", "Salud Y Belleza"],
    description: "Espejo redondo doble de plástico con personalización",
    price: 0,
    stock: 0,
    visibility: "visible",
    published: true,
    weight: 0.05,
    dimensions: {
      length: 7.6,
      width: 7.6,
    },
    attributes: {
      medidas: "7.6x7.6 cm.",
      areaImpresion: "4.5x4.5 cm.",
      tecnicaImpresion: ["Serigrafía"],
      material: "Plástico",
      capacidad: "Dato no disponible",
      color: ["BLANCO", "NEGRO"],
      proveedor: "innovation",
    },
    variations: [],
    minQuantity: 1,
    multipleOf: 1,
  },
  
  // Pastillero con espejo
  {
    id: "BE-016",
    sku: "BE-016",
    name: "Pastillero con espejo",
    type: "variable",
    category: "Belleza",
    categories: ["Belleza", "Salud Y Belleza"],
    description: "Pastillero con espejo de metal con personalización",
    price: 0,
    stock: 0,
    visibility: "visible",
    published: true,
    weight: 0.0367,
    dimensions: {
      length: 5,
      width: 5,
    },
    attributes: {
      medidas: "5x5 cm.",
      areaImpresion: "3x3 cm.",
      tecnicaImpresion: ["Tampografía"],
      material: "Metal",
      capacidad: "Dato no disponible",
      color: ["PLATA", "ROSA METALICO"],
      proveedor: "innovation",
    },
    variations: [],
    minQuantity: 1,
    multipleOf: 1,
  },
]

// Función helper para obtener productos visibles
export function getVisibleProducts(): WooCommerceProduct[] {
  return woocommerceProducts.filter((p) => p.visibility === "visible" && p.published)
}

// Función helper para buscar productos por categoría
export function getProductsByCategory(category: string): WooCommerceProduct[] {
  return woocommerceProducts.filter(
    (p) =>
      p.published &&
      (p.category.toLowerCase() === category.toLowerCase() ||
        p.categories.some((c) => c.toLowerCase() === category.toLowerCase()))
  )
}

// Función helper para buscar productos por SKU
export function getProductBySku(sku: string): WooCommerceProduct | undefined {
  return woocommerceProducts.find((p) => p.sku === sku)
}

// Función helper para obtener el stock total de un producto variable
export function getTotalStock(product: WooCommerceProduct): number {
  if (product.type === "simple") {
    return product.stock
  }
  if (product.variations && product.variations.length > 0) {
    return product.variations.reduce((sum, variation) => sum + variation.stock, 0)
  }
  return product.stock
}

// Función helper para obtener producto por ID
export function getProductById(id: string): WooCommerceProduct | undefined {
  return woocommerceProducts.find((p) => p.id === id)
}

// Función helper para obtener todos los productos (incluyendo los hardcoded)
export function getAllProducts() {
  return woocommerceProducts
}

