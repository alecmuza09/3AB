export interface QuantityRules {
  min: number
  multipleOf: number
}

export function clampPositiveInt(value: number, fallback: number = 1) {
  const n = Number.isFinite(value) ? Math.floor(value) : fallback
  return n > 0 ? n : fallback
}

export function normalizeQuantityToRules(quantity: number, rules: QuantityRules) {
  const min = clampPositiveInt(rules.min, 1)
  const multipleOf = clampPositiveInt(rules.multipleOf, 1)

  let q = clampPositiveInt(quantity, min)
  if (q < min) q = min

  if (multipleOf > 1) {
    const remainder = q % multipleOf
    if (remainder !== 0) {
      q = q + (multipleOf - remainder)
    }
  }

  return q
}

export function getQuantityValidationError(quantity: number, rules: QuantityRules) {
  const min = clampPositiveInt(rules.min, 1)
  const multipleOf = clampPositiveInt(rules.multipleOf, 1)

  const q = clampPositiveInt(quantity, 0)
  if (q < min) {
    return `La cantidad mínima es ${min}`
  }
  if (multipleOf > 1 && q % multipleOf !== 0) {
    return `La cantidad debe ser múltiplo de ${multipleOf}`
  }
  return null
}

