"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import type { ProductVariation } from "@/lib/woocommerce-products"
import type { CotizadorConfig, CotizadorService, IncludeExtras, QuotationData } from "@/lib/cotizador"
import { generateQuotation } from "@/lib/cotizador"
import { useCotizadorConfig } from "@/contexts/cotizador-config-context"
import { getQuantityValidationError, normalizeQuantityToRules } from "@/lib/quantity"

export interface CartProduct {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  categoryId?: string | null
  minQuantity?: number
  multipleOf?: number
}

export type CartPricingMode = "fixed" | "cotizador"

export interface CartQuoteConfig {
  service: CotizadorService
  colors?: number
  size?: string
  includeExtras?: IncludeExtras
  config?: CotizadorConfig
}

export interface CartPricing {
  mode: CartPricingMode
  baseUnitPrice: number
  personalizationUnitPrice: number
  unitPrice: number
  quotation?: QuotationData
  quoteConfig?: CartQuoteConfig
}

export interface CartItem {
  key: string
  productId: string
  product: CartProduct
  variationId?: string
  variation?: ProductVariation
  quantity: number
  pricing: CartPricing
  customization?: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (args: {
    product: CartProduct
    quantity: number
    variationId?: string
    variation?: ProductVariation
    customization?: string
    quoteConfig?: CartQuoteConfig
  }) => { ok: boolean; error: string | null; adjustedQuantity?: number }
  removeFromCart: (itemKey: string) => void
  updateQuantity: (itemKey: string, quantity: number) => { ok: boolean; error: string | null; adjustedQuantity?: number }
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const { config: cotizadorConfig } = useCotizadorConfig()

  const quoteKeyFromConfig = (quoteConfig?: CartQuoteConfig) => {
    if (!quoteConfig) return "none"
    const c = quoteConfig
    const extras = c.includeExtras || {}
    return [
      `svc:${c.service}`,
      `col:${c.colors ?? ""}`,
      `size:${c.size ?? ""}`,
      `placa:${extras.placa ? 1 : 0}`,
      `ponchado:${extras.ponchado ? 1 : 0}`,
      `trat:${extras.tratamiento ? 1 : 0}`,
    ].join("|")
  }

  const normalizeRules = (product: CartProduct) => {
    return {
      min: product.minQuantity ?? 1,
      multipleOf: product.multipleOf ?? 1,
    }
  }

  const calculatePricing = (args: {
    product: CartProduct
    quantity: number
    quoteConfig?: CartQuoteConfig
  }): CartPricing => {
    const baseUnitPrice = Number(args.product.price || 0)

    if (!args.quoteConfig) {
      return {
        mode: "fixed",
        baseUnitPrice,
        personalizationUnitPrice: 0,
        unitPrice: baseUnitPrice,
      }
    }

    const qc = args.quoteConfig
    const quotation = generateQuotation(
      qc.service,
      args.quantity,
      qc.colors,
      qc.size,
      qc.includeExtras,
      qc.config || cotizadorConfig
    )
    const personalizationUnitPrice = quotation.pricePerUnitWithMargin
    const unitPrice = baseUnitPrice + personalizationUnitPrice

    return {
      mode: "cotizador",
      baseUnitPrice,
      personalizationUnitPrice,
      unitPrice,
      quotation,
      quoteConfig: qc,
    }
  }

  const buildItemKey = (args: {
    productId: string
    variationId?: string
    quoteConfig?: CartQuoteConfig
    customization?: string
  }) => {
    const variationPart = args.variationId || "base"
    const quotePart = quoteKeyFromConfig(args.quoteConfig)
    const customizationPart = (args.customization || "").trim().toLowerCase()
    return `${args.productId}:${variationPart}:${quotePart}:${customizationPart}`
  }

  const migrateCartItems = (raw: any): CartItem[] => {
    if (!Array.isArray(raw)) return []

    return raw
      .map((item: any) => {
        // Si ya está en el formato nuevo, aceptarlo
        if (item && typeof item === "object" && typeof item.key === "string" && item.pricing?.unitPrice != null) {
          return item as CartItem
        }

        // Formato viejo: { productId, product, variationId, variation, quantity, price, customization }
        const product = item?.product
        const productId = item?.productId || product?.id
        if (!productId || !product) return null

        const cartProduct: CartProduct = {
          id: productId,
          name: product.name || "Producto",
          description: product.description || "",
          price: Number(item.price ?? product.price ?? 0),
          image: product.image || product.image_url || "",
          category: product.category || "",
          categoryId: product.categoryId || product.category_id || null,
          minQuantity: product.minQuantity || product.min_quantity || 1,
          multipleOf: product.multipleOf || product.multiple_of || 1,
        }

        const quantity = Number(item.quantity || 1)
        const pricing: CartPricing = {
          mode: "fixed",
          baseUnitPrice: Number(item.price ?? cartProduct.price ?? 0),
          personalizationUnitPrice: 0,
          unitPrice: Number(item.price ?? cartProduct.price ?? 0),
        }

        const key = buildItemKey({
          productId: cartProduct.id,
          variationId: item.variationId,
          quoteConfig: undefined,
          customization: item.customization,
        })

        return {
          key,
          productId: cartProduct.id,
          product: cartProduct,
          variationId: item.variationId,
          variation: item.variation,
          quantity,
          pricing,
          customization: item.customization,
        } as CartItem
      })
      .filter(Boolean) as CartItem[]
  }

  // Verificar que estamos en el cliente
  useEffect(() => {
    setIsMounted(true)
    // Cargar carrito desde localStorage al montar
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(migrateCartItems(JSON.parse(savedCart)))
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie (solo en cliente)
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isMounted])

  const addToCart: CartContextType["addToCart"] = ({ product, quantity, variationId, variation, customization, quoteConfig }) => {
    const rules = normalizeRules(product)
    const error = getQuantityValidationError(quantity, rules)
    const normalizedQuantity = normalizeQuantityToRules(quantity, rules)

    if (error) {
      // No bloqueamos el flujo: normalizamos y devolvemos el error para que UI lo muestre
    }

    const itemKey = buildItemKey({
      productId: product.id,
      variationId,
      quoteConfig,
      customization,
    })

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.key === itemKey)

      if (existingIndex >= 0) {
        const updated = [...prevItems]
        const nextQty = normalizeQuantityToRules(updated[existingIndex].quantity + normalizedQuantity, rules)
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: nextQty,
          pricing: calculatePricing({ product, quantity: nextQty, quoteConfig }),
        }
        return updated
      }

      return [
        ...prevItems,
        {
          key: itemKey,
          productId: product.id,
          product,
          variationId,
          variation,
          quantity: normalizedQuantity,
          pricing: calculatePricing({ product, quantity: normalizedQuantity, quoteConfig }),
          customization,
        },
      ]
    })

    return { ok: true, error, adjustedQuantity: normalizedQuantity !== quantity ? normalizedQuantity : undefined }
  }

  const removeFromCart = (itemKey: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.key !== itemKey))
  }

  const updateQuantity: CartContextType["updateQuantity"] = (itemKey, quantity) => {
    let result: { ok: boolean; error: string | null; adjustedQuantity?: number } = { ok: true, error: null }

    setItems((prevItems) => {
      const target = prevItems.find((i) => i.key === itemKey)
      if (!target) {
        result = { ok: false, error: "Item no encontrado" }
        return prevItems
      }

      if (quantity <= 0) {
        result = { ok: true, error: null }
        return prevItems.filter((i) => i.key !== itemKey)
      }

      const rules = normalizeRules(target.product)
      const error = getQuantityValidationError(quantity, rules)
      const normalizedQuantity = normalizeQuantityToRules(quantity, rules)

      result = { ok: true, error, adjustedQuantity: normalizedQuantity !== quantity ? normalizedQuantity : undefined }

      return prevItems.map((item) => {
        if (item.key !== itemKey) return item
        return {
          ...item,
          quantity: normalizedQuantity,
          pricing: calculatePricing({
            product: item.product,
            quantity: normalizedQuantity,
            quoteConfig: item.pricing.quoteConfig,
          }),
        }
      })
    })

    return result
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.pricing.unitPrice || 0) * item.quantity, 0)
  }

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

