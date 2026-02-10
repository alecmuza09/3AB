"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import type { CotizadorConfig } from "@/lib/cotizador"
import { defaultCotizadorConfig } from "@/lib/cotizador"

interface CotizadorConfigContextType {
  config: CotizadorConfig
  loading: boolean
}

const CotizadorConfigContext = createContext<CotizadorConfigContextType | undefined>(undefined)

export function CotizadorConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<CotizadorConfig>(defaultCotizadorConfig)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/cotizador-config")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data?.margins && data?.extras) {
          setConfig(data)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <CotizadorConfigContext.Provider value={{ config, loading }}>
      {children}
    </CotizadorConfigContext.Provider>
  )
}

export function useCotizadorConfig() {
  const context = useContext(CotizadorConfigContext)
  if (context === undefined) {
    return { config: defaultCotizadorConfig, loading: false }
  }
  return context
}
