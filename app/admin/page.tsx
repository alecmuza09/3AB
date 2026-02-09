"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { WhatsappButton } from "@/components/whatsapp-button"
import { AdminGuard } from "@/components/auth/admin-guard"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import type { Database } from "@/lib/supabase-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Package,
  Plus,
  Upload,
  Download,
  Edit,
  Trash2,
  Search,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Tag,
  Truck,
  FileText,
  ImageIcon,
  Copy,
  Eye,
  Filter,
  Calendar,
  Mail,
  Phone,
  CreditCard,
  Shield,
  Award,
  UserCog,
  Gift,
  Plug,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { getIntegrationsStatus } from "@/lib/integrations-config"

interface Product {
  id: string
  sku: string | null
  name: string
  category: string
  categoryId: string | null
  price: number
  stock: number
  isActive: boolean
  minQuantity: number
  multipleOf: number
  attributes: any | null
  status: "active" | "inactive" | "low-stock"
  lastUpdated: string
}

interface InventoryMovement {
  id: string
  productName: string
  type: "entrada" | "salida" | "ajuste"
  quantity: number
  date: string
  reason: string
}

export default function AdminPage() {
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState("dashboard")
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [coupons, setCoupons] = useState<any[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageTicket: 0,
    newCustomersThisMonth: 0,
    revenueGrowth: 0,
    topProducts: [] as any[],
    lowStockProducts: [] as any[],
    pendingOrders: 0,
  })
  const [loadingStats, setLoadingStats] = useState(false)
  
  // Leer sección desde URL si existe
  useEffect(() => {
    const section = searchParams.get("section")
    if (section) {
      setActiveSection(section)
    }
  }, [searchParams])

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const supabase = getSupabaseClient()
      
      if (!supabase) {
        console.error("Supabase no está disponible")
        setLoadingUsers(false)
        return
      }

      // Obtener todos los perfiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (profilesError) {
        console.error("Error loading profiles:", profilesError)
        return
      }

      // Obtener estadísticas de pedidos para cada usuario
      const usersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Obtener pedidos del usuario
          const { data: orders, error: ordersError } = await supabase
            .from("orders")
            .select("id, total, created_at")
            .eq("user_id", profile.id)

          if (ordersError) {
            console.error("Error loading orders:", ordersError)
          }

          const ordersCount = orders?.length || 0
          const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0

          // Obtener último acceso desde auth.users (necesitarías una función server action para esto)
          // Por ahora usamos created_at del perfil
          const lastLogin = profile.updated_at || profile.created_at

          return {
            ...profile,
            orders: ordersCount,
            totalSpent,
            lastLogin,
          }
        })
      )

      setUsers(usersWithStats)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Cargar usuarios desde Supabase
  useEffect(() => {
    loadUsers()
  }, [])

  // Crear nuevo usuario
  const handleCreateUser = async () => {
    try {
      setCreatingUser(true)

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          full_name: newUser.full_name,
          phone: newUser.phone,
          role: newUser.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Error: ${data.error}`)
        setCreatingUser(false)
        return
      }

      // Recargar usuarios
      await loadUsers()

      // Limpiar formulario
      setNewUser({
        full_name: "",
        email: "",
        phone: "",
        role: "customer",
        password: "",
        sendEmail: true,
      })

      alert("Usuario creado exitosamente")
    } catch (error: any) {
      console.error("Error creating user:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setCreatingUser(false)
    }
  }

  // Actualizar rol de usuario
  const handleUpdateUserRole = async (userId: string, newRole: "customer" | "admin" | "staff") => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        alert("Supabase no está disponible")
        return
      }

      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId)

      if (error) {
        alert(`Error al actualizar rol: ${error.message}`)
        return
      }

      // Recargar usuarios
      await loadUsers()
      alert("Rol actualizado exitosamente")
    } catch (error: any) {
      console.error("Error updating role:", error)
      alert(`Error: ${error.message}`)
    }
  }

  // Eliminar usuario
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${userEmail}? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Error: ${data.error}`)
        return
      }


      // Recargar usuarios
      await loadUsers()
      alert("Usuario eliminado exitosamente")
    } catch (error: any) {
      console.error("Error deleting user:", error)
      alert(`Error: ${error.message}`)
    }
  }

  // Actualizar información del usuario
  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        alert("Supabase no está disponible")
        return
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editingUser.full_name,
          email: editingUser.email,
          phone: editingUser.phone || null,
          role: editingUser.role,
        })
        .eq("id", editingUser.id)

      if (error) {
        alert(`Error al actualizar usuario: ${error.message}`)
        return
      }

      // Recargar usuarios
      await loadUsers()
      setEditingUser(null)
      alert("Usuario actualizado exitosamente")
    } catch (error: any) {
      console.error("Error updating user:", error)
      alert(`Error: ${error.message}`)
    }
  }

  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [loadingMovements, setLoadingMovements] = useState(false)

  // Cargar productos desde Supabase
  const loadProducts = async () => {
    try {
      setLoadingProducts(true)
      const supabase = getSupabaseClient()
      if (!supabase) {
        console.error("Supabase no está disponible")
        return
      }

      const { data: productsData, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading products:", error)
        return
      }

      // Transformar datos para el formato esperado
      const formattedProducts = (productsData || []).map((product: any) => ({
        id: product.id,
        sku: product.sku || null,
        name: product.name,
        category: (product.category as any)?.name || "Sin categoría",
        categoryId: (product.category as any)?.id || product.category_id || null,
        price: Number(product.price || 0),
        stock: product.stock_quantity || 0,
        isActive: Boolean(product.is_active),
        minQuantity: Number(product.min_quantity || 1),
        multipleOf: Number(product.multiple_of || 1),
        attributes: product.attributes || null,
        status: !product.is_active 
          ? "inactive" 
          : (product.stock_quantity || 0) < 10 
            ? "low-stock" 
            : "active",
        lastUpdated: product.updated_at ? new Date(product.updated_at).toISOString().split("T")[0] : "",
      }))

      setProducts(formattedProducts)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoadingProducts(false)
    }
  }

  // Cargar movimientos de inventario (si existe la tabla)
  const loadMovements = async () => {
    try {
      setLoadingMovements(true)
      const supabase = getSupabaseClient()
      if (!supabase) {
        console.error("Supabase no está disponible")
        return
      }

      // Intentar cargar movimientos, si la tabla no existe, dejar array vacío
      const { data: movementsData, error } = await supabase
        .from("inventory_movements")
        .select(`
          *,
          product:products(name)
        `)
        .order("date", { ascending: false })
        .limit(50)

      if (error) {
        // Si la tabla no existe, simplemente no mostrar movimientos
        if (error.code === "PGRST116" || error.message.includes("does not exist")) {
          setMovements([])
          return
        }
        console.error("Error loading movements:", error)
        return
      }

      // Transformar datos
      const formattedMovements = (movementsData || []).map((movement: any) => ({
        id: movement.id,
        productName: (movement.product as any)?.name || "Producto",
        type: movement.type,
        quantity: movement.quantity || 0,
        date: movement.date || movement.created_at ? new Date(movement.date || movement.created_at).toISOString().split("T")[0] : "",
        reason: movement.reason || movement.notes || "",
      }))

      setMovements(formattedMovements)
    } catch (error) {
      console.error("Error loading movements:", error)
      setMovements([])
    } finally {
      setLoadingMovements(false)
    }
  }

  // Cargar productos cuando se abre la sección
  useEffect(() => {
    if (activeSection === "products" || activeSection === "inventory") {
      loadProducts()
    }
    if (activeSection === "inventory") {
      loadMovements()
    }
  }, [activeSection])

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [syncingProducts, setSyncingProducts] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [syncingPromocion, setSyncingPromocion] = useState(false)

  // Función para sincronizar productos desde la API de inventario
  const handleSyncProducts = async () => {
    if (!confirm('¿Estás seguro de sincronizar los productos desde la API de inventario? Esto puede tardar varios minutos.')) {
      return
    }

    setSyncingProducts(true)
    setSyncResult(null)

    try {
      const response = await fetch('/api/sync-products', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al sincronizar productos')
      }

      setSyncResult(data)
      
      if (data.success) {
        alert(`Sincronización completada exitosamente!\n\nCategorías creadas: ${data.data.categoriesCreated}\nCategorías actualizadas: ${data.data.categoriesUpdated}\nProductos creados: ${data.data.productsCreated}\nProductos actualizados: ${data.data.productsUpdated}\nVariaciones creadas: ${data.data.variationsCreated}\nVariaciones actualizadas: ${data.data.variationsUpdated}\nImágenes creadas: ${data.data.imagesCreated}`)
      } else {
        alert(`Sincronización completada con errores. Revisa la consola para más detalles.`)
      }
    } catch (error: any) {
      console.error('Error sincronizando productos:', error)
      alert(`Error al sincronizar productos: ${error.message}`)
      setSyncResult({ success: false, error: error.message })
    } finally {
      setSyncingProducts(false)
    }
  }

  // Sincronizar productos desde 3A Promoción (Promocionales en Línea)
  const handleSyncPromocion = async () => {
    if (!confirm('¿Sincronizar productos desde 3A Promoción (promocionalesenlinea.net)? Esto puede tardar unos minutos.')) {
      return
    }
    setSyncingPromocion(true)
    try {
      const response = await fetch('/api/sync-promocion', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error al sincronizar')
      if (data.success) {
        alert(`Sincronización 3A Promoción completada.\n\nCategorías creadas: ${data.data.categoriesCreated}\nCategorías actualizadas: ${data.data.categoriesUpdated}\nProductos creados: ${data.data.productsCreated}\nProductos actualizados: ${data.data.productsUpdated}\nImágenes creadas: ${data.data.imagesCreated}`)
      } else {
        alert('Sincronización completada con errores. Revisa la consola.')
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setSyncingPromocion(false)
    }
  }

  const [selectedCategory, setSelectedCategory] = useState("all")

  // =========================
  // Edición masiva de productos (tipo WooCommerce)
  // =========================
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [productDrafts, setProductDrafts] = useState<
    Record<
      string,
      Partial<{
        price: number
        minQuantity: number
        multipleOf: number
        isActive: boolean
      }>
    >
  >({})
  const [bulkPriceMode, setBulkPriceMode] = useState<"set" | "increasePercent" | "decreasePercent">("set")
  const [bulkPriceValue, setBulkPriceValue] = useState<string>("")
  const [bulkMinQuantity, setBulkMinQuantity] = useState<string>("")
  const [bulkMultipleOf, setBulkMultipleOf] = useState<string>("")
  const [savingBulkProducts, setSavingBulkProducts] = useState(false)

  const [relationsDialogOpen, setRelationsDialogOpen] = useState(false)
  const [relationsTab, setRelationsTab] = useState<"related" | "crossSell">("related")
  const [relationsSearch, setRelationsSearch] = useState("")
  const [relationsProduct, setRelationsProduct] = useState<Product | null>(null)
  const [relatedIdsDraft, setRelatedIdsDraft] = useState<string[]>([])
  const [crossSellIdsDraft, setCrossSellIdsDraft] = useState<string[]>([])

  const categories = [
    "Antiestrés",
    "Bolsas",
    "Calendarios",
    "Deportes",
    "Ecológicos",
    "Folders",
    "Gafetes",
    "Gorras",
    "Hogar",
    "Mochilas",
    "Oficina",
    "Pines",
    "Placas",
    "Playeras",
    "Plumas",
    "Portarretratos",
    "Reconocimientos",
    "Relojes",
    "Salud",
    "Tarjetas de Presentación",
    "Tazas",
    "Tecnología",
    "Termos",
    "Textiles",
    "USB",
    "Vasos",
  ]

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categoryOptions = Array.from(new Set([...(categories || []), ...products.map((p) => p.category).filter(Boolean)])).sort()

  const getDraft = (id: string) => productDrafts[id] || {}

  const setDraft = (id: string, patch: Partial<{ price: number; minQuantity: number; multipleOf: number; isActive: boolean }>) => {
    setProductDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }))
  }

  const isSelected = (id: string) => selectedProductIds.includes(id)

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedProductIds((prev) => (checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)))
  }

  const toggleSelectAllFiltered = (checked: boolean) => {
    if (!checked) {
      setSelectedProductIds((prev) => prev.filter((id) => !filteredProducts.some((p) => p.id === id)))
      return
    }
    setSelectedProductIds((prev) => Array.from(new Set([...prev, ...filteredProducts.map((p) => p.id)])))
  }

  const applyBulkEditsToSelection = () => {
    const selected = selectedProductIds
    if (selected.length === 0) return

    const priceValue = bulkPriceValue.trim() ? Number(bulkPriceValue) : null
    const minQ = bulkMinQuantity.trim() ? Number(bulkMinQuantity) : null
    const mult = bulkMultipleOf.trim() ? Number(bulkMultipleOf) : null

    setProductDrafts((prev) => {
      const next = { ...prev }
      for (const id of selected) {
        const product = products.find((p) => p.id === id)
        if (!product) continue
        const current = next[id] || {}

        if (priceValue !== null && Number.isFinite(priceValue)) {
          const base = typeof current.price === "number" ? current.price : product.price
          let computed = base
          if (bulkPriceMode === "set") computed = priceValue
          if (bulkPriceMode === "increasePercent") computed = base * (1 + priceValue / 100)
          if (bulkPriceMode === "decreasePercent") computed = base * (1 - priceValue / 100)
          next[id] = { ...current, price: Math.max(0, Number(computed.toFixed(2))) }
        }

        if (minQ !== null && Number.isFinite(minQ)) {
          next[id] = { ...(next[id] || current), minQuantity: Math.max(1, Math.floor(minQ)) }
        }

        if (mult !== null && Number.isFinite(mult)) {
          next[id] = { ...(next[id] || current), multipleOf: Math.max(1, Math.floor(mult)) }
        }
      }
      return next
    })
  }

  const setActiveForSelection = (isActive: boolean) => {
    const selected = selectedProductIds
    if (selected.length === 0) return
    setProductDrafts((prev) => {
      const next = { ...prev }
      for (const id of selected) {
        next[id] = { ...(next[id] || {}), isActive }
      }
      return next
    })
  }

  const saveProductEdits = async (productId: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      alert("Supabase no está disponible")
      return
    }

    const draft = productDrafts[productId]
    if (!draft || Object.keys(draft).length === 0) return

    const update: any = {}
    if (typeof draft.price === "number") update.price = Math.max(0, Number(draft.price.toFixed(2)))
    if (typeof draft.minQuantity === "number") update.min_quantity = Math.max(1, Math.floor(draft.minQuantity))
    if (typeof draft.multipleOf === "number") update.multiple_of = Math.max(1, Math.floor(draft.multipleOf))
    if (typeof draft.isActive === "boolean") update.is_active = draft.isActive

    const { error } = await supabase.from("products").update(update).eq("id", productId)
    if (error) {
      alert(`Error al guardar producto: ${error.message}`)
      return
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p
        const next: Product = {
          ...p,
          price: typeof draft.price === "number" ? Math.max(0, Number(draft.price.toFixed(2))) : p.price,
          minQuantity: typeof draft.minQuantity === "number" ? Math.max(1, Math.floor(draft.minQuantity)) : p.minQuantity,
          multipleOf: typeof draft.multipleOf === "number" ? Math.max(1, Math.floor(draft.multipleOf)) : p.multipleOf,
          isActive: typeof draft.isActive === "boolean" ? draft.isActive : p.isActive,
        }
        const stockQty = next.stock || 0
        next.status = !next.isActive ? "inactive" : stockQty < 10 ? "low-stock" : "active"
        return next
      })
    )

    setProductDrafts((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  const saveSelectedEdits = async () => {
    if (selectedProductIds.length === 0) return
    setSavingBulkProducts(true)
    try {
      for (const id of selectedProductIds) {
        if (productDrafts[id]) {
          // eslint-disable-next-line no-await-in-loop
          await saveProductEdits(id)
        }
      }
      alert("Cambios guardados para productos seleccionados")
    } finally {
      setSavingBulkProducts(false)
    }
  }

  const openRelationsEditor = (product: Product) => {
    const attrs = product.attributes || {}
    const related = Array.isArray(attrs.related_product_ids) ? attrs.related_product_ids.filter(Boolean) : []
    const crossSell = Array.isArray(attrs.cross_sell_product_ids) ? attrs.cross_sell_product_ids.filter(Boolean) : []
    setRelationsProduct(product)
    setRelatedIdsDraft(related)
    setCrossSellIdsDraft(crossSell)
    setRelationsSearch("")
    setRelationsTab("related")
    setRelationsDialogOpen(true)
  }

  const toggleIdInList = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id]

  const saveRelations = async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      alert("Supabase no está disponible")
      return
    }
    if (!relationsProduct) return

    const current = relationsProduct.attributes || {}
    const nextAttributes = {
      ...current,
      related_product_ids: relatedIdsDraft,
      cross_sell_product_ids: crossSellIdsDraft,
    }

    const { error } = await supabase
      .from("products")
      .update({ attributes: nextAttributes })
      .eq("id", relationsProduct.id)

    if (error) {
      alert(`Error al guardar venta cruzada/relacionados: ${error.message}`)
      return
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === relationsProduct.id ? { ...p, attributes: nextAttributes } : p))
    )
    setRelationsDialogOpen(false)
    setRelationsProduct(null)
  }

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.category && newProduct.price && newProduct.stock) {
      const stock = Number.parseInt(newProduct.stock)
      const product: Product = {
        id: Date.now().toString(),
        sku: null,
        name: newProduct.name,
        category: newProduct.category,
        categoryId: null,
        price: Number.parseFloat(newProduct.price),
        stock,
        isActive: true,
        minQuantity: 1,
        multipleOf: 1,
        attributes: null,
        status: stock > 10 ? "active" : "low-stock",
        lastUpdated: new Date().toISOString().split("T")[0],
      }
      setProducts([...products, product])
      setNewProduct({ name: "", category: "", price: "", stock: "", description: "" })
    }
  }

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>
      case "low-stock":
        return <Badge className="bg-yellow-100 text-yellow-800">Stock Bajo</Badge>
      case "inactive":
        return <Badge className="bg-primary/10 text-primary">Inactivo</Badge>
      default:
        return <Badge>Desconocido</Badge>
    }
  }

  const getMovementBadge = (type: string) => {
    switch (type) {
      case "entrada":
        return <Badge className="bg-green-100 text-green-800">Entrada</Badge>
      case "salida":
        return <Badge className="bg-primary/10 text-primary">Salida</Badge>
      case "ajuste":
        return <Badge className="bg-blue-100 text-blue-800">Ajuste</Badge>
      default:
        return <Badge>Desconocido</Badge>
    }
  }

  // Cargar usuarios desde Supabase - se define después

  // Cargar pedidos desde Supabase
  const loadOrders = async () => {
    try {
      setLoadingOrders(true)
      const supabase = getSupabaseClient()
      if (!supabase) {
        console.error("Supabase no está disponible")
        return
      }

      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) {
        console.error("Error loading orders:", error)
        return
      }

      // Obtener conteo de items para cada pedido
      const orderIds = (ordersData || []).map((o: any) => o.id)
      const { data: orderItemsData } = await supabase
        .from("order_items")
        .select("order_id")
        .in("order_id", orderIds)

      // Contar items por pedido
      const itemsCountByOrder: Record<string, number> = {}
      ;(orderItemsData || []).forEach((item: any) => {
        itemsCountByOrder[item.order_id] = (itemsCountByOrder[item.order_id] || 0) + 1
      })

      // Transformar datos para el formato esperado
      const formattedOrders = (ordersData || []).map((order: any) => ({
        id: order.order_number || order.id,
        customer: (order.contact_info as any)?.contactName || "Cliente",
        email: (order.contact_info as any)?.email || "",
        total: Number(order.total || 0),
        status: order.status,
        date: order.created_at ? new Date(order.created_at).toISOString().split("T")[0] : "",
        items: itemsCountByOrder[order.id] || 0,
        orderData: order,
      }))

      setOrders(formattedOrders)
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoadingOrders(false)
    }
  }

  // Cargar clientes desde Supabase
  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true)
      const supabase = getSupabaseClient()
      if (!supabase) {
        console.error("Supabase no está disponible")
        return
      }

      // Obtener perfiles de clientes
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "customer")
        .order("created_at", { ascending: false })

      if (profilesError) {
        console.error("Error loading profiles:", profilesError)
        return
      }

      // Obtener estadísticas de pedidos para cada cliente
      const customersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: userOrders, error: ordersError } = await supabase
            .from("orders")
            .select("id, total, created_at")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false })

          if (ordersError) {
            console.error("Error loading orders for customer:", ordersError)
          }

          const totalOrders = userOrders?.length || 0
          const totalSpent = userOrders?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0
          const lastOrder = userOrders?.[0]?.created_at || null

          return {
            id: profile.id,
            name: profile.full_name || profile.email || "Cliente",
            email: profile.email || "",
            phone: profile.phone || "",
            totalOrders,
            totalSpent,
            lastOrder: lastOrder ? new Date(lastOrder).toISOString().split("T")[0] : "",
            status: totalOrders > 0 ? "active" : "inactive",
          }
        })
      )

      setCustomers(customersWithStats)
    } catch (error) {
      console.error("Error loading customers:", error)
    } finally {
      setLoadingCustomers(false)
    }
  }

  // Cargar cupones (si existe la tabla)
  const loadCoupons = async () => {
    try {
      setLoadingCoupons(true)
      const supabase = getSupabaseClient()
      if (!supabase) {
        console.error("Supabase no está disponible")
        return
      }

      // Intentar cargar cupones, si la tabla no existe, dejar array vacío
      const { data: couponsData, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        // Si la tabla no existe, simplemente no mostrar cupones
        if (error.code === "PGRST116" || error.message.includes("does not exist")) {
          setCoupons([])
          return
        }
        console.error("Error loading coupons:", error)
        return
      }

      setCoupons(couponsData || [])
    } catch (error) {
      console.error("Error loading coupons:", error)
      setCoupons([])
    } finally {
      setLoadingCoupons(false)
    }
  }

  // Cargar estadísticas del dashboard
  const loadDashboardStats = async () => {
    try {
      setLoadingStats(true)
      const supabase = getSupabaseClient()
      if (!supabase) {
        console.error("Supabase no está disponible")
        return
      }

      // Obtener todos los pedidos
      const { data: allOrders, error: ordersError } = await supabase
        .from("orders")
        .select("total, status, created_at")

      if (ordersError) {
        console.error("Error loading orders for stats:", ordersError)
      }

      // Calcular estadísticas
      const totalRevenue = (allOrders || []).reduce((sum, order) => sum + Number(order.total || 0), 0)
      const totalOrders = (allOrders || []).length
      const pendingOrders = (allOrders || []).filter((o: any) => 
        ["pending", "confirmed"].includes(o.status)
      ).length

      // Obtener clientes
      const { data: customersData } = await supabase
        .from("profiles")
        .select("created_at")
        .eq("role", "customer")

      const totalCustomers = customersData?.length || 0
      
      // Clientes nuevos este mes
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const newCustomersThisMonth = (customersData || []).filter((c: any) => 
        new Date(c.created_at) >= firstDayOfMonth
      ).length

      // Ticket promedio
      const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Obtener productos con stock bajo
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, stock_quantity")
        .eq("is_active", true)
        .lt("stock_quantity", 10)

      const lowStockProducts = (productsData || []).map((p: any) => p.name)

      // Obtener productos más vendidos (basado en order_items)
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_id, quantity, price")

      // Obtener nombres de productos
      const productIds = [...new Set((orderItems || []).map((item: any) => item.product_id).filter(Boolean))]
      const { data: productsForSales } = await supabase
        .from("products")
        .select("id, name")
        .in("id", productIds)

      const productMap = new Map((productsForSales || []).map((p: any) => [p.id, p.name]))

      // Agrupar por producto
      const productSales: Record<string, { name: string; sales: number; revenue: number }> = {}
      ;(orderItems || []).forEach((item: any) => {
        const productId = item.product_id
        const productName = productMap.get(productId) || "Producto"
        if (!productSales[productId]) {
          productSales[productId] = { name: productName, sales: 0, revenue: 0 }
        }
        productSales[productId].sales += item.quantity || 0
        productSales[productId].revenue += (item.quantity || 0) * Number(item.price || 0)
      })

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      setDashboardStats({
        totalRevenue,
        totalOrders,
        totalCustomers,
        averageTicket,
        newCustomersThisMonth,
        revenueGrowth: 0, // Calcular si hay datos históricos
        topProducts,
        lowStockProducts,
        pendingOrders,
      })
    } catch (error) {
      console.error("Error loading dashboard stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  // Cargar datos cuando cambia la sección activa
  useEffect(() => {
    if (activeSection === "orders" || activeSection === "dashboard") {
      loadOrders()
    }
    if (activeSection === "customers" || activeSection === "dashboard") {
      loadCustomers()
    }
    if (activeSection === "coupons") {
      loadCoupons()
    }
    if (activeSection === "dashboard") {
      loadDashboardStats()
    }
  }, [activeSection])

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Procesando</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>
      case "cancelled":
        return <Badge className="bg-primary/10 text-primary">Cancelado</Badge>
      default:
        return <Badge>Desconocido</Badge>
    }
  }

  type UserWithStats = Database["public"]["Tables"]["profiles"]["Row"] & {
    orders: number
    totalSpent: number
    lastLogin: string | null
  }

  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [creatingUser, setCreatingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null)
  const { user: currentUser } = useAuth()

  // Estado para el formulario de nuevo usuario
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "customer" as "customer" | "admin" | "staff",
    password: "",
    sendEmail: true,
  })

  const roles = [
    {
      id: "superadmin",
      name: "Superadministrador",
      description: "Acceso completo al sistema, puede modificar configuraciones críticas",
      permissions: [
        "Gestión completa de usuarios",
        "Modificar configuraciones del sistema",
        "Acceso a todos los reportes",
        "Gestión de roles y permisos",
        "Configuración de precios",
        "Gestión de integraciones",
      ],
      color: "purple",
      icon: Shield,
    },
    {
      id: "admin",
      name: "Administrador",
      description: "Gestión general de la tienda y operaciones",
      permissions: [
        "Gestión de productos",
        "Gestión de pedidos",
        "Gestión de clientes",
        "Ver reportes",
        "Gestión de inventario",
        "Configuración de envíos",
      ],
      color: "blue",
      icon: UserCog,
    },
    {
      id: "manager",
      name: "Gestor de Tienda",
      description: "Gestión de productos e inventario",
      permissions: [
        "Agregar/editar productos",
        "Gestión de inventario",
        "Ver pedidos",
        "Gestión de categorías",
        "Cargas masivas",
      ],
      color: "green",
      icon: Package,
    },
    {
      id: "user",
      name: "Usuario",
      description: "Cliente regular con acceso estándar",
      permissions: ["Ver catálogo", "Realizar pedidos", "Ver historial", "Acumular puntos"],
      color: "gray",
      icon: Users,
    },
    {
      id: "corporate",
      name: "Cliente Corporativo",
      description: "Cliente con compras mayores a $10,000 MXN con beneficios especiales",
      permissions: [
        "Precios preferenciales",
        "Descuentos por volumen",
        "Puntos dobles",
        "Soporte prioritario",
        "Acceso a productos exclusivos",
        "Crédito empresarial",
      ],
      color: "amber",
      icon: Award,
    },
  ]

  const [productRoleAssociations, setProductRoleAssociations] = useState([
    {
      productId: "1",
      productName: "Taza Personalizada Premium",
      allowedRoles: ["user", "corporate", "admin", "manager", "superadmin"],
      priceByRole: {
        user: 150,
        corporate: 135,
        admin: 120,
        manager: 120,
        superadmin: 120,
      },
    },
    {
      productId: "2",
      productName: "USB Corporativo 32GB",
      allowedRoles: ["corporate", "admin", "manager", "superadmin"],
      priceByRole: {
        corporate: 280,
        admin: 250,
        manager: 250,
        superadmin: 250,
      },
    },
  ])

  const [rewardsProgram, setRewardsProgram] = useState({
    enabled: true,
    pointsPerPeso: 1,
    corporateMultiplier: 2,
    minimumRedemption: 100,
    expirationDays: 365,
  })

  const getRoleBadge = (role: "customer" | "admin" | "staff" | string) => {
    const roleConfig: Record<string, { label: string; color: string }> = {
      customer: { label: "Cliente", color: "bg-blue-100 text-blue-800" },
      admin: { label: "Administrador", color: "bg-purple-100 text-purple-800" },
      staff: { label: "Personal", color: "bg-green-100 text-green-800" },
    }

    const config = roleConfig[role] || { label: "Desconocido", color: "bg-gray-100 text-gray-800" }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <WhatsappButton />
        
        <div className="md:ml-64 p-6">
          <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Panel de Administración</h1>
            <p className="text-muted-foreground">Sistema completo de gestión para 3A Branding</p>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-10 h-auto">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Productos</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Pedidos</span>
              </TabsTrigger>
              <TabsTrigger value="customers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Clientes</span>
              </TabsTrigger>
              <TabsTrigger value="users-roles" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Usuarios</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span className="hidden sm:inline">Inventario</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Cupones</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Reportes</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Plug className="h-4 w-4" />
                <span className="hidden sm:inline">Integraciones</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Configuración</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loadingStats ? (
                      <div className="text-2xl font-bold">...</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">${Math.round(dashboardStats.totalRevenue).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total acumulado</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loadingStats ? (
                      <div className="text-2xl font-bold">...</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{dashboardStats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">Total de pedidos</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loadingStats ? (
                      <div className="text-2xl font-bold">...</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{dashboardStats.totalCustomers}</div>
                        <p className="text-xs text-green-600">+{dashboardStats.newCustomersThisMonth} nuevos este mes</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$798</div>
                    <p className="text-xs text-green-600">+5.3% vs mes anterior</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts and Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Productos Más Vendidos</CardTitle>
                    <CardDescription>Top 5 productos del mes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingStats ? (
                      <div className="text-center py-4 text-muted-foreground">Cargando...</div>
                    ) : dashboardStats.topProducts.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardStats.topProducts.map((product, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.sales} unidades vendidas</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">${Math.round(product.revenue).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">No hay datos de ventas aún</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pedidos Recientes</CardTitle>
                    <CardDescription>Últimos 5 pedidos realizados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingOrders ? (
                      <div className="text-center py-4 text-muted-foreground">Cargando...</div>
                    ) : orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order.id} className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{order.id}</p>
                              <p className="text-xs text-muted-foreground">{order.customer}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-sm font-semibold">${order.total.toLocaleString()}</p>
                              {getOrderStatusBadge(order.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">No hay pedidos aún</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Alerts */}
              <Card className="border-yellow-200 bg-yellow-50/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <CardTitle className="text-yellow-900">Alertas del Sistema</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardStats.lowStockProducts.length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-yellow-600 mt-2" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">
                            {dashboardStats.lowStockProducts.length} producto{dashboardStats.lowStockProducts.length !== 1 ? 's' : ''} con stock bajo requieren reposición
                          </p>
                          <p className="text-xs text-yellow-700">
                            {dashboardStats.lowStockProducts.slice(0, 3).join(", ")}
                            {dashboardStats.lowStockProducts.length > 3 && ` y ${dashboardStats.lowStockProducts.length - 3} más`}
                          </p>
                        </div>
                      </div>
                    )}
                    {dashboardStats.pendingOrders > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-yellow-600 mt-2" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">
                            {dashboardStats.pendingOrders} pedido{dashboardStats.pendingOrders !== 1 ? 's' : ''} pendiente{dashboardStats.pendingOrders !== 1 ? 's' : ''} de procesamiento
                          </p>
                          <p className="text-xs text-yellow-700">Revisa los pedidos pendientes para evitar retrasos</p>
                        </div>
                      </div>
                    )}
                    {dashboardStats.lowStockProducts.length === 0 && dashboardStats.pendingOrders === 0 && (
                      <div className="text-sm text-muted-foreground">No hay alertas en este momento</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products Management - Enhanced */}
            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gestión de Productos</CardTitle>
                      <CardDescription>Administra el catálogo completo de productos</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleSyncProducts}
                        disabled={syncingProducts || syncingPromocion}
                      >
                        {syncingProducts ? (
                          <>
                            <Package className="h-4 w-4 mr-2 animate-spin" />
                            Sincronizando...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Sincronizar desde 4Promotional
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleSyncPromocion}
                        disabled={syncingProducts || syncingPromocion}
                      >
                        {syncingPromocion ? (
                          <>
                            <Package className="h-4 w-4 mr-2 animate-spin" />
                            Sincronizando 3A Promoción...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Sincronizar desde 3A Promoción
                          </>
                        )}
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Producto
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Nuevo Producto</DialogTitle>
                            <DialogDescription>Agrega un nuevo producto con información completa</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                              <h3 className="font-semibold">Información Básica</h3>
                              <div>
                                <Label htmlFor="name">Nombre del Producto *</Label>
                                <Input
                                  id="name"
                                  value={newProduct.name}
                                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                  placeholder="Ej: Taza Personalizada Premium"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="sku">SKU</Label>
                                  <Input id="sku" placeholder="PROD-001" />
                                </div>
                                <div>
                                  <Label htmlFor="category">Categoría *</Label>
                                  <Select
                                    value={newProduct.category}
                                    onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categoryOptions.map((category) => (
                                        <SelectItem key={category} value={category}>
                                          {category}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                  id="description"
                                  value={newProduct.description}
                                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                  placeholder="Descripción detallada del producto..."
                                  rows={4}
                                />
                              </div>
                            </div>

                            <Separator />

                            {/* Pricing */}
                            <div className="space-y-4">
                              <h3 className="font-semibold">Precios</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="price">Precio Base (MXN) *</Label>
                                  <Input
                                    id="price"
                                    type="number"
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                    placeholder="150.00"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="comparePrice">Precio de Comparación</Label>
                                  <Input id="comparePrice" type="number" placeholder="200.00" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Precios por Volumen</Label>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <Input placeholder="50+ unidades" />
                                  <Input placeholder="100+ unidades" />
                                  <Input placeholder="500+ unidades" />
                                </div>
                              </div>
                            </div>

                            <Separator />

                            {/* Inventory */}
                            <div className="space-y-4">
                              <h3 className="font-semibold">Inventario</h3>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label htmlFor="stock">Stock Actual *</Label>
                                  <Input
                                    id="stock"
                                    type="number"
                                    value={newProduct.stock}
                                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                    placeholder="50"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="minStock">Stock Mínimo</Label>
                                  <Input id="minStock" type="number" placeholder="10" />
                                </div>
                                <div>
                                  <Label htmlFor="maxStock">Stock Máximo</Label>
                                  <Input id="maxStock" type="number" placeholder="500" />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch id="trackInventory" defaultChecked />
                                <Label htmlFor="trackInventory">Rastrear inventario</Label>
                              </div>
                            </div>

                            <Separator />

                            {/* Images */}
                            <div className="space-y-4">
                              <h3 className="font-semibold">Imágenes</h3>
                              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground mb-2">
                                  Arrastra imágenes o haz clic para seleccionar
                                </p>
                                <Button variant="outline" size="sm">
                                  Seleccionar Imágenes
                                </Button>
                              </div>
                            </div>

                            <Separator />

                            {/* Variants */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Variantes</h3>
                                <Button variant="outline" size="sm">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Agregar Variante
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Agrega variantes como colores, tamaños, materiales, etc.
                              </p>
                            </div>

                            <Button onClick={handleAddProduct} className="w-full bg-primary hover:bg-primary/90">
                              Crear Producto
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Buscar por nombre, SKU o descripción..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Más Filtros
                    </Button>
                  </div>

                  {/* Bulk actions (WooCommerce-like) */}
                  {selectedProductIds.length > 0 && (
                    <Card className="mb-6 bg-muted/30 border-primary/20">
                      <CardContent className="py-4">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                          <div className="text-sm font-medium">
                            {selectedProductIds.length} seleccionado{selectedProductIds.length !== 1 ? "s" : ""}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 flex-1">
                            <Select value={bulkPriceMode} onValueChange={(v) => setBulkPriceMode(v as any)}>
                              <SelectTrigger className="w-full sm:w-56">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="set">Fijar precio</SelectItem>
                                <SelectItem value="increasePercent">Aumentar %</SelectItem>
                                <SelectItem value="decreasePercent">Disminuir %</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder={bulkPriceMode === "set" ? "Precio (MXN)" : "Porcentaje (%)"}
                              value={bulkPriceValue}
                              onChange={(e) => setBulkPriceValue(e.target.value)}
                              className="w-full sm:w-44"
                            />
                            <Input
                              type="number"
                              placeholder="Mínimo"
                              value={bulkMinQuantity}
                              onChange={(e) => setBulkMinQuantity(e.target.value)}
                              className="w-full sm:w-32"
                            />
                            <Input
                              type="number"
                              placeholder="Múltiplo"
                              value={bulkMultipleOf}
                              onChange={(e) => setBulkMultipleOf(e.target.value)}
                              className="w-full sm:w-32"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" onClick={applyBulkEditsToSelection}>
                              Aplicar
                            </Button>
                            <Button variant="outline" onClick={() => setActiveForSelection(true)}>
                              Activar
                            </Button>
                            <Button variant="outline" onClick={() => setActiveForSelection(false)}>
                              Desactivar
                            </Button>
                            <Button onClick={saveSelectedEdits} disabled={savingBulkProducts}>
                              {savingBulkProducts ? "Guardando..." : "Guardar seleccionados"}
                            </Button>
                            <Button variant="ghost" onClick={() => setSelectedProductIds([])}>
                              Limpiar
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Tip: Usa “Aplicar” para preparar cambios (drafts) y luego “Guardar seleccionados”.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Products Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={
                                filteredProducts.length > 0 &&
                                filteredProducts.every((p) => selectedProductIds.includes(p.id))
                              }
                              onChange={(e) => toggleSelectAllFiltered(e.target.checked)}
                            />
                          </TableHead>
                          <TableHead>Producto</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Mínimo</TableHead>
                          <TableHead>Múltiplo</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Rel./Cruzada</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingProducts ? (
                          <TableRow>
                            <TableCell colSpan={11} className="text-center py-8">
                              <div className="flex flex-col items-center gap-2">
                                <Package className="h-8 w-8 text-muted-foreground animate-pulse" />
                                <p className="text-sm text-muted-foreground">Cargando productos...</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={11} className="text-center py-8">
                              <div className="flex flex-col items-center gap-2">
                                <Package className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">No hay productos disponibles</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredProducts.map((product) => {
                            const draft = getDraft(product.id)
                            const priceValue = typeof draft.price === "number" ? draft.price : product.price
                            const minQtyValue =
                              typeof draft.minQuantity === "number" ? draft.minQuantity : product.minQuantity
                            const multipleValue =
                              typeof draft.multipleOf === "number" ? draft.multipleOf : product.multipleOf
                            const activeValue =
                              typeof draft.isActive === "boolean" ? draft.isActive : product.isActive

                            const attrs = product.attributes || {}
                            const relatedCount = Array.isArray(attrs.related_product_ids) ? attrs.related_product_ids.length : 0
                            const crossSellCount = Array.isArray(attrs.cross_sell_product_ids) ? attrs.cross_sell_product_ids.length : 0

                            return (
                              <TableRow key={product.id}>
                                <TableCell>
                                  <input
                                    type="checkbox"
                                    className="rounded"
                                    checked={isSelected(product.id)}
                                    onChange={(e) => toggleSelect(product.id, e.target.checked)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{product.name}</p>
                                      <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {product.sku || `SKU-${product.id.slice(0, 8)}`}
                                  </code>
                                </TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell className="w-40">
                                  <Input
                                    type="number"
                                    value={Number.isFinite(priceValue) ? String(priceValue) : ""}
                                    onChange={(e) => setDraft(product.id, { price: Number(e.target.value || 0) })}
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell className="w-28">
                                  <Input
                                    type="number"
                                    value={String(minQtyValue || 1)}
                                    onChange={(e) => setDraft(product.id, { minQuantity: Number(e.target.value || 1) })}
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell className="w-28">
                                  <Input
                                    type="number"
                                    value={String(multipleValue || 1)}
                                    onChange={(e) => setDraft(product.id, { multipleOf: Number(e.target.value || 1) })}
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span>{product.stock}</span>
                                    {product.stock < 10 && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(activeValue ? product.status : "inactive")}
                                    <Switch
                                      checked={activeValue}
                                      onCheckedChange={(checked) => setDraft(product.id, { isActive: checked })}
                                    />
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {multipleValue > 1 ? `Múltiplos de ${multipleValue}` : "Sin múltiplos"} ·{" "}
                                    {minQtyValue > 1 ? `Min ${minQtyValue}` : "Min 1"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="text-xs text-muted-foreground">
                                      Rel: <span className="font-semibold text-foreground">{relatedCount}</span> · Cruzada:{" "}
                                      <span className="font-semibold text-foreground">{crossSellCount}</span>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openRelationsEditor(product)}
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Editar
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Guardar cambios"
                                      onClick={() => saveProductEdits(product.id)}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" title="Ver">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" title="Editar">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" title="Duplicar">
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="text-primary hover:text-primary/80"
                                      title="Eliminar"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {filteredProducts.length} de {products.length} productos
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled>
                        Anterior
                      </Button>
                      <Button variant="outline" size="sm">
                        Siguiente
                      </Button>
                    </div>
                  </div>

                  {/* Editor de relacionados / venta cruzada */}
                  <Dialog
                    open={relationsDialogOpen}
                    onOpenChange={(open) => {
                      setRelationsDialogOpen(open)
                      if (!open) {
                        setRelationsProduct(null)
                        setRelatedIdsDraft([])
                        setCrossSellIdsDraft([])
                        setRelationsSearch("")
                      }
                    }}
                  >
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Relacionados y venta cruzada</DialogTitle>
                        <DialogDescription>
                          Define productos relacionados y venta cruzada para{" "}
                          <span className="font-medium">{relationsProduct?.name || "el producto"}</span>.
                        </DialogDescription>
                      </DialogHeader>

                      <Tabs value={relationsTab} onValueChange={(v) => setRelationsTab(v as any)} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="related">Relacionados</TabsTrigger>
                          <TabsTrigger value="crossSell">Venta cruzada</TabsTrigger>
                        </TabsList>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            placeholder="Buscar productos..."
                            value={relationsSearch}
                            onChange={(e) => setRelationsSearch(e.target.value)}
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (relationsTab === "related") setRelatedIdsDraft([])
                              if (relationsTab === "crossSell") setCrossSellIdsDraft([])
                            }}
                          >
                            Limpiar selección
                          </Button>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Seleccionados:{" "}
                          {relationsTab === "related" ? relatedIdsDraft.length : crossSellIdsDraft.length}
                        </div>

                        <div className="rounded-md border max-h-[50vh] overflow-y-auto">
                          <div className="p-2 space-y-1">
                            {products
                              .filter((p) => p.id !== relationsProduct?.id)
                              .filter((p) => {
                                if (!relationsSearch.trim()) return true
                                const term = relationsSearch.toLowerCase()
                                return (
                                  p.name.toLowerCase().includes(term) ||
                                  (p.sku || "").toLowerCase().includes(term) ||
                                  p.category.toLowerCase().includes(term)
                                )
                              })
                              .slice(0, 200)
                              .map((p) => {
                                const checked =
                                  relationsTab === "related"
                                    ? relatedIdsDraft.includes(p.id)
                                    : crossSellIdsDraft.includes(p.id)
                                return (
                                  <label
                                    key={p.id}
                                    className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4"
                                      checked={checked}
                                      onChange={() => {
                                        if (relationsTab === "related") {
                                          setRelatedIdsDraft((prev) => toggleIdInList(prev, p.id))
                                        } else {
                                          setCrossSellIdsDraft((prev) => toggleIdInList(prev, p.id))
                                        }
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium line-clamp-1">{p.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {p.category}
                                        </Badge>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {p.sku ? `SKU: ${p.sku}` : `ID: ${p.id.slice(0, 8)}`} · $
                                        {Number(p.price || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                      </div>
                                    </div>
                                  </label>
                                )
                              })}
                          </div>
                        </div>
                      </Tabs>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setRelationsDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={saveRelations}>Guardar</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Management */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gestión de Pedidos</CardTitle>
                      <CardDescription>Administra todos los pedidos de clientes</CardDescription>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Pedidos
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Order Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        {loadingOrders ? (
                          <div className="text-2xl font-bold">...</div>
                        ) : (
                          <>
                            <div className="text-2xl font-bold">
                              {orders.filter((o) => ["pending", "confirmed"].includes(o.status)).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Pendientes</p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        {loadingOrders ? (
                          <div className="text-2xl font-bold">...</div>
                        ) : (
                          <>
                            <div className="text-2xl font-bold">
                              {orders.filter((o) => ["in_production", "ready_to_ship"].includes(o.status)).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Procesando</p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        {loadingOrders ? (
                          <div className="text-2xl font-bold">...</div>
                        ) : (
                          <>
                            <div className="text-2xl font-bold">
                              {orders.filter((o) => o.status === "delivered").length}
                            </div>
                            <p className="text-xs text-muted-foreground">Completados</p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        {loadingOrders ? (
                          <div className="text-2xl font-bold">...</div>
                        ) : (
                          <>
                            <div className="text-2xl font-bold">
                              {orders.filter((o) => o.status === "cancelled").length}
                            </div>
                            <p className="text-xs text-muted-foreground">Cancelados</p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input placeholder="Buscar por ID, cliente o email..." className="pl-10" />
                      </div>
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="pending">Pendientes</SelectItem>
                        <SelectItem value="processing">Procesando</SelectItem>
                        <SelectItem value="completed">Completados</SelectItem>
                        <SelectItem value="cancelled">Cancelados</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="recent">
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Más recientes</SelectItem>
                        <SelectItem value="oldest">Más antiguos</SelectItem>
                        <SelectItem value="highest">Mayor valor</SelectItem>
                        <SelectItem value="lowest">Menor valor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Orders Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pedido</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingOrders ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex flex-col items-center gap-2">
                                <ShoppingCart className="h-8 w-8 text-muted-foreground animate-pulse" />
                                <p className="text-sm text-muted-foreground">Cargando pedidos...</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : orders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex flex-col items-center gap-2">
                                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">No hay pedidos disponibles</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.id}</p>
                                <p className="text-xs text-muted-foreground">{order.date}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.customer}</p>
                                <p className="text-xs text-muted-foreground">{order.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell>{order.items} productos</TableCell>
                            <TableCell className="font-semibold">${order.total.toLocaleString()}</TableCell>
                            <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" title="Ver detalles">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" title="Editar">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customers Management */}
            <TabsContent value="customers" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gestión de Clientes</CardTitle>
                      <CardDescription>Base de datos completa de clientes</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Cliente
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Customer Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{customers.length}</div>
                        <p className="text-xs text-muted-foreground">Total Clientes</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                          {customers.filter((c) => c.status === "active").length}
                        </div>
                        <p className="text-xs text-muted-foreground">Activos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        {loadingCustomers ? (
                          <div className="text-2xl font-bold">...</div>
                        ) : (
                          <>
                            <div className="text-2xl font-bold">{dashboardStats.newCustomersThisMonth}</div>
                            <p className="text-xs text-muted-foreground">Nuevos este mes</p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        {loadingCustomers ? (
                          <div className="text-2xl font-bold">...</div>
                        ) : (
                          <>
                            <div className="text-2xl font-bold">
                              ${customers.length > 0 
                                ? Math.round(customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / customers.length).toLocaleString()
                                : 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Valor promedio</p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Search */}
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input placeholder="Buscar clientes por nombre, email o teléfono..." className="pl-10" />
                      </div>
                    </div>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </div>

                  {/* Customers Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Contacto</TableHead>
                          <TableHead>Pedidos</TableHead>
                          <TableHead>Total Gastado</TableHead>
                          <TableHead>Último Pedido</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingCustomers ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex flex-col items-center gap-2">
                                <Users className="h-8 w-8 text-muted-foreground animate-pulse" />
                                <p className="text-sm text-muted-foreground">Cargando clientes...</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : customers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex flex-col items-center gap-2">
                                <Users className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">No hay clientes disponibles</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          customers.map((customer) => {
                            return (
                              <TableRow key={customer.id}>
                                <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-semibold text-primary">
                                    {customer.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{customer.name}</p>
                                  <p className="text-xs text-muted-foreground">ID: {customer.id}</p>
                                </div>
                              </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Mail className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs">{customer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <Phone className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs">{customer.phone}</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{customer.totalOrders}</TableCell>
                                <TableCell className="font-semibold">${customer.totalSpent.toLocaleString()}</TableCell>
                                <TableCell>{customer.lastOrder}</TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-800">Activo</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" title="Ver perfil">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" title="Editar">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Movements */}
            <TabsContent value="inventory" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Movimientos de Inventario</CardTitle>
                    <CardDescription>Historial completo de entradas, salidas y ajustes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Filters */}
                      <div className="flex gap-4">
                        <Select defaultValue="all">
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Tipo de movimiento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="entrada">Entradas</SelectItem>
                            <SelectItem value="salida">Salidas</SelectItem>
                            <SelectItem value="ajuste">Ajustes</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline">
                          <Calendar className="h-4 w-4 mr-2" />
                          Filtrar por fecha
                        </Button>
                      </div>

                      {/* Movements Table */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Motivo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {movements.map((movement) => (
                            <TableRow key={movement.id}>
                              <TableCell className="font-medium">{movement.productName}</TableCell>
                              <TableCell>{getMovementBadge(movement.type)}</TableCell>
                              <TableCell>
                                <span className={movement.type === "entrada" ? "text-green-600" : "text-primary"}>
                                  {movement.type === "entrada" ? "+" : "-"}
                                  {movement.quantity}
                                </span>
                              </TableCell>
                              <TableCell>{movement.date}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{movement.reason}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Registrar Movimiento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Producto</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Tipo de Movimiento</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entrada">Entrada</SelectItem>
                            <SelectItem value="salida">Salida</SelectItem>
                            <SelectItem value="ajuste">Ajuste</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Cantidad</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <div>
                        <Label>Motivo</Label>
                        <Textarea placeholder="Describe el motivo del movimiento..." rows={3} />
                      </div>
                      <Button className="w-full bg-primary hover:bg-primary/90">Registrar Movimiento</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Carga Masiva</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">Importar productos</p>
                        <Button variant="outline" size="sm">
                          Seleccionar CSV
                        </Button>
                      </div>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Plantilla
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Coupons & Discounts */}
            <TabsContent value="coupons" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Cupones y Descuentos</CardTitle>
                      <CardDescription>Gestiona códigos promocionales y ofertas especiales</CardDescription>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Cupón
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Descuento</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Usos</TableHead>
                          <TableHead>Vencimiento</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coupons.map((coupon) => (
                          <TableRow key={coupon.id}>
                            <TableCell>
                              <code className="bg-muted px-2 py-1 rounded font-mono text-sm">{coupon.code}</code>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {coupon.type === "percentage" ? `${coupon.discount}%` : `$${coupon.discount}`}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{coupon.type === "percentage" ? "Porcentaje" : "Fijo"}</Badge>
                            </TableCell>
                            <TableCell>
                              {coupon.uses} / {coupon.maxUses}
                            </TableCell>
                            <TableCell>{coupon.expiresAt}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">Activo</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-primary">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports */}
            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reporte de Ventas</CardTitle>
                    <CardDescription>Análisis detallado de ventas por período</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Select defaultValue="month">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Hoy</SelectItem>
                          <SelectItem value="week">Esta semana</SelectItem>
                          <SelectItem value="month">Este mes</SelectItem>
                          <SelectItem value="year">Este año</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="w-full bg-transparent" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Reporte
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Reporte de Inventario</CardTitle>
                    <CardDescription>Estado actual del inventario</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrar por categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button className="w-full bg-transparent" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Reporte
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Reporte de Clientes</CardTitle>
                    <CardDescription>Análisis de base de clientes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Segmento de clientes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los clientes</SelectItem>
                          <SelectItem value="active">Activos</SelectItem>
                          <SelectItem value="inactive">Inactivos</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="w-full bg-transparent" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Reporte
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Reporte Financiero</CardTitle>
                    <CardDescription>Resumen financiero y contable</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Select defaultValue="month">
                        <SelectTrigger>
                          <SelectValue placeholder="Período fiscal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="month">Mes actual</SelectItem>
                          <SelectItem value="quarter">Trimestre</SelectItem>
                          <SelectItem value="year">Año fiscal</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="w-full bg-transparent" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Reporte
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users-roles" className="space-y-6">
              {/* Roles Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">
                        {users.filter((u) => u.role === "customer").length}
                      </span>
                    </div>
                    <p className="text-sm font-medium">Clientes</p>
                    <p className="text-xs text-muted-foreground">Usuarios regulares</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">
                        {users.filter((u) => u.role === "admin").length}
                      </span>
                    </div>
                    <p className="text-sm font-medium">Administradores</p>
                    <p className="text-xs text-muted-foreground">Acceso completo al sistema</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <UserCog className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">
                        {users.filter((u) => u.role === "staff").length}
                      </span>
                    </div>
                    <p className="text-sm font-medium">Personal</p>
                    <p className="text-xs text-muted-foreground">Empleados y personal</p>
                  </CardContent>
                </Card>
              </div>

              {/* Users Management */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gestión de Usuarios</CardTitle>
                      <CardDescription>Administra usuarios y asigna roles con permisos específicos</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Usuario
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                            <DialogDescription>Agrega un nuevo usuario y asigna su rol</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Nombre Completo</Label>
                                <Input
                                  placeholder="Juan Pérez"
                                  value={newUser.full_name}
                                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>Email</Label>
                                <Input
                                  type="email"
                                  placeholder="juan@empresa.com"
                                  value={newUser.email}
                                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Teléfono</Label>
                                <Input
                                  placeholder="+52 55 1234 5678"
                                  value={newUser.phone}
                                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>Rol</Label>
                                <Select
                                  value={newUser.role}
                                  onValueChange={(value: "customer" | "admin" | "staff") =>
                                    setNewUser({ ...newUser, role: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona rol" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="customer">Cliente</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="staff">Personal</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div>
                              <Label>Contraseña</Label>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Mínimo 6 caracteres. El usuario podrá cambiarla después.
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="sendEmail"
                                checked={newUser.sendEmail}
                                onCheckedChange={(checked) => setNewUser({ ...newUser, sendEmail: checked })}
                              />
                              <Label htmlFor="sendEmail">Enviar email de bienvenida</Label>
                            </div>
                            <Button
                              className="w-full bg-primary hover:bg-primary/90"
                              onClick={handleCreateUser}
                              disabled={creatingUser || !newUser.email || !newUser.password || !newUser.full_name}
                            >
                              {creatingUser ? "Creando usuario..." : "Crear Usuario"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">Cargando usuarios...</div>
                    </div>
                  ) : (
                    <>
                      {/* Users Table */}
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Usuario</TableHead>
                              <TableHead>Rol</TableHead>
                              <TableHead>Pedidos</TableHead>
                              <TableHead>Total Gastado</TableHead>
                              <TableHead>Último Acceso</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                  No hay usuarios registrados
                                </TableCell>
                              </TableRow>
                            ) : (
                              users.map((user) => (
                                <TableRow key={user.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-sm font-semibold text-primary">
                                          {(user.full_name || user.email || "U")
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2)}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="font-medium">{user.full_name || "Sin nombre"}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Select
                                      value={user.role}
                                      onValueChange={(value: "customer" | "admin" | "staff") =>
                                        handleUpdateUserRole(user.id, value)
                                      }
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="customer">Cliente</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="staff">Personal</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>{user.orders}</TableCell>
                                  <TableCell className="font-semibold">
                                    ${user.totalSpent.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell>
                                    {user.lastLogin
                                      ? new Date(user.lastLogin).toLocaleDateString("es-MX")
                                      : "Nunca"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className="bg-green-100 text-green-800">Activo</Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        title="Editar"
                                        onClick={() => setEditingUser(user)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      {user.id !== currentUser?.id && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          title="Eliminar"
                                          onClick={() => handleDeleteUser(user.id, user.email || "")}
                                          className="text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Dialog para editar usuario */}
              {editingUser && (
                <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Editar Usuario</DialogTitle>
                      <DialogDescription>Modifica la información del usuario</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Nombre Completo</Label>
                          <Input
                            value={editingUser.full_name || ""}
                            onChange={(e) =>
                              setEditingUser({ ...editingUser, full_name: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={editingUser.email || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Teléfono</Label>
                          <Input
                            value={editingUser.phone || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Rol</Label>
                          <Select
                            value={editingUser.role}
                            onValueChange={(value: "customer" | "admin" | "staff") =>
                              setEditingUser({ ...editingUser, role: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer">Cliente</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="staff">Personal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditingUser(null)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleUpdateUser} className="bg-primary hover:bg-primary/90">
                          Guardar Cambios
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Role Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle>Permisos por Rol</CardTitle>
                  <CardDescription>Configuración detallada de permisos para cada rol</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {roles.map((role) => {
                      const IconComponent = role.icon
                      return (
                        <div key={role.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <IconComponent className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{role.name}</h3>
                                <p className="text-sm text-muted-foreground">{role.description}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {role.permissions.map((permission, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span>{permission}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Product-Role Associations */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Asociación de Productos a Roles</CardTitle>
                      <CardDescription>
                        Define qué productos están disponibles para cada rol y sus precios
                      </CardDescription>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Asociación
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {productRoleAssociations.map((association) => (
                      <div key={association.productId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">{association.productName}</h3>
                            <p className="text-sm text-muted-foreground">ID: {association.productId}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium">Roles con Acceso</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {association.allowedRoles.map((roleId) => (
                                <span key={roleId}>{getRoleBadge(roleId)}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Precios por Rol</Label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
                              {Object.entries(association.priceByRole).map(([roleId, price]) => {
                                const role = roles.find((r) => r.id === roleId)
                                return (
                                  <div key={roleId} className="border rounded p-2">
                                    <p className="text-xs text-muted-foreground">{role?.name}</p>
                                    <p className="text-sm font-semibold">${price}</p>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rewards Program */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Programa de Puntos y Recompensas</CardTitle>
                      <CardDescription>Configura el sistema de lealtad y recompensas para clientes</CardDescription>
                    </div>
                    <Switch checked={rewardsProgram.enabled} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Puntos por Peso Gastado</Label>
                        <Input
                          type="number"
                          value={rewardsProgram.pointsPerPeso}
                          onChange={(e) =>
                            setRewardsProgram({ ...rewardsProgram, pointsPerPeso: Number(e.target.value) })
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Por cada $1 MXN gastado, el cliente recibe {rewardsProgram.pointsPerPeso} punto(s)
                        </p>
                      </div>
                      <div>
                        <Label>Multiplicador para Clientes Corporativos</Label>
                        <Input
                          type="number"
                          value={rewardsProgram.corporateMultiplier}
                          onChange={(e) =>
                            setRewardsProgram({ ...rewardsProgram, corporateMultiplier: Number(e.target.value) })
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Los clientes corporativos reciben {rewardsProgram.corporateMultiplier}x puntos
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Puntos Mínimos para Canje</Label>
                        <Input
                          type="number"
                          value={rewardsProgram.minimumRedemption}
                          onChange={(e) =>
                            setRewardsProgram({ ...rewardsProgram, minimumRedemption: Number(e.target.value) })
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Mínimo {rewardsProgram.minimumRedemption} puntos para canjear
                        </p>
                      </div>
                      <div>
                        <Label>Expiración de Puntos (días)</Label>
                        <Input
                          type="number"
                          value={rewardsProgram.expirationDays}
                          onChange={(e) =>
                            setRewardsProgram({ ...rewardsProgram, expirationDays: Number(e.target.value) })
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Los puntos expiran después de {rewardsProgram.expirationDays} días
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-6" />
                  <div className="space-y-4">
                    <h3 className="font-semibold">Reglas de Segmentación Automática</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-3">
                            <Award className="h-5 w-5 text-amber-600" />
                            <h4 className="font-medium">Promoción a Cliente Corporativo</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Los clientes se convierten automáticamente en Clientes Corporativos cuando:
                          </p>
                          <ul className="text-sm space-y-2">
                            <li className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              Total gastado ≥ $10,000 MXN
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              Mínimo 5 pedidos completados
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-3">
                            <Gift className="h-5 w-5 text-primary" />
                            <h4 className="font-medium">Beneficios Automáticos</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Al alcanzar el estatus corporativo, los clientes reciben:
                          </p>
                          <ul className="text-sm space-y-2">
                            <li className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              10% descuento en todos los productos
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              Puntos dobles en cada compra
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              Acceso a productos exclusivos
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-primary hover:bg-primary/90">Guardar Configuración</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integrations */}
            <TabsContent value="integrations" className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Integraciones</h2>
                <p className="text-muted-foreground">
                  Configura y gestiona las conexiones con servicios externos para pagos, envíos y más.
                </p>
              </div>

              {/* Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getIntegrationsStatus().map((integration, index) => (
                  <Card
                    key={index}
                    className={integration.required && !integration.status ? "border-yellow-500" : ""}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {integration.status ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : integration.required ? (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                          <h3 className="font-semibold">{integration.name}</h3>
                        </div>
                        <Badge variant={integration.required ? "default" : "outline"} className="text-xs">
                          {integration.required ? "Requerida" : "Opcional"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{integration.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {integration.category}
                        </Badge>
                        <span
                          className={`text-xs font-medium ${
                            integration.status ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {integration.status ? "Activa" : "Inactiva"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Detailed Configuration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* YoloEnvio */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Truck className="h-5 w-5 text-primary" />
                          YoloEnvio
                        </CardTitle>
                        <CardDescription>Gestión de envíos y rastreo</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://yoloenvio.com/" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>API Key</Label>
                      <Input type="password" placeholder="••••••••••••" />
                    </div>
                    <div>
                      <Label>API Secret</Label>
                      <Input type="password" placeholder="••••••••••••" />
                    </div>
                    <div>
                      <Label>Modo</Label>
                      <Select defaultValue="sandbox">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox">Sandbox (Pruebas)</SelectItem>
                          <SelectItem value="production">Producción</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">Guardar Configuración</Button>
                  </CardContent>
                </Card>

                {/* Stripe */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          Stripe
                        </CardTitle>
                        <CardDescription>Pagos con tarjeta internacional</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://stripe.com/" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Publishable Key</Label>
                      <Input placeholder="pk_test_..." />
                    </div>
                    <div>
                      <Label>Secret Key</Label>
                      <Input type="password" placeholder="sk_test_..." />
                    </div>
                    <div>
                      <Label>Webhook Secret</Label>
                      <Input type="password" placeholder="whsec_..." />
                    </div>
                    <Button className="w-full">Guardar Configuración</Button>
                  </CardContent>
                </Card>

                {/* Mercado Pago */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-primary" />
                          Mercado Pago
                        </CardTitle>
                        <CardDescription>Pagos para México y LATAM</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://www.mercadopago.com.mx/" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Public Key</Label>
                      <Input placeholder="TEST-..." />
                    </div>
                    <div>
                      <Label>Access Token</Label>
                      <Input type="password" placeholder="TEST-..." />
                    </div>
                    <Button className="w-full">Guardar Configuración</Button>
                  </CardContent>
                </Card>

                {/* Email */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-primary" />
                          Email (Resend)
                        </CardTitle>
                        <CardDescription>Notificaciones por correo</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://resend.com/" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>API Key</Label>
                      <Input type="password" placeholder="re_..." />
                    </div>
                    <div>
                      <Label>Email From</Label>
                      <Input placeholder="ventas@3abranding.com" />
                    </div>
                    <Button className="w-full">Guardar Configuración</Button>
                  </CardContent>
                </Card>

                {/* 3A Promoción - Promocionales en Línea */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Gift className="h-5 w-5 text-primary" />
                          3A Promoción
                        </CardTitle>
                        <CardDescription>Productos desde Promocionales en Línea (GraphQL)</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://www.promocionalesenlinea.net/" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Configura en <code className="bg-muted px-1 rounded">.env.local</code>: PROMOCION_GRAPHQL_URL, PROMOCION_EMAIL, PROMOCION_PASSWORD. Luego en Productos usa &quot;Sincronizar desde 3A Promoción&quot;.
                    </p>
                    <div>
                      <Label>Endpoint GraphQL</Label>
                      <Input placeholder="https://www.promocionalesenlinea.net/graphql" disabled className="bg-muted" />
                    </div>
                    <Button className="w-full" variant="secondary" asChild>
                      <a href="/admin?section=products">Ir a Productos y sincronizar</a>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Documentation */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documentación e Instrucciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Variables de Entorno</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Para configurar las integraciones, crea un archivo <code className="bg-muted px-2 py-1 rounded">.env.local</code> en la raíz del proyecto con las siguientes variables:
                    </p>
                    <pre className="bg-background p-4 rounded-lg text-xs overflow-x-auto border">
{`# YoloEnvio
YOLOENVIO_API_KEY=tu-api-key
YOLOENVIO_API_SECRET=tu-api-secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Mercado Pago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-...
MERCADOPAGO_ACCESS_TOKEN=TEST-...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=ventas@3abranding.com`}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Recursos Útiles</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <a href="https://docs.yoloenvio.com/" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Documentación YoloEnvio
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <a href="https://stripe.com/docs" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Documentación Stripe
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <a href="https://www.mercadopago.com.mx/developers" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Documentación Mercado Pago
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información de la Tienda</CardTitle>
                    <CardDescription>Configuración general del negocio</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Nombre de la Tienda</Label>
                      <Input defaultValue="3A Branding" />
                    </div>
                    <div>
                      <Label>Email de Contacto</Label>
                      <Input defaultValue="ventas@3abranding.com" />
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <Input defaultValue="+52 55 1234 5678" />
                    </div>
                    <div>
                      <Label>Dirección</Label>
                      <Textarea defaultValue="Av. Insurgentes Sur 1234, Col. Del Valle, CDMX, México" rows={3} />
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">Guardar Cambios</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Métodos de Pago</CardTitle>
                    <CardDescription>Configura las opciones de pago</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Tarjetas de Crédito/Débito</p>
                          <p className="text-xs text-muted-foreground">Visa, Mastercard, AMEX</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Transferencia Bancaria</p>
                          <p className="text-xs text-muted-foreground">SPEI, CLABE</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Pago contra entrega</p>
                          <p className="text-xs text-muted-foreground">Efectivo o tarjeta</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de Envíos</CardTitle>
                    <CardDescription>Zonas y costos de envío</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Envío Gratis a partir de</Label>
                      <Input type="number" defaultValue="1000" placeholder="MXN" />
                    </div>
                    <div>
                      <Label>Costo de Envío Local (CDMX)</Label>
                      <Input type="number" defaultValue="150" placeholder="MXN" />
                    </div>
                    <div>
                      <Label>Costo de Envío Nacional</Label>
                      <Input type="number" defaultValue="250" placeholder="MXN" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="tracking" defaultChecked />
                      <Label htmlFor="tracking">Habilitar rastreo de envíos</Label>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">Guardar Configuración</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notificaciones</CardTitle>
                    <CardDescription>Configura alertas y notificaciones</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Nuevos pedidos</p>
                        <p className="text-xs text-muted-foreground">Recibe alertas de nuevos pedidos</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Stock bajo</p>
                        <p className="text-xs text-muted-foreground">Alertas de productos con poco stock</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Nuevos clientes</p>
                        <p className="text-xs text-muted-foreground">Notificación de registros nuevos</p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Reportes semanales</p>
                        <p className="text-xs text-muted-foreground">Resumen semanal por email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
