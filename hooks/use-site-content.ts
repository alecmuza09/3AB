"use client"

import { useState, useEffect, useCallback } from "react"

export function useSiteContent(pageSlug: string): {
  content: Record<string, string>
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
} {
  const [content, setContent] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContent = useCallback(async () => {
    if (!pageSlug) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/site-content?page=${encodeURIComponent(pageSlug)}`)
      const data = await res.json()
      setContent(typeof data === "object" && data !== null ? data : {})
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar contenido")
      setContent({})
    } finally {
      setLoading(false)
    }
  }, [pageSlug])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  return { content, loading, error, refetch: fetchContent }
}
