"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

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
  loadingOrders: boolean
  addOrder: (order: OrderRecord) => void
  clearOrders: () => void
  refreshOrders: () => Promise<void>
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

const STORAGE_KEY = "orders"

function mapApiOrderToRecord(apiOrder: any): OrderRecord {
  const items: OrderItem[] = (apiOrder.order_items || []).map((item: any) => ({
    productId: item.product_id,
    name: item.product_name,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    subtotal: item.subtotal,
    variationLabel: item.variation_label ?? undefined,
    image: item.image_url ?? undefined,
  }))

  return {
    id: apiOrder.order_number || apiOrder.id,
    createdAt: apiOrder.created_at,
    status: apiOrder.status,
    total: apiOrder.total,
    subtotal: apiOrder.subtotal,
    taxes: apiOrder.tax,
    shippingCost: apiOrder.shipping_cost,
    paymentMethod: apiOrder.payment_method,
    contact: apiOrder.contact_info || {},
    shipping: apiOrder.shipping_info || {},
    billing: apiOrder.billing_info ?? undefined,
    items,
  }
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fetchOrdersFromApi = async (userId: string) => {
    setLoadingOrders(true)
    try {
      const res = await fetch(`/api/orders?userId=${userId}`)
      if (!res.ok) throw new Error("Error al obtener pedidos")
      const data = await res.json()
      const mapped = (data.orders || []).map(mapApiOrderToRecord)
      setOrders(mapped)
    } catch (error) {
      console.error("Error fetching orders from API:", error)
      // Fallback a localStorage si la API falla
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) setOrders(JSON.parse(stored))
      } catch {}
    } finally {
      setLoadingOrders(false)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setOrders(JSON.parse(stored))
    } catch (error) {
      console.error("Error loading orders from localStorage", error)
    }
  }

  useEffect(() => {
    if (!isMounted) return
    if (user?.id) {
      fetchOrdersFromApi(user.id)
    } else {
      loadFromLocalStorage()
    }
  }, [user?.id, isMounted])

  // Solo persiste en localStorage cuando es invitado
  useEffect(() => {
    if (isMounted && !user?.id) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
      } catch (error) {
        console.error("Error saving orders to localStorage", error)
      }
    }
  }, [orders, isMounted, user?.id])

  const addOrder = (order: OrderRecord) => {
    setOrders((prev) => [order, ...prev])
  }

  const clearOrders = () => setOrders([])

  const refreshOrders = async () => {
    if (user?.id) {
      await fetchOrdersFromApi(user.id)
    }
  }

  return (
    <OrdersContext.Provider value={{ orders, loadingOrders, addOrder, clearOrders, refreshOrders }}>
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
