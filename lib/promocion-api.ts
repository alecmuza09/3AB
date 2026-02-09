/**
 * Integración con API GraphQL de 3A Promoción (promocionalesenlinea.net)
 *
 * Autenticación: login con email/password → accessToken.
 * Consultas: usar el token en header Authorization para obtener productos/inventario.
 */

const PROMOCION_GRAPHQL_URL = process.env.PROMOCION_GRAPHQL_URL || 'https://www.promocionalesenlinea.net/graphql'

// ============================================
// TIPOS
// ============================================

export interface AuthResponse {
  message: string
  accessToken: string
  refreshToken: string
}

/** Respuesta genérica GraphQL (data o errors) */
export interface GraphQLResponse<T = unknown> {
  data?: T
  errors?: Array<{ message: string; extensions?: { code?: string } }>
}

/** Producto tal como puede venir de la API (campos flexibles según schema real) */
export interface PromocionProductRaw {
  id?: string
  id_articulo?: string
  sku?: string
  name?: string
  nombre?: string
  nombre_articulo?: string
  description?: string
  descripcion?: string
  price?: number
  precio?: number
  stock?: number
  inventario?: number
  quantity?: number
  category?: string
  categoria?: string
  sub_categoria?: string
  image_url?: string
  imagen?: string
  url_imagen?: string
  images?: Array<{ url?: string; url_imagen?: string }>
  imagenes?: Array<{ url_imagen?: string; url?: string; tipo_imagen?: string }>
  color?: string
  colors?: string[]
  colores?: string[]
  attributes?: Record<string, unknown>
  atributos?: Record<string, unknown>
  [key: string]: unknown
}

/** Producto normalizado para uso interno (mapeo desde PromocionProductRaw) */
export interface PromocionProduct {
  id: string
  sku: string
  name: string
  description: string | null
  price: number
  stock: number
  category: string
  subCategory: string | null
  imageUrl: string | null
  images: string[]
  colors: string[]
  attributes: Record<string, unknown>
}

// ============================================
// CONFIG
// ============================================

function getPromocionConfig() {
  const url = process.env.PROMOCION_GRAPHQL_URL || PROMOCION_GRAPHQL_URL
  const email = process.env.PROMOCION_EMAIL || ''
  const password = process.env.PROMOCION_PASSWORD || ''
  return {
    url,
    email,
    password,
    isEnabled: () => !!url && !!email && !!password,
  }
}

// ============================================
// LOGIN
// ============================================

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      message
      accessToken
      refreshToken
    }
  }
`

/**
 * Inicia sesión en la API de 3A Promoción y devuelve los tokens.
 */
export async function loginPromocion(email?: string, password?: string): Promise<AuthResponse> {
  const config = getPromocionConfig()
  const credEmail = email || config.email
  const credPassword = password || config.password

  if (!credEmail || !credPassword) {
    throw new Error('PROMOCION_EMAIL y PROMOCION_PASSWORD son requeridos (o pásalos como argumentos)')
  }

  const res = await fetch(config.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: LOGIN_MUTATION,
      variables: { email: credEmail, password: credPassword },
    }),
  })

  const json: GraphQLResponse<{ login: AuthResponse }> = await res.json()

  if (json.errors && json.errors.length > 0) {
    const msg = json.errors.map((e) => e.message).join('; ')
    const code = json.errors[0]?.extensions?.code
    throw new Error(code ? `[${code}] ${msg}` : msg)
  }

  if (!json.data?.login?.accessToken) {
    throw new Error('Respuesta de login sin accessToken')
  }

  return json.data.login
}

// ============================================
// GRAPHQL REQUEST
// ============================================

/**
 * Ejecuta una operación GraphQL contra la API usando el token.
 */
export async function promocionGraphQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  accessToken?: string
): Promise<T> {
  const config = getPromocionConfig()
  const token = accessToken || (await loginPromocion()).accessToken

  const res = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables: variables || {} }),
  })

  const json: GraphQLResponse<T> = await res.json()

  if (json.errors && json.errors.length > 0) {
    const msg = json.errors.map((e) => e.message).join('; ')
    throw new Error(msg)
  }

  if (json.data === undefined) {
    throw new Error('Respuesta GraphQL sin data')
  }

  return json.data
}

// ============================================
// PRODUCTOS / INVENTARIO
// ============================================
//
// La API puede exponer productos con distintos nombres (products, articulos, stock, etc.).
// Ajusta la query y el path de lectura según la documentación de promocionalesenlinea.net.
// Si tienes la query oficial, reemplaza PRODUCTS_QUERY y PRODUCTS_DATA_PATH.
//

const PRODUCTS_QUERY = `
  query GetProducts {
    products {
      id
      sku
      name
      description
      price
      stock
      category
      image_url
      images { url }
    }
  }
`

/** Alternativa por si la API usa "articulos" o "stock" (descomenta y ajusta campos si aplica) */
const ARTICULOS_QUERY = `
  query GetArticulos {
    articulos {
      id
      id_articulo
      sku
      nombre
      nombre_articulo
      descripcion
      precio
      inventario
      stock
      categoria
      sub_categoria
      imagen
      url_imagen
      imagenes { url_imagen url }
      color
      colores
    }
  }
`

const STOCK_QUERY = `
  query GetStock {
    stock {
      id
      id_articulo
      sku
      nombre_articulo
      descripcion
      precio
      inventario
      cantidad
      categoria
      imagen
      imagenes { url_imagen }
      color
    }
  }
`

/** Paths posibles donde puede venir la lista en la respuesta (primer que exista) */
const PRODUCTS_DATA_PATHS = [
  'products',
  'articulos',
  'stock',
  'inventory',
  'items',
] as const

function extractProductList(data: Record<string, unknown>): PromocionProductRaw[] {
  for (const key of PRODUCTS_DATA_PATHS) {
    const value = data[key]
    if (Array.isArray(value)) return value as PromocionProductRaw[]
  }
  return []
}

/**
 * Intenta obtener productos con varias queries posibles.
 */
async function fetchProductsRaw(): Promise<PromocionProductRaw[]> {
  const queries = [PRODUCTS_QUERY, ARTICULOS_QUERY, STOCK_QUERY]

  for (const query of queries) {
    try {
      const data = await promocionGraphQL<Record<string, unknown>>(query)
      const list = extractProductList(data)
      if (list.length > 0) return list
    } catch {
      continue
    }
  }

  return []
}

/**
 * Normaliza un producto crudo de la API al formato interno.
 */
export function normalizePromocionProduct(raw: PromocionProductRaw, fallbackId: string): PromocionProduct {
  const id = String(raw.id ?? raw.id_articulo ?? raw.sku ?? fallbackId)
  const sku = String(raw.sku ?? raw.id_articulo ?? raw.id ?? id)
  const name = String(raw.name ?? raw.nombre ?? raw.nombre_articulo ?? 'Sin nombre')
  const description =
    typeof raw.description === 'string'
      ? raw.description
      : typeof raw.descripcion === 'string'
        ? raw.descripcion
        : null
  const price = Number(raw.price ?? raw.precio ?? 0) || 0
  const stock = Number(raw.stock ?? raw.inventario ?? raw.quantity ?? 0) || 0
  const category = String(raw.category ?? raw.categoria ?? 'General')
  const subCategory =
    typeof raw.sub_categoria === 'string' && raw.sub_categoria ? raw.sub_categoria : null

  let imageUrl: string | null = null
  if (typeof raw.image_url === 'string') imageUrl = raw.image_url
  else if (typeof raw.imagen === 'string') imageUrl = raw.imagen
  else if (typeof raw.url_imagen === 'string') imageUrl = raw.url_imagen

  const images: string[] = []
  const imgList = raw.images ?? raw.imagenes
  if (Array.isArray(imgList)) {
    for (const img of imgList) {
      const u = (img as { url?: string; url_imagen?: string }).url ?? (img as { url_imagen?: string }).url_imagen
      if (typeof u === 'string') images.push(u)
    }
  }
  if (imageUrl && !images.includes(imageUrl)) images.unshift(imageUrl)

  const colors: string[] = []
  if (typeof raw.color === 'string') colors.push(raw.color)
  if (Array.isArray(raw.colors)) colors.push(...raw.colors.filter((c): c is string => typeof c === 'string'))
  if (Array.isArray(raw.colores)) colors.push(...raw.colores.filter((c): c is string => typeof c === 'string'))

  const attributes: Record<string, unknown> = {}
  if (raw.attributes && typeof raw.attributes === 'object') Object.assign(attributes, raw.attributes)
  if (raw.atributos && typeof raw.atributos === 'object') Object.assign(attributes, raw.atributos)

  return {
    id,
    sku,
    name,
    description,
    price,
    stock,
    category,
    subCategory,
    imageUrl,
    images,
    colors,
    attributes,
  }
}

/**
 * Obtiene todos los productos desde la API de 3A Promoción (normalizados).
 */
export async function getProductsFromPromocionApi(): Promise<PromocionProduct[]> {
  const config = getPromocionConfig()
  if (!config.isEnabled()) {
    console.warn('3A Promoción: no configurado (PROMOCION_GRAPHQL_URL, PROMOCION_EMAIL, PROMOCION_PASSWORD)')
    return []
  }

  const rawList = await fetchProductsRaw()
  return rawList.map((raw, index) => normalizePromocionProduct(raw, `promo-${index}`))
}

export { getPromocionConfig }
