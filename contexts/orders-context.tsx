"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
  variationLabel?: string
  image?: string
}

export interface OrderContact {
  company?: string
  contactName: string
  email: string
  phone: string
}

export interface OrderShipping {
  method: string
  addressLine?: string
  neighborhood?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  notes?: string
}

export interface OrderBilling {
  billingSameAsShipping: boolean
  businessName?: string
  taxId?: string
  billingEmail?: string
  billingAddress?: string
}

export interface OrderRecord {
  id: string
  createdAt: string
  status: "En revisión" | "En producción" | "Enviado" | "Entregado" | "Cotización" | string
  total: number
  subtotal: number
  taxes: number
  shippingCost: number
  paymentMethod: "purchase" | "quote"
  contact: OrderContact
  shipping: OrderShipping
  billing?: OrderBilling
  items: OrderItem[]
}

interface OrdersContextType {
  orders: OrderRecord[]
  addOrder: (order: OrderRecord) => void
  clearOrders: () => void
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

const STORAGE_KEY = "orders"

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Verificar que estamos en el cliente antes de acceder a localStorage
  useEffect(() => {
    setIsMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setOrders(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Error loading orders from localStorage", error)
    }
  }, [])

  // Guardar en localStorage solo cuando estamos en el cliente
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
      } catch (error) {
        console.error("Error saving orders to localStorage", error)
      }
    }
  }, [orders, isMounted])

  const addOrder = (order: OrderRecord) => {
    setOrders((prev) => [order, ...prev])
  }

  const clearOrders = () => setOrders([])

  return (
    <OrdersContext.Provider value={{ orders, addOrder, clearOrders }}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider")
  }
  return context
}

