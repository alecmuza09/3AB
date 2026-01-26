export type CotizadorService = "tampografia" | "vidrio-metal" | "laser" | "bordado"

export interface QuotationData {
  service: CotizadorService
  quantity: number
  colors?: number
  size?: string
  subtotal: number
  extras: { name: string; cost: number }[]
  total: number
  totalWithMargin: number
  margin: string
  pricePerUnit: number
  pricePerUnitWithMargin: number
}

export interface CotizadorConfig {
  margins: {
    low: { threshold: number; percentage: number }
    medium: { threshold: number; percentage: number }
    high: { threshold: number; percentage: number }
  }
  extras: {
    placa: number
    ponchado: number
    tratamiento: number
  }
}

export const defaultCotizadorConfig: CotizadorConfig = {
  margins: {
    low: { threshold: 200, percentage: 30 },
    medium: { threshold: 1000, percentage: 25 },
    high: { threshold: 1001, percentage: 20 },
  },
  extras: {
    placa: 280,
    ponchado: 280,
    tratamiento: 150,
  },
}

// ============== COTIZADOR LOGIC (REUTILIZABLE) ==============

function calculateTampografiaSerigrafiaPrice(quantity: number, colors: number = 1) {
  let basePrice = 0
  let extraColorPrice = 0

  if (quantity <= 300) {
    basePrice = 980
    extraColorPrice = (colors - 1) * 3
  } else if (quantity <= 1000) {
    basePrice = quantity * 2.8
    extraColorPrice = (colors - 1) * 2.7
  } else if (quantity <= 2500) {
    basePrice = quantity * 2.5
    extraColorPrice = (colors - 1) * 2.4
  } else if (quantity <= 5000) {
    basePrice = quantity * 2.2
    extraColorPrice = (colors - 1) * 2.1
  } else {
    basePrice = quantity * 2.2
    extraColorPrice = (colors - 1) * 2.1
  }

  return basePrice + extraColorPrice
}

function calculateVidrioMetalRubberPrice(quantity: number, colors: number = 1) {
  let unitPrice = 0
  let extraColorPrice = 0

  if (quantity <= 500) {
    unitPrice = 900 / quantity
    extraColorPrice = 3.1
  } else if (quantity <= 1000) {
    unitPrice = 3.3
    extraColorPrice = 2.8
  } else if (quantity <= 2500) {
    unitPrice = 3.0
    extraColorPrice = 2.5
  } else if (quantity <= 5000) {
    unitPrice = 2.9
    extraColorPrice = 2.2
  } else {
    unitPrice = 2.6
    extraColorPrice = 2.0
  }

  const basePrice = quantity <= 500 ? 900 : quantity * unitPrice
  return basePrice + (colors - 1) * extraColorPrice * quantity
}

function calculateGrabadoLaserPrice(quantity: number) {
  if (quantity < 1000) return quantity * 12
  if (quantity <= 5000) return quantity * 8
  return quantity * 7
}

function calculateBordadoPrice(quantity: number, size: string) {
  const priceTable: Record<string, Record<string, number>> = {
    "5-12cm": {
      "1-9": 80,
      "10-49": 55,
      "50-99": 50,
      "100-299": 40,
      "300-499": 30,
      "500+": 25,
    },
    "12-20cm": {
      "1-9": 88,
      "10-49": 70,
      "50-99": 60,
      "100-299": 50,
      "300-499": 45,
      "500+": 40,
    },
    "20-25cm": {
      "1-9": 140,
      "10-49": 110,
      "50-99": 90,
      "100-299": 90,
      "300-499": 70,
      "500+": 70,
    },
  }

  let range = "500+"
  if (quantity <= 9) range = "1-9"
  else if (quantity <= 49) range = "10-49"
  else if (quantity <= 99) range = "50-99"
  else if (quantity <= 299) range = "100-299"
  else if (quantity <= 499) range = "300-499"

  const pricePerUnit = priceTable[size]?.[range] ?? 0
  return quantity * pricePerUnit
}

function calculateMargin(quantity: number, config?: CotizadorConfig) {
  const margins = config?.margins || defaultCotizadorConfig.margins

  if (quantity <= margins.low.threshold) {
    const percentage = margins.low.percentage
    return { percentage, divisor: 1 - percentage / 100, label: `${percentage}%` }
  }
  if (quantity <= margins.medium.threshold) {
    const percentage = margins.medium.percentage
    return { percentage, divisor: 1 - percentage / 100, label: `${percentage}%` }
  }

  const percentage = margins.high.percentage
  return { percentage, divisor: 1 - percentage / 100, label: `${percentage}%` }
}

export type IncludeExtras = { placa?: boolean; ponchado?: boolean; tratamiento?: boolean }

export function generateQuotation(
  service: CotizadorService,
  quantity: number,
  colors?: number,
  size?: string,
  includeExtras?: IncludeExtras,
  config?: CotizadorConfig
): QuotationData {
  let subtotal = 0
  const extras: { name: string; cost: number }[] = []

  const extrasConfig = config?.extras || defaultCotizadorConfig.extras

  switch (service) {
    case "tampografia":
      subtotal = calculateTampografiaSerigrafiaPrice(quantity, colors ?? 1)
      if (includeExtras?.placa) extras.push({ name: "Placa de tampografía", cost: extrasConfig.placa })
      break
    case "vidrio-metal":
      subtotal = calculateVidrioMetalRubberPrice(quantity, colors ?? 1)
      if (includeExtras?.placa) extras.push({ name: "Placa de tampografía", cost: extrasConfig.placa })
      break
    case "laser":
      subtotal = calculateGrabadoLaserPrice(quantity)
      break
    case "bordado":
      subtotal = calculateBordadoPrice(quantity, size ?? "5-12cm")
      if (includeExtras?.ponchado) extras.push({ name: "Ponchado de bordado", cost: extrasConfig.ponchado })
      break
  }

  if (includeExtras?.tratamiento) {
    extras.push({ name: "Tratamiento especial", cost: extrasConfig.tratamiento })
  }

  const extrasTotal = extras.reduce((sum, extra) => sum + extra.cost, 0)
  const total = subtotal + extrasTotal
  const margin = calculateMargin(quantity, config)
  const totalWithMargin = total / margin.divisor

  return {
    service,
    quantity,
    colors,
    size,
    subtotal,
    extras,
    total,
    totalWithMargin,
    margin: margin.label,
    pricePerUnit: total / quantity,
    pricePerUnitWithMargin: totalWithMargin / quantity,
  }
}

export function getServiceName(service: CotizadorService) {
  switch (service) {
    case "tampografia":
      return "Tampografía / Serigrafía"
    case "vidrio-metal":
      return "Vidrio / Metal / Rubber"
    case "laser":
      return "Grabado Láser"
    case "bordado":
      return "Bordado"
    default:
      return service
  }
}

