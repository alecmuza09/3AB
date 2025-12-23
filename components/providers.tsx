"use client"

import { OrdersProvider } from "@/contexts/orders-context"
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <OrdersProvider>
        <CartProvider>
          {children}
          <Toaster position="top-right" />
        </CartProvider>
      </OrdersProvider>
    </AuthProvider>
  )
}

