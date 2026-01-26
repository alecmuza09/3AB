import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "3A BRANDING | Compañía líder en marketing promocional",
  description:
    "La forma más fácil de comprar promocionales, conectando marcas, personas y momentos. Dale vida a tus ideas con 3A Branding.",
  generator: "3abranding.com",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
