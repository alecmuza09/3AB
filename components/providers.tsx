"use client"

import { OrdersProvider } from "@/contexts/orders-context"
import { CartProvider } from "@/contexts/cart-context"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OrdersProvider>
      <CartProvider>
        {children}
        <Toaster position="top-right" />
      </CartProvider>
    </OrdersProvider>
  )
}

