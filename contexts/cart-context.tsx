"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { WooCommerceProduct, ProductVariation } from "@/lib/woocommerce-products"

export interface CartItem {
  productId: string
  product: WooCommerceProduct
  variationId?: string
  variation?: ProductVariation
  quantity: number
  price: number
  customization?: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: WooCommerceProduct, quantity: number, variationId?: string, customization?: string) => void
  removeFromCart: (productId: string, variationId?: string) => void
  updateQuantity: (productId: string, quantity: number, variationId?: string) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Verificar que estamos en el cliente
  useEffect(() => {
    setIsMounted(true)
    // Cargar carrito desde localStorage al montar
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
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

  const addToCart = (
    product: WooCommerceProduct,
    quantity: number,
    variationId?: string,
    customization?: string
  ) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.productId === product.id && item.variationId === variationId
      )

      if (existingIndex >= 0) {
        // Actualizar cantidad si ya existe
        const updated = [...prevItems]
        updated[existingIndex].quantity += quantity
        return updated
      } else {
        // Agregar nuevo item
        const variation = variationId
          ? product.variations?.find((v) => v.id === variationId)
          : undefined

        const price = variation?.price || product.price

        return [
          ...prevItems,
          {
            productId: product.id,
            product,
            variationId,
            variation,
            quantity,
            price,
            customization,
          },
        ]
      }
    })
  }

  const removeFromCart = (productId: string, variationId?: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.productId === productId && item.variationId === variationId)
      )
    )
  }

  const updateQuantity = (productId: string, quantity: number, variationId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variationId)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId && item.variationId === variationId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
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

