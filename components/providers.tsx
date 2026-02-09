"use client"

import { OrdersProvider } from "@/contexts/orders-context"
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"
import { AdminCmsGear } from "@/components/admin-cms-gear"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <OrdersProvider>
        <CartProvider>
          {children}
          <Toaster position="top-right" />
          <AdminCmsGear />
        </CartProvider>
      </OrdersProvider>
    </AuthProvider>
  )
}

