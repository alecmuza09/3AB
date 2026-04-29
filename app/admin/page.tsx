"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { TopHeader } from "@/components/top-header"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
  Calculator,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  X,
  Printer,
  FileDown,
  ArrowRight,
  Layers,
} from "lucide-react"
// getIntegrationsStatus se obtiene vía API para evitar exponer secrets en el bundle cliente
import type { CotizadorConfig } from "@/lib/cotizador"
import { defaultCotizadorConfig } from "@/lib/cotizador"
import { AdminSiteContentEditor } from "@/components/admin-site-content-editor"
import { openQuotationPrint } from "@/lib/quotation-pdf"

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
  proveedor: string | null
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('admin:sidebarCollapsed')
      if (saved === '1') setSidebarCollapsed(true)
    } catch {/* noop */}
  }, [])

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem('admin:sidebarCollapsed', next ? '1' : '0') } catch {/* noop */}
      return next
    })
  }
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customerSearch, setCustomerSearch] = useState("")
  const [viewCustomer, setViewCustomer] = useState<any | null>(null)
  const [editCustomer, setEditCustomer] = useState<any | null>(null)
  const [editCustomerForm, setEditCustomerForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    company_name: "",
    tax_id: "",
  })
  const [savingCustomer, setSavingCustomer] = useState(false)
  const [coupons, setCoupons] = useState<any[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [couponDialogOpen, setCouponDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null)
  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    discount: "10",
    maxUses: "100",
    expiresAt: "",
    isActive: true,
  })
  const [savingCoupon, setSavingCoupon] = useState(false)
  const [adminQuotations, setAdminQuotations] = useState<any[]>([])
  const [loadingAdminQuotations, setLoadingAdminQuotations] = useState(false)
  const [quotationFilter, setQuotationFilter] = useState("all")
  const [quotationSearch, setQuotationSearch] = useState("")

  // ============================
  // EDITOR de cotizaciones (admin) — versión completa
  // ============================
  type QuoteLine = {
    id: string
    productId: string | null
    productName: string
    productSku: string | null
    quantity: number
    unitPrice: number
    customization: string
    imageUrl: string | null
  }

  type QuoteForm = {
    // Cliente
    userId: string | null
    contactName: string
    companyName: string
    email: string
    phone: string
    taxId: string
    deliveryAddress: string
    eventType: string
    deliveryDate: string
    paymentTerms: string
    // Términos
    validDays: string
    discountPercent: string
    discountAmount: string
    taxRate: string
    shippingCost: string
    // Notas
    notes: string
    adminNotes: string
    // Estado inicial
    status: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted"
  }

  const emptyQuoteForm: QuoteForm = {
    userId: null,
    contactName: "",
    companyName: "",
    email: "",
    phone: "",
    taxId: "",
    deliveryAddress: "",
    eventType: "",
    deliveryDate: "",
    paymentTerms: "",
    validDays: "30",
    discountPercent: "0",
    discountAmount: "0",
    taxRate: "0",
    shippingCost: "0",
    notes: "",
    adminNotes: "",
    status: "draft",
  }

  const [quoteEditorOpen, setQuoteEditorOpen] = useState(false)
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null)
  const [quoteEditorTab, setQuoteEditorTab] = useState<"client" | "products" | "terms">("client")
  const [newQuoteForm, setNewQuoteForm] = useState<QuoteForm>(emptyQuoteForm)
  const [newQuoteItems, setNewQuoteItems] = useState<QuoteLine[]>([])
  const [savingNewQuote, setSavingNewQuote] = useState(false)

  // Búsqueda de productos del catálogo dentro del editor
  const [catalogSearchTerm, setCatalogSearchTerm] = useState("")
  const [catalogResults, setCatalogResults] = useState<any[]>([])
  const [searchingCatalog, setSearchingCatalog] = useState(false)

  // Búsqueda de clientes dentro del editor
  const [clientSearchTerm, setClientSearchTerm] = useState("")
  const [clientResults, setClientResults] = useState<any[]>([])
  const [searchingClients, setSearchingClients] = useState(false)

  // Vista de detalle (read-only)
  const [detailQuotation, setDetailQuotation] = useState<any | null>(null)
  const [deletingQuotationId, setDeletingQuotationId] = useState<string | null>(null)

  // Selector de variantes
  const [variantSelection, setVariantSelection] = useState<{
    product: any
    variations: any[]
  } | null>(null)
  const [loadingVariants, setLoadingVariants] = useState(false)

  // Conversión a pedido
  const [convertingQuotation, setConvertingQuotation] = useState<any | null>(null)
  const [savingConvert, setSavingConvert] = useState(false)
  const [convertForm, setConvertForm] = useState({
    paymentStatus: "pending" as "pending" | "paid" | "partial",
    notes: "",
  })
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
  
  // Estados para dialogs de pedidos
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [viewOrderDialogOpen, setViewOrderDialogOpen] = useState(false)
  const [editOrderDialogOpen, setEditOrderDialogOpen] = useState(false)
  const [editingOrderStatus, setEditingOrderStatus] = useState("")
  
  // Estados para configuración de envíos
  const [shippingConfig, setShippingConfig] = useState<any>({
    methods: {},
    zones: {},
    general: {},
    restrictions: {},
    notifications: {}
  })
  const [loadingShippingConfig, setLoadingShippingConfig] = useState(false)
  const [savingShippingConfig, setSavingShippingConfig] = useState(false)
  
  // Estados para configuración del cotizador
  const [cotizadorConfig, setCotizadorConfig] = useState<CotizadorConfig>(defaultCotizadorConfig)
  const [loadingCotizadorConfig, setLoadingCotizadorConfig] = useState(false)
  const [savingCotizadorConfig, setSavingCotizadorConfig] = useState(false)
  
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
      setUsersError(null)
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Error al cargar usuarios")
      }
      setUsers(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error("Error loading users:", error)
      setUsersError(error?.message || "No se pudieron cargar los usuarios")
      setUsers([])
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
        alert(`Error: ${data.error || "No se pudo crear el usuario"}`)
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

      // Cerrar dialog
      setCreateUserDialogOpen(false)

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

  // Funciones para manejo de pedidos
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setViewOrderDialogOpen(true)
  }

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order)
    setEditingOrderStatus(order.status)
    setEditOrderDialogOpen(true)
  }

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return

    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.orderId, // Usar orderId en lugar de originalId
          status: editingOrderStatus,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar el pedido')
      }

      // Recargar pedidos
      await loadOrders()
      
      setEditOrderDialogOpen(false)
      setSelectedOrder(null)
      alert('Estado del pedido actualizado exitosamente')
    } catch (error: any) {
      console.error('Error updating order:', error)
      alert(`Error: ${error.message}`)
    }
  }

  // Funciones para configuración de envíos
  const loadShippingConfig = async () => {
    try {
      setLoadingShippingConfig(true)
      const response = await fetch('/api/shipping-config')
      
      if (!response.ok) {
        throw new Error('Error al cargar configuración de envíos')
      }

      const data = await response.json()
      setShippingConfig({
        methods: data.shipping_methods || {},
        zones: data.shipping_zones || {},
        general: data.shipping_general || {},
        restrictions: data.shipping_restrictions || {},
        notifications: data.shipping_notifications || {}
      })
    } catch (error) {
      console.error('Error loading shipping config:', error)
      alert('Error al cargar la configuración de envíos')
    } finally {
      setLoadingShippingConfig(false)
    }
  }

  const saveShippingConfig = async () => {
    try {
      setSavingShippingConfig(true)
      
      const response = await fetch('/api/shipping-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shippingConfig),
      })

      if (!response.ok) {
        throw new Error('Error al guardar configuración')
      }

      alert('✅ Configuración de envíos guardada exitosamente')
      await loadShippingConfig()
    } catch (error: any) {
      console.error('Error saving shipping config:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setSavingShippingConfig(false)
    }
  }

  const updateShippingMethod = (methodKey: string, field: string, value: any) => {
    setShippingConfig((prev: any) => ({
      ...prev,
      methods: {
        ...prev.methods,
        [methodKey]: {
          ...prev.methods[methodKey],
          [field]: value
        }
      }
    }))
  }

  const updateShippingZone = (zoneKey: string, field: string, value: any) => {
    setShippingConfig((prev: any) => ({
      ...prev,
      zones: {
        ...prev.zones,
        [zoneKey]: {
          ...prev.zones[zoneKey],
          [field]: value
        }
      }
    }))
  }

  const updateShippingGeneral = (field: string, value: any) => {
    setShippingConfig((prev: any) => ({
      ...prev,
      general: {
        ...prev.general,
        [field]: value
      }
    }))
  }

  // Funciones para configuración del cotizador
  const loadCotizadorConfig = async () => {
    try {
      setLoadingCotizadorConfig(true)
      const response = await fetch('/api/cotizador-config')
      
      if (!response.ok) {
        throw new Error('Error al cargar configuración del cotizador')
      }

      const data = await response.json()
      setCotizadorConfig(data)
    } catch (error) {
      console.error('Error loading cotizador config:', error)
      setCotizadorConfig(defaultCotizadorConfig)
    } finally {
      setLoadingCotizadorConfig(false)
    }
  }

  const saveCotizadorConfig = async () => {
    try {
      setSavingCotizadorConfig(true)
      
      const supabase = getSupabaseClient()
      if (!supabase) {
        alert('Supabase no está disponible')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Debes iniciar sesión para guardar cambios')
        return
      }

      const response = await fetch('/api/cotizador-config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(cotizadorConfig),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al guardar configuración')
      }

      alert('✅ Configuración del cotizador guardada exitosamente')
      await loadCotizadorConfig()
    } catch (error: any) {
      console.error('Error saving cotizador config:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setSavingCotizadorConfig(false)
    }
  }

  const updateCotizadorMargin = (level: 'low' | 'medium' | 'high', field: 'threshold' | 'percentage', value: number) => {
    setCotizadorConfig((prev) => ({
      ...prev,
      margins: {
        ...prev.margins,
        [level]: {
          ...prev.margins[level],
          [field]: value
        }
      }
    }))
  }

  const updateCotizadorExtra = (extraKey: 'placa' | 'ponchado' | 'tratamiento', value: number) => {
    setCotizadorConfig((prev) => ({
      ...prev,
      extras: {
        ...prev.extras,
        [extraKey]: value
      }
    }))
  }

  // Función para editar usuario (abrir dialog)
  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setEditUserDialogOpen(true)
  }

  const handleUpdateUserPassword = async () => {
    if (!editingUser) return
    if (!editUserPassword.trim() || !editUserPasswordConfirm.trim()) {
      alert("Completa ambos campos de contraseña")
      return
    }
    if (editUserPassword !== editUserPasswordConfirm) {
      alert("Las contraseñas no coinciden")
      return
    }
    if (editUserPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres")
      return
    }
    try {
      setUpdatingPassword(true)
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: editingUser.id, password: editUserPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "Error al cambiar la contraseña")
        return
      }
      setEditUserPassword("")
      setEditUserPasswordConfirm("")
      alert("Contraseña actualizada correctamente")
    } catch (error: any) {
      console.error("Error updating password:", error)
      alert(error?.message || "Error al cambiar la contraseña")
    } finally {
      setUpdatingPassword(false)
    }
  }

  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [loadingMovements, setLoadingMovements] = useState(false)

  // Cargar productos desde API (servidor con service role, evita problemas de cliente/RLS)
  const loadProducts = async () => {
    try {
      setLoadingProducts(true)
      const res = await fetch("/api/products?activeOnly=false")
      const json = await res.json().catch(() => ({ products: [] }))
      const productsData = json.products || []

      const formattedProducts = productsData.map((product: any) => ({
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
        proveedor: (product.attributes?.proveedor as string) || null,
      }))

      setProducts(formattedProducts)
      if (json.error) console.warn("API products warning:", json.error)
    } catch (error) {
      console.error("Error loading products:", error)
      setProducts([])
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

  // Cargar productos cuando se abre la sección (incl. settings para ver resumen de productos)
  useEffect(() => {
    if (activeSection === "products" || activeSection === "inventory" || activeSection === "settings") {
      loadProducts()
    }
    if (activeSection === "inventory") {
      loadMovements()
    }
    if (activeSection === "shipping-config") {
      loadShippingConfig()
    }
    if (activeSection === "cotizador-config") {
      loadCotizadorConfig()
    }
    if (activeSection === "users") {
      loadUsers()
    }
  }, [activeSection])

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    minQuantity: "1",
    multipleOf: "1",
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [syncingProducts, setSyncingProducts] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [syncProgress4P, setSyncProgress4P] = useState<{ current: number; total: number; phase: string } | null>(null)
  const [syncingPromocion, setSyncingPromocion] = useState(false)
  const [syncingInnovation, setSyncingInnovation] = useState(false)
  const [syncingDoblevela, setSyncingDoblevela] = useState(false)
  const [syncingPromoopcion, setSyncingPromoopcion] = useState(false)

  // Estado de integraciones (se carga vía API para no exponer secrets en el bundle)
  const [integrationsStatus, setIntegrationsStatus] = useState<Array<{
    name: string
    category: string
    status: boolean
    description: string
    required: boolean
  }>>([])

  useEffect(() => {
    fetch('/api/integrations-status')
      .then((r) => r.json())
      .then((data) => setIntegrationsStatus(data.integrations ?? []))
      .catch(() => {/* silencioso si falla */})
  }, [])

  // Función para sincronizar productos desde la API de inventario
  /**
   * Sincronización en chunks: descarga primero el catálogo crudo (1 llamada rápida)
   * y luego procesa en lotes de ~30 entradas para evitar el timeout de 10s de Netlify.
   */
  const handleSyncProducts = async () => {
    if (!confirm('¿Sincronizar productos desde 4Promotional?\n\nEl proceso se hará por chunks para evitar timeouts. Puede tardar varios minutos.')) {
      return
    }

    setSyncingProducts(true)
    setSyncResult(null)
    setSyncProgress4P({ current: 0, total: 0, phase: 'Descargando catálogo...' })

    const totals = {
      categoriesCreated: 0,
      productsCreated: 0,
      productsUpdated: 0,
      variationsCreated: 0,
      variationsUpdated: 0,
      imagesCreated: 0,
      errors: [] as string[],
    }

    try {
      const fetchRes = await fetch('/api/sync-products/fetch-raw')
      const fetchText = await fetchRes.text()
      let fetchData: any = {}
      try { fetchData = JSON.parse(fetchText) } catch {
        throw new Error(`No se pudo descargar el catálogo: HTTP ${fetchRes.status}. ${fetchText.substring(0, 150)}`)
      }
      if (!fetchData.success) {
        throw new Error(fetchData.error || 'Error desconocido al descargar catálogo')
      }

      const allProducts: any[] = fetchData.products || []
      if (allProducts.length === 0) {
        throw new Error('La API de 4Promotional devolvió un catálogo vacío')
      }

      const CHUNK_SIZE = 30
      const totalChunks = Math.ceil(allProducts.length / CHUNK_SIZE)
      setSyncProgress4P({ current: 0, total: totalChunks, phase: `Procesando ${allProducts.length} productos…` })

      let categoryMap: Record<string, string> = {}

      for (let i = 0; i < allProducts.length; i += CHUNK_SIZE) {
        const chunk = allProducts.slice(i, i + CHUNK_SIZE)
        const chunkIndex = Math.floor(i / CHUNK_SIZE) + 1
        setSyncProgress4P({ current: chunkIndex, total: totalChunks, phase: `Procesando chunk ${chunkIndex}/${totalChunks}…` })

        try {
          const procRes = await fetch('/api/sync-products/process-chunk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products: chunk, categoryMap }),
          })
          const procText = await procRes.text()
          let procData: any = {}
          try { procData = JSON.parse(procText) } catch {
            totals.errors.push(`Chunk ${chunkIndex}: respuesta inválida (HTTP ${procRes.status})`)
            continue
          }
          if (!procData.success) {
            totals.errors.push(`Chunk ${chunkIndex}: ${procData.error || 'error desconocido'}`)
            continue
          }
          totals.categoriesCreated += procData.categoriesCreated || 0
          totals.productsCreated += procData.productsCreated || 0
          totals.productsUpdated += procData.productsUpdated || 0
          totals.variationsCreated += procData.variationsCreated || 0
          totals.variationsUpdated += procData.variationsUpdated || 0
          totals.imagesCreated += procData.imagesCreated || 0
          if (Array.isArray(procData.errors) && procData.errors.length) {
            totals.errors.push(...procData.errors.slice(0, 3))
          }
          if (procData.categoryMap) categoryMap = procData.categoryMap
        } catch (err: any) {
          totals.errors.push(`Chunk ${chunkIndex}: ${err.message || 'error de red'}`)
        }
      }

      setSyncResult({ success: true, data: totals })
      alert(
        `✅ 4Promotional sincronizado (${totalChunks} chunks):\n` +
        `• Productos creados: ${totals.productsCreated}\n` +
        `• Productos actualizados: ${totals.productsUpdated}\n` +
        `• Variaciones: ${totals.variationsCreated + totals.variationsUpdated}\n` +
        `• Imágenes: ${totals.imagesCreated}\n` +
        `• Categorías nuevas: ${totals.categoriesCreated}\n` +
        (totals.errors.length ? `\n⚠️ ${totals.errors.length} advertencia(s):\n• ${totals.errors.slice(0, 3).join('\n• ')}` : '')
      )
    } catch (error: any) {
      console.error('Error sincronizando 4Promotional:', error)
      alert(`❌ Error al sincronizar 4Promotional:\n${error.message}`)
      setSyncResult({ success: false, error: error.message })
    } finally {
      setSyncingProducts(false)
      setSyncProgress4P(null)
    }
  }

  // Probar conexión con API de 4Promotional
  const [testing4Promotional, setTesting4Promotional] = useState(false)
  const [testingDoblevela, setTestingDoblevela] = useState(false)
  const [testingInnovation, setTestingInnovation] = useState(false)
  const [testingPromoopcion, setTestingPromoopcion] = useState(false)
  const [auditing, setAuditing] = useState(false)
  const [auditResult, setAuditResult] = useState<any>(null)

  const handleAudit = async () => {
    setAuditing(true)
    try {
      const res = await fetch('/api/integrations-audit')
      const data = await res.json()
      setAuditResult(data)
    } catch (err) {
      alert(`Error al auditar: ${err}`)
    } finally {
      setAuditing(false)
    }
  }
  const handleTest4Promotional = async () => {
    setTesting4Promotional(true)
    try {
      const res = await fetch('/api/sync-products/test')
      const data = await res.json()
      const conn = data.connection
      if (conn.success) {
        const schema = data.schema
        alert(
          `✅ Conexión exitosa con 4Promotional\n\n` +
          `Variantes crudas: ${conn.totalRawVariants}\n` +
          `Productos agrupados: ${conn.totalGroupedProducts}\n` +
          `Tiempo de respuesta: ${conn.responseTimeMs}ms\n\n` +
          `Producto de ejemplo: ${conn.sampleRawProduct?.nombre_articulo ?? 'N/A'}\n` +
          `SKU: ${conn.sampleRawProduct?.id_articulo ?? 'N/A'}\n\n` +
          `Campos disponibles en API:\n${schema?.availableFields?.join(', ') || 'N/A'}\n\n` +
          `Categorías (${schema?.totalCategories}): ${schema?.categories?.slice(0, 5).join(', ')}...`
        )
      } else {
        alert(`❌ Error de conexión 4Promotional:\n${conn.error}\n\nURL configurada: ${data.config?.baseUrl || 'no configurada'}`)
      }
    } catch (err) {
      alert(`Error al probar la conexión: ${err}`)
    } finally {
      setTesting4Promotional(false)
    }
  }

  // Probar conexión con API de 3A Promoción
  const [testingPromocion, setTestingPromocion] = useState(false)
  const handleTestPromocion = async () => {
    setTestingPromocion(true)
    try {
      const res = await fetch('/api/sync-promocion/test')
      const data = await res.json()
      const conn = data.connection
      if (conn.success) {
        alert(`✅ Conexión exitosa con 3A Promoción\n\nProductos encontrados: ${conn.productCount}\nQuery usada: ${conn.queryUsed}\nProducto de ejemplo: ${conn.sampleProduct?.nombre ?? conn.sampleProduct?.name ?? 'N/A'}\n\nCampos disponibles en API: ${data.schema?.fields?.join(', ') || 'N/A'}`)
      } else {
        alert(`❌ Error de conexión: ${conn.error}\n\nCampos API disponibles: ${data.schema?.fields?.join(', ') || 'No se pudo obtener'}`)
      }
    } catch (err) {
      alert(`Error al probar la conexión: ${err}`)
    } finally {
      setTestingPromocion(false)
    }
  }

  const handleTestDoblevela = async () => {
    setTestingDoblevela(true)
    try {
      const res = await fetch('/api/sync-doblevela/test')
      const data = await res.json()
      const conn = data.connection
      if (conn.success) {
        alert(
          `✅ Conexión exitosa con Doblevela\n\n` +
          `Productos en catálogo: ${conn.totalProducts}\n` +
          `Tiempo de respuesta: ${conn.responseTimeMs}ms\n` +
          (conn.serverIp ? `IP saliente del servidor: ${conn.serverIp}\n` : '') +
          `\nProducto de ejemplo: ${conn.sampleProduct?.Descripcion ?? 'N/A'}\n` +
          `Código: ${conn.sampleProduct?.Codigo ?? 'N/A'}`
        )
      } else {
        const esAcceso = (conn.error || '').toLowerCase().includes('acceso no permitido')
        if (esAcceso) {
          alert(
            `🚫 Acceso denegado por IP\n\n` +
            `La API de Doblevela rechaza peticiones que no vengan de la IP registrada (35.215.119.244).\n\n` +
            (conn.serverIp ? `IP actual del servidor: ${conn.serverIp}\n\n` : '') +
            `Para solucionarlo, contacta a Doblevela (soporte técnico) y pídeles actualizar la IP autorizada.`
          )
        } else {
          alert(`❌ Error de conexión Doblevela:\n${conn.error}${conn.hint ? '\n\n' + conn.hint : ''}`)
        }
      }
    } catch (err) {
      alert(`❌ Error al probar Doblevela: ${err}`)
    } finally {
      setTestingDoblevela(false)
    }
  }

  const handleTestInnovation = async () => {
    setTestingInnovation(true)
    try {
      const res = await fetch('/api/sync-innovation/test')
      const data = await res.json()
      const conn = data.connection
      if (conn.success) {
        const fueraDeHorario = !conn.withinRecommendedHours
        alert(
          `✅ Conexión exitosa con Innovation Line\n` +
          (fueraDeHorario ? `⚠️ Fuera de ventana recomendada — pero la API respondió bien\n` : '') +
          `\nProductos en catálogo: ${conn.totalProducts}\n` +
          `Tiempo de respuesta: ${conn.responseTimeMs}ms\n\n` +
          `Ejemplo: ${conn.sampleProduct?.Nombre ?? conn.sampleProduct?.nombre ?? 'N/A'}`
        )
      } else {
        const errLower = (conn.error || '').toLowerCase()
        const esCredencialesInvalidas = conn.error === 'CREDENCIALES_INVALIDAS' ||
          errLower.includes('credenciales') ||
          errLower.includes('invalidas') ||
          errLower.includes('correct_datos')
        const esFueraDeHorario = !esCredencialesInvalidas && (
          conn.error === 'FUERA_DE_HORARIO' ||
          errLower.includes('fuera de horario') ||
          errLower.includes('no está activo')
        )
        if (esCredencialesInvalidas) {
          alert(
            `🔑 Innovation Line — Credenciales inválidas\n\n` +
            `El API de Innovation Line está rechazando el USER y/o CLAVE configurados.\n\n` +
            `Esto significa que:\n` +
            `• La cuenta fue desactivada por Innovation, o\n` +
            `• Alguien cambió la contraseña en su panel, o\n` +
            `• El auth-token (API Key) ya no es válido.\n\n` +
            `Solución: contacta a tu ejecutivo de Innovation Line y pide que confirme/regenere:\n` +
            `1. Usuario (correo)\n2. Clave\n3. Auth-token\n\n` +
            `Una vez con datos nuevos, actualízalos en Netlify (Site settings → Environment variables).`
          )
        } else if (esFueraDeHorario) {
          alert(
            `⏰ Innovation Line — Fuera de horario\n\n` +
            `Credenciales correctas ✅ — pero el web service no está activo ahora.\n\n` +
            `Ventanas disponibles (hora CDMX):\n• 09:00 – 10:00\n• 13:00 – 14:00\n• 17:00 – 18:00`
          )
        } else {
          alert(`❌ Error de conexión Innovation Line:\n${conn.error}${conn.hint ? '\n\n' + conn.hint : ''}`)
        }
      }
    } catch (err) {
      alert(`❌ Error al probar Innovation Line: ${err}`)
    } finally {
      setTestingInnovation(false)
    }
  }

  const handleTestPromoopcion = async () => {
    setTestingPromoopcion(true)
    try {
      const res = await fetch('/api/sync-promoopcion/test')
      const data = await res.json()
      const conn = data.connection
      if (conn.success) {
        const samples = (conn.sampleItems ?? []).map((s: any) => `${s.code}: ${s.stock}`).join(', ')
        alert(
          `✅ Conexión exitosa con PromoOpción\n\n` +
          `Ítems con registro: ${conn.totalItems}\n` +
          `Con stock > 0: ${conn.withStock}\n` +
          `Tiempo de respuesta: ${conn.responseTimeMs}ms\n` +
          `Modo: ${conn.mode}\n\n` +
          `Ejemplos de stock: ${samples}`
        )
      } else {
        alert(`❌ Error de conexión PromoOpción:\n${conn.error}${conn.hint ? '\n\n' + conn.hint : ''}`)
      }
    } catch (err) {
      alert(`❌ Error al probar PromoOpción: ${err}`)
    } finally {
      setTestingPromoopcion(false)
    }
  }

  // Sincronizar productos desde 3A Promoción (Promopción)
  const handleSyncPromocion = async () => {
    if (!confirm('¿Sincronizar productos desde Promopción (promocionalesenlinea.net)? Esto puede tardar unos minutos.')) {
      return
    }
    setSyncingPromocion(true)
    try {
      const response = await fetch('/api/sync-promocion', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error al sincronizar')
      if (data.success) {
        alert(`Sincronización Promopción completada.\n\nCategorías creadas: ${data.data.categoriesCreated}\nCategorías actualizadas: ${data.data.categoriesUpdated}\nProductos creados: ${data.data.productsCreated}\nProductos actualizados: ${data.data.productsUpdated}\nImágenes creadas: ${data.data.imagesCreated}`)
      } else {
        alert('Sincronización completada con errores. Revisa la consola.')
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setSyncingPromocion(false)
    }
  }

  // Sincronizar productos desde Doblevela
  const handleSyncDoblevela = async () => {
    if (!confirm('¿Sincronizar productos desde Doblevela? Esto puede tardar varios minutos.\n\nNota: la API de Doblevela solo opera en horario laboral (lunes a viernes, 9am–6pm hora de México).')) {
      return
    }
    setSyncingDoblevela(true)
    try {
      const response = await fetch('/api/sync-doblevela', { method: 'POST' })
      const data = await response.json()

      const errors: string[] = data.data?.errors ?? []
      const primerError = errors[0] || data.error || data.message || ''
      const serverIp: string | null = data.serverIp ?? null
      const ahora = new Date()
      const hora = ahora.getHours()
      const enHorarioLaboral = hora >= 9 && hora < 18 && ahora.getDay() >= 1 && ahora.getDay() <= 5

      if (data.success) {
        alert(
          `✅ Doblevela sincronizado:\n` +
          `• Productos creados: ${data.data?.productsCreated ?? 0}\n` +
          `• Productos actualizados: ${data.data?.productsUpdated ?? 0}\n` +
          `• Imágenes: ${data.data?.imagesCreated ?? 0}\n` +
          (errors.length ? `\n⚠️ Advertencias (${errors.length}): ${errors[0]}` : '')
        )
      } else {
        // Mensaje detallado y honesto: no asumir si es horario o IP, mostrar todo
        const probableCausa = enHorarioLaboral
          ? `Estamos en horario laboral (lunes-viernes 9am-6pm CDMX), por lo que el rechazo es probablemente por IP.\n\nLa API de Doblevela tiene whitelist por IP en su contrato (IP autorizada: 35.215.119.244).`
          : `Estamos fuera del horario laboral (lunes-viernes 9am-6pm CDMX). Puede ser horario, pero también IP.`
        const ipInfo = serverIp
          ? `\n\n📍 IP saliente del servidor Netlify: ${serverIp}\n\nSolución: contacta a Doblevela y pídeles agregar esta IP a su whitelist.`
          : ''

        alert(
          `❌ Doblevela rechazó la petición\n\n` +
          `Mensaje de la API: "${primerError}"\n\n` +
          probableCausa +
          ipInfo
        )
      }
    } catch (error) {
      alert(`❌ Error de red al sincronizar Doblevela: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setSyncingDoblevela(false)
    }
  }

  const handleSyncInnovation = async () => {
    if (!confirm('¿Sincronizar productos desde Innovation Line? Esto puede tardar varios minutos.')) {
      return
    }
    setSyncingInnovation(true)
    try {
      const response = await fetch('/api/sync-innovation', { method: 'POST' })
      const data = await response.json()

      const errors: string[] = data.data?.errors ?? []
      const primerError = errors[0] || data.error || data.message || ''
      const errorLower = primerError.toLowerCase()
      const esCredencialesInvalidas = primerError === 'CREDENCIALES_INVALIDAS' ||
        errorLower.includes('credenciales') ||
        errorLower.includes('invalidas') ||
        errorLower.includes('correct_datos')
      const esFueraDeHorario = !esCredencialesInvalidas && (
        primerError === 'FUERA_DE_HORARIO' ||
        errorLower.includes('fuera de horario') ||
        errorLower.includes('no está activo') ||
        errorLower.includes('no activo') ||
        errorLower.includes('web service no')
      )

      if (data.success) {
        alert(
          `✅ Innovation Line sincronizado:\n` +
          `• Productos creados: ${data.data?.productsCreated ?? 0}\n` +
          `• Productos actualizados: ${data.data?.productsUpdated ?? 0}\n` +
          `• Variantes: ${(data.data?.variationsCreated ?? 0) + (data.data?.variationsUpdated ?? 0)}\n` +
          `• Imágenes: ${data.data?.imagesCreated ?? 0}\n` +
          (errors.length ? `\n⚠️ Advertencias (${errors.length}): ${errors[0]}` : '')
        )
      } else if (esCredencialesInvalidas) {
        alert(
          `🔑 Innovation Line — Credenciales inválidas\n\n` +
          `El API de Innovation Line está rechazando las credenciales (Correct_Datos: false).\n\n` +
          `Causas posibles:\n` +
          `• La cuenta fue desactivada por Innovation, o\n` +
          `• Alguien cambió la contraseña en su panel, o\n` +
          `• El auth-token (API Key) ya no es válido.\n\n` +
          `Acción: contacta a tu ejecutivo de Innovation Line y pide que confirme/regenere:\n` +
          `1. Usuario (correo)\n2. Clave\n3. Auth-token\n\n` +
          `Después actualízalos en Netlify → Site settings → Environment variables.`
        )
      } else if (esFueraDeHorario) {
        alert(
          `⏰ Innovation Line — Fuera de horario\n\n` +
          `El web service no está activo en este momento.\n\n` +
          `Ventanas disponibles (hora CDMX):\n• 09:00 – 10:00\n• 13:00 – 14:00\n• 17:00 – 18:00`
        )
      } else {
        const detalle = errors.length
          ? `\n\nDetalle:\n• ${errors.slice(0, 3).join('\n• ')}`
          : ''
        alert(`❌ Error al sincronizar Innovation Line:\n${primerError}${detalle}`)
      }
    } catch (error) {
      alert(`❌ Error de red al sincronizar Innovation Line: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setSyncingInnovation(false)
    }
  }

  const handleSyncPromoopcion = async () => {
    if (!confirm('¿Sincronizar productos desde PromoOpción? Esto puede tardar varios minutos.\n\nNota: en modo productivo la API tiene límite de consultas por hora. En modo demo (desarrollo) no hay límite.')) {
      return
    }
    setSyncingPromoopcion(true)
    try {
      const response = await fetch('/api/sync-promoopcion', { method: 'POST' })
      const data = await response.json()
      const errors: string[] = data.data?.errors ?? []

      if (data.success) {
        alert(
          `✅ PromoOpción sincronizado:\n` +
          `• Productos creados: ${data.data?.productsCreated ?? 0}\n` +
          `• Productos actualizados: ${data.data?.productsUpdated ?? 0}\n` +
          `• Variantes: ${(data.data?.variationsCreated ?? 0) + (data.data?.variationsUpdated ?? 0)}\n` +
          `• Imágenes: ${data.data?.imagesCreated ?? 0}\n` +
          (errors.length ? `⚠️ Advertencias (${errors.length}): ${errors[0]}` : '')
        )
      } else {
        const limitExcedido = errors.some((e: string) =>
          e.toLowerCase().includes('límite') || e.toLowerCase().includes('429') || e.toLowerCase().includes('limit')
        )
        if (limitExcedido) {
          alert('⏱️ Límite de consultas excedido\n\nLa API de PromoOpción tiene un límite por hora en modo productivo.\n\nOpciones:\n• Activa PROMOOPCION_DEMO=1 para desarrollo sin límite\n• Espera al siguiente ciclo (30 min) e intenta de nuevo')
        } else {
          const detalle = errors.length ? `\n\nDetalle:\n• ${errors.slice(0, 3).join('\n• ')}` : ''
          alert(`❌ Error al sincronizar PromoOpción:\n${data.error || data.message}${detalle}`)
        }
      }
    } catch (error) {
      alert(`❌ Error de red al sincronizar PromoOpción: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setSyncingPromoopcion(false)
    }
  }

  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProveedor, setSelectedProveedor] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 50

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
  const [bulkCategoryForSelect, setBulkCategoryForSelect] = useState<string>("")
  const [bulkMarginPercent, setBulkMarginPercent] = useState<string>("")
  // "selection" = aplicar margen a la selección actual; cualquier otro valor = categoría concreta
  const [bulkMarginApplyToCategory, setBulkMarginApplyToCategory] = useState<string>("selection")
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
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      product.name.toLowerCase().includes(term) ||
      (product.sku || "").toLowerCase().includes(term)
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesProveedor = selectedProveedor === "all" || (product.proveedor || "sin proveedor") === selectedProveedor
    return matchesSearch && matchesCategory && matchesProveedor
  })

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedProducts = filteredProducts.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  const proveedorOptions = Array.from(
    new Set(products.map((p) => p.proveedor || "sin proveedor"))
  ).sort()


  const categoryOptions = Array.from(new Set([...(categories || []), ...products.map((p) => p.category).filter(Boolean)])).sort()

  const getDraft = (id: string) => productDrafts[id] || {}

  const setDraft = (id: string, patch: Partial<{ price: number; minQuantity: number; multipleOf: number; isActive: boolean }>) => {
    setProductDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }))
  }

  const isSelected = (id: string) => selectedProductIds.includes(id)

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedProductIds((prev) => (checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)))
  }

  // Resetear página cuando cambian los filtros
  const handleSearchChange = (value: string) => { setSearchTerm(value); setCurrentPage(1) }
  const handleCategoryChange = (value: string) => { setSelectedCategory(value); setCurrentPage(1) }
  const handleProveedorChange = (value: string) => { setSelectedProveedor(value); setCurrentPage(1) }

  const toggleSelectAllFiltered = (checked: boolean) => {
    if (!checked) {
      setSelectedProductIds((prev) => prev.filter((id) => !filteredProducts.some((p) => p.id === id)))
      return
    }
    setSelectedProductIds((prev) => Array.from(new Set([...prev, ...filteredProducts.map((p) => p.id)])))
  }

  const applyBulkMargin = () => {
    const margin = Number(bulkMarginPercent) || 0
    if (margin <= 0) {
      alert("Indica un margen de ganancia (%) mayor a 0.")
      return
    }

    const applyToCategory =
      bulkMarginApplyToCategory && bulkMarginApplyToCategory !== "selection"
        ? bulkMarginApplyToCategory
        : ""

    const idsToApply = applyToCategory
      ? products.filter((p) => p.category?.name === applyToCategory).map((p) => p.id)
      : selectedProductIds

    if (idsToApply.length === 0) {
      alert("Selecciona productos en la tabla o elige una categoría para aplicar el margen.")
      return
    }

    if (applyToCategory) {
      setSelectedProductIds(idsToApply)
    }

    let totalUpdated = 0
    setProductDrafts((prev) => {
      const next = { ...prev }
      for (const id of idsToApply) {
        const product = products.find((p) => p.id === id)
        if (!product) continue
        
        // IMPORTANTE: Siempre aplicar el margen sobre el precio ORIGINAL del producto,
        // no sobre el draft actual (para evitar aplicación compuesta de márgenes)
        const basePrice = product.price
        const newPrice = Math.max(0, Number((basePrice * (1 + margin / 100)).toFixed(2)))
        
        const current = next[id] || {}
        next[id] = { ...current, price: newPrice }
        totalUpdated++
      }
      return next
    })
    
    alert(`✅ Margen del ${margin}% aplicado a ${totalUpdated} producto(s).\n\nAhora haz clic en "Guardar seleccionados" para aplicar los cambios permanentemente.`)
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

  const [savingNewProduct, setSavingNewProduct] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      alert("Completa al menos nombre, precio y stock para crear el producto.")
      return
    }
    try {
      setSavingNewProduct(true)
      // Tratar de resolver category_id desde la BD por nombre, si está disponible
      let resolvedCategoryId: string | null = null
      try {
        if (newProduct.category) {
          const sb = getSupabaseClient()
          if (sb) {
            const { data: cat } = await sb
              .from("categories")
              .select("id, name")
              .ilike("name", newProduct.category)
              .maybeSingle()
            resolvedCategoryId = (cat as any)?.id ?? null
          }
        }
      } catch {/* noop */}
      const payload = {
        name: newProduct.name.trim(),
        description: newProduct.description?.trim() || null,
        category_id: resolvedCategoryId,
        price: Number.parseFloat(newProduct.price) || 0,
        stock_quantity: Number.parseInt(newProduct.stock, 10) || 0,
        min_quantity: Math.max(1, Math.floor(Number(newProduct.minQuantity) || 1)),
        multiple_of: Math.max(1, Math.floor(Number(newProduct.multipleOf) || 1)),
        is_active: true,
      }
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "No se pudo crear el producto")
      }
      // Recargar la lista para tener los datos canónicos del servidor
      await loadProducts()
      setNewProduct({
        name: "",
        category: "",
        price: "",
        stock: "",
        description: "",
        minQuantity: "1",
        multipleOf: "1",
      })
      alert(`✅ Producto "${data.product?.name || payload.name}" creado correctamente.`)
    } catch (err) {
      alert(`❌ Error al crear producto: ${err instanceof Error ? err.message : err}`)
    } finally {
      setSavingNewProduct(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    const target = products.find((p) => p.id === id)
    if (!confirm(`¿Desactivar "${target?.name ?? id}"?\n\nEl producto dejará de mostrarse en la tienda pero quedará en la base de datos por integridad histórica (pedidos previos).`)) {
      return
    }
    try {
      setDeletingProductId(id)
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "No se pudo eliminar el producto")
      }
      // Actualización optimista local: marcar inactivo
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: false, status: "inactive" } : p))
      )
    } catch (err) {
      alert(`❌ Error al eliminar producto: ${err instanceof Error ? err.message : err}`)
    } finally {
      setDeletingProductId(null)
    }
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
      
      // Usar la API en lugar de consultar directamente Supabase
      // La API usa service_role_key y puede ver todos los pedidos
      const response = await fetch('/api/orders')
      
      if (!response.ok) {
        console.error("Error loading orders - Status:", response.status)
        const result = await response.json().catch(() => ({ error: 'Error desconocido' }))
        console.error("Error details:", result.error)
        setOrders([])
        return
      }

      const result = await response.json()
      const ordersData = Array.isArray(result.orders) ? result.orders : []

      console.log('✅ Pedidos cargados desde API:', ordersData.length)

      // Transformar datos para el formato esperado
      const formattedOrders = ordersData.map((order: any) => {
        // Contar items del pedido
        const itemsCount = Array.isArray(order.order_items) ? order.order_items.length : 0

        // Mapear productos
        const productsList = Array.isArray(order.order_items) 
          ? order.order_items.map((item: any) => ({
              name: item.product_name,
              quantity: item.quantity,
              unitPrice: Number(item.unit_price || 0),
              subtotal: Number(item.subtotal || 0),
              variation: item.variation_label || null,
              image: item.image_url || null,
            }))
          : []

        return {
          id: order.order_number || order.id,
          orderId: order.id, // ID real de la base de datos
          customer: order.contact_info?.contactName || "Cliente Anónimo",
          email: order.contact_info?.email || "Sin email",
          phone: order.contact_info?.phone || "",
          company: order.contact_info?.company || "",
          total: Number(order.total || 0),
          subtotal: Number(order.subtotal || 0),
          taxes: Number(order.tax || 0),
          shippingCost: Number(order.shipping_cost || 0),
          status: order.status || "pending",
          date: order.created_at ? new Date(order.created_at).toISOString().split("T")[0] : "",
          items: itemsCount,
          productsList: productsList,
          shippingAddress: order.shipping_info || null,
          billingInfo: order.billing_info || null,
          paymentMethod: order.payment_method || "",
          orderData: order,
        }
      })

      console.log('✅ Pedidos formateados:', formattedOrders.length)
      setOrders(formattedOrders)
    } catch (error) {
      console.error("❌ Error loading orders:", error)
      setOrders([])
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

  const openViewCustomer = async (customer: any) => {
    setViewCustomer({ ...customer, _loading: true })
    try {
      const supabase = getSupabaseClient()
      if (!supabase) return
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", customer.id)
        .maybeSingle()
      const { data: lastOrders } = await supabase
        .from("orders")
        .select("id, order_number, total, status, created_at")
        .eq("user_id", customer.id)
        .order("created_at", { ascending: false })
        .limit(5)
      setViewCustomer({
        ...customer,
        ...(profile as any || {}),
        recentOrders: lastOrders || [],
        _loading: false,
      })
    } catch (err) {
      console.error("openViewCustomer error:", err)
      setViewCustomer({ ...customer, _loading: false })
    }
  }

  const openEditCustomer = (customer: any) => {
    setEditCustomer(customer)
    setEditCustomerForm({
      full_name: customer.full_name || customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      company_name: customer.company_name || "",
      tax_id: customer.tax_id || "",
    })
  }

  const saveCustomer = async () => {
    if (!editCustomer) return
    try {
      setSavingCustomer(true)
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("Supabase no disponible")
      const payload: Record<string, any> = {
        full_name: editCustomerForm.full_name?.trim() || null,
        phone: editCustomerForm.phone?.trim() || null,
        company_name: editCustomerForm.company_name?.trim() || null,
        tax_id: editCustomerForm.tax_id?.trim() || null,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase
        .from("profiles")
        .update(payload as any)
        .eq("id", editCustomer.id)
      if (error) throw new Error(error.message)
      // Actualizar localmente
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editCustomer.id
            ? { ...c, name: payload.full_name || c.name, phone: payload.phone || c.phone, company_name: payload.company_name }
            : c
        )
      )
      setEditCustomer(null)
      alert("✅ Cliente actualizado correctamente.")
    } catch (err) {
      alert(`❌ Error al actualizar cliente: ${err instanceof Error ? err.message : err}`)
    } finally {
      setSavingCustomer(false)
    }
  }

  const openNewCoupon = () => {
    setEditingCoupon(null)
    setCouponForm({
      code: "",
      type: "percentage",
      discount: "10",
      maxUses: "100",
      expiresAt: "",
      isActive: true,
    })
    setCouponDialogOpen(true)
  }

  const openEditCoupon = (coupon: any) => {
    setEditingCoupon(coupon)
    setCouponForm({
      code: coupon.code || "",
      type: coupon.type === "fixed" ? "fixed" : "percentage",
      discount: String(coupon.discount ?? coupon.amount ?? ""),
      maxUses: String(coupon.max_uses ?? coupon.maxUses ?? ""),
      expiresAt: coupon.expires_at
        ? new Date(coupon.expires_at).toISOString().split("T")[0]
        : coupon.expiresAt || "",
      isActive: coupon.is_active ?? coupon.isActive ?? true,
    })
    setCouponDialogOpen(true)
  }

  const saveCoupon = async () => {
    if (!couponForm.code.trim()) {
      alert("El código es obligatorio.")
      return
    }
    const discount = Number(couponForm.discount) || 0
    if (discount <= 0) {
      alert("El descuento debe ser mayor a 0.")
      return
    }
    try {
      setSavingCoupon(true)
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("Supabase no disponible")

      const payload: Record<string, any> = {
        code: couponForm.code.trim().toUpperCase(),
        type: couponForm.type,
        discount,
        max_uses: Number(couponForm.maxUses) || 0,
        expires_at: couponForm.expiresAt
          ? new Date(couponForm.expiresAt).toISOString()
          : null,
        is_active: couponForm.isActive,
        updated_at: new Date().toISOString(),
      }

      if (editingCoupon?.id) {
        const { error } = await supabase
          .from("coupons" as any)
          .update(payload)
          .eq("id", editingCoupon.id)
        if (error) throw new Error(error.message)
      } else {
        const { error } = await supabase
          .from("coupons" as any)
          .insert({ ...payload, uses: 0, created_at: new Date().toISOString() })
        if (error) throw new Error(error.message)
      }

      await loadCoupons()
      setCouponDialogOpen(false)
      setEditingCoupon(null)
      alert(`✅ Cupón ${editingCoupon ? "actualizado" : "creado"} correctamente.`)
    } catch (err: any) {
      const msg = err?.message || String(err)
      if (msg.includes("does not exist") || msg.includes("PGRST")) {
        alert(
          `⚠️ La tabla 'coupons' no existe en tu base de datos.\n\n` +
            `Para usar cupones primero crea la tabla con esta SQL:\n\n` +
            `CREATE TABLE coupons (\n` +
            `  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,\n` +
            `  code text UNIQUE NOT NULL,\n` +
            `  type text NOT NULL DEFAULT 'percentage',\n` +
            `  discount numeric NOT NULL,\n` +
            `  uses integer DEFAULT 0,\n` +
            `  max_uses integer DEFAULT 0,\n` +
            `  expires_at timestamptz,\n` +
            `  is_active boolean DEFAULT true,\n` +
            `  created_at timestamptz DEFAULT now(),\n` +
            `  updated_at timestamptz DEFAULT now()\n` +
            `);`
        )
      } else {
        alert(`❌ Error al guardar cupón: ${msg}`)
      }
    } finally {
      setSavingCoupon(false)
    }
  }

  const deleteCoupon = async (coupon: any) => {
    if (!confirm(`¿Eliminar el cupón "${coupon.code}"?`)) return
    try {
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("Supabase no disponible")
      const { error } = await supabase
        .from("coupons" as any)
        .delete()
        .eq("id", coupon.id)
      if (error) throw new Error(error.message)
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id))
    } catch (err: any) {
      alert(`❌ Error al eliminar cupón: ${err?.message || err}`)
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
        .select("product_id, quantity, unit_price")

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
        productSales[productId].revenue += (item.quantity || 0) * Number(item.unit_price || 0)
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

  const loadAdminQuotations = async () => {
    setLoadingAdminQuotations(true)
    try {
      const res = await fetch('/api/quotations')
      const data = await res.json()
      setAdminQuotations(data.quotations || [])
    } catch (err) {
      console.error('Error loading quotations:', err)
    } finally {
      setLoadingAdminQuotations(false)
    }
  }

  // ============================
  // Cálculos del editor de cotizaciones
  // ============================
  const computeQuoteTotals = (
    items: QuoteLine[],
    form: QuoteForm
  ) => {
    const subtotal = items.reduce(
      (s, i) => s + (Number(i.unitPrice) || 0) * (Number(i.quantity) || 0),
      0
    )
    const discountPct = Math.max(0, Number(form.discountPercent) || 0)
    const discountFixed = Math.max(0, Number(form.discountAmount) || 0)
    const discount = subtotal * (discountPct / 100) + discountFixed
    const taxableBase = Math.max(0, subtotal - discount)
    const taxRate = Math.max(0, Number(form.taxRate) || 0)
    const taxes = taxableBase * (taxRate / 100)
    const shipping = Math.max(0, Number(form.shippingCost) || 0)
    const total = taxableBase + taxes + shipping
    return { subtotal, discount, taxes, shipping, total }
  }

  const openNewQuoteEditor = () => {
    setEditingQuotationId(null)
    setNewQuoteForm(emptyQuoteForm)
    setNewQuoteItems([])
    setQuoteEditorTab("client")
    setCatalogSearchTerm("")
    setCatalogResults([])
    setClientSearchTerm("")
    setClientResults([])
    setQuoteEditorOpen(true)
  }

  const openEditQuoteEditor = (q: any) => {
    setEditingQuotationId(q.id)
    const ci = q.contact_info || {}
    const items = Array.isArray(q.quotation_items) ? q.quotation_items : []
    // Calcular descuento como % aproximado (si no hay)
    const subtotal = Number(q.subtotal) || 0
    const discountAmount = Number(q.discount) || 0
    const discountPercent = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0
    const taxRate =
      Number(q.taxes) > 0 && subtotal > 0
        ? (Number(q.taxes) / Math.max(1, subtotal - discountAmount)) * 100
        : 0
    setNewQuoteForm({
      userId: q.user_id || null,
      contactName: ci.contactName || "",
      companyName: ci.companyName || "",
      email: ci.email || "",
      phone: ci.phone || "",
      taxId: ci.taxId || "",
      deliveryAddress: ci.deliveryAddress || "",
      eventType: ci.eventType || "",
      deliveryDate: ci.deliveryDate || "",
      paymentTerms: ci.paymentTerms || "",
      validDays: q.valid_until
        ? String(
            Math.max(
              0,
              Math.round(
                (new Date(q.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )
            )
          )
        : "30",
      discountPercent: String(Math.round(discountPercent * 100) / 100),
      discountAmount: "0",
      taxRate: String(Math.round(taxRate * 100) / 100),
      shippingCost: String(q.shipping_cost || 0),
      notes: q.notes || "",
      adminNotes: q.admin_notes || "",
      status: q.status || "draft",
    })
    setNewQuoteItems(
      items.map((it: any, idx: number) => ({
        id: it.id || `${idx}-${Date.now()}`,
        productId: it.product_id || null,
        productName: it.product_name || "",
        productSku: it.product_sku || null,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unit_price) || 0,
        customization:
          it.customization_data?.description ||
          (typeof it.customization_data === "string" ? it.customization_data : "") ||
          "",
        imageUrl: it.image_url || null,
      }))
    )
    setQuoteEditorTab("client")
    setQuoteEditorOpen(true)
  }

  const duplicateQuotation = (q: any) => {
    openEditQuoteEditor(q)
    // Resetear el id para que se cree como nueva
    setEditingQuotationId(null)
    setNewQuoteForm((prev) => ({ ...prev, status: "draft", validDays: "30" }))
  }

  const saveAdminQuote = async () => {
    if (!newQuoteForm.contactName || !newQuoteForm.email) {
      alert("El nombre del contacto y el email son obligatorios.")
      setQuoteEditorTab("client")
      return
    }
    if (newQuoteItems.length === 0) {
      alert("Agrega al menos un producto a la cotización.")
      setQuoteEditorTab("products")
      return
    }
    setSavingNewQuote(true)
    try {
      const totals = computeQuoteTotals(newQuoteItems, newQuoteForm)
      const validUntil = (() => {
        const days = Math.max(0, Math.floor(Number(newQuoteForm.validDays) || 30))
        const d = new Date()
        d.setDate(d.getDate() + days)
        return d.toISOString().split("T")[0]
      })()

      const contactInfo = {
        contactName: newQuoteForm.contactName.trim(),
        companyName: newQuoteForm.companyName.trim() || null,
        email: newQuoteForm.email.trim(),
        phone: newQuoteForm.phone.trim() || null,
        taxId: newQuoteForm.taxId.trim() || null,
        deliveryAddress: newQuoteForm.deliveryAddress.trim() || null,
        eventType: newQuoteForm.eventType.trim() || null,
        deliveryDate: newQuoteForm.deliveryDate || null,
        paymentTerms: newQuoteForm.paymentTerms.trim() || null,
      }

      const itemsPayload = newQuoteItems.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        productSku: i.productSku,
        quantity: Number(i.quantity) || 1,
        unitPrice: Number(i.unitPrice) || 0,
        subtotal: (Number(i.unitPrice) || 0) * (Number(i.quantity) || 1),
        customization: i.customization || null,
        imageUrl: i.imageUrl,
      }))

      let res: Response
      if (editingQuotationId) {
        // UPDATE
        res = await fetch("/api/quotations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quotationId: editingQuotationId,
            status: newQuoteForm.status,
            contactInfo,
            notes: newQuoteForm.notes || null,
            adminNotes: newQuoteForm.adminNotes || null,
            validUntil,
            subtotal: totals.subtotal,
            taxes: totals.taxes,
            shippingCost: totals.shipping,
            discount: totals.discount,
            total: totals.total,
            userId: newQuoteForm.userId,
            items: itemsPayload,
          }),
        })
      } else {
        // CREATE
        res = await fetch("/api/quotations/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: newQuoteForm.userId,
            contactInfo,
            items: itemsPayload,
            subtotal: totals.subtotal,
            taxes: totals.taxes,
            shippingCost: totals.shipping,
            discount: totals.discount,
            total: totals.total,
            currency: "MXN",
            validUntil,
            notes: newQuoteForm.notes || null,
            adminNotes: newQuoteForm.adminNotes || null,
            status: newQuoteForm.status,
          }),
        })
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "No se pudo guardar la cotización")
      }
      setQuoteEditorOpen(false)
      setEditingQuotationId(null)
      setNewQuoteForm(emptyQuoteForm)
      setNewQuoteItems([])
      await loadAdminQuotations()
      alert(
        `✅ Cotización ${editingQuotationId ? "actualizada" : "creada"} correctamente.\n` +
          `Número: ${data.quotation?.quotation_number || "—"}`
      )
    } catch (err) {
      alert(`❌ Error al guardar cotización: ${err instanceof Error ? err.message : err}`)
    } finally {
      setSavingNewQuote(false)
    }
  }

  const handleConvertToOrder = async () => {
    if (!convertingQuotation) return
    try {
      setSavingConvert(true)
      const res = await fetch(
        `/api/quotations/${encodeURIComponent(convertingQuotation.id)}/convert`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentStatus: convertForm.paymentStatus,
            notes: convertForm.notes || null,
          }),
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "No se pudo convertir la cotización")
      }
      await loadAdminQuotations()
      await loadOrders()
      setConvertingQuotation(null)
      setConvertForm({ paymentStatus: "pending", notes: "" })
      alert(
        `✅ Pedido creado: ${data.order?.order_number || ""}\n\n` +
          `La cotización fue marcada como "Convertida". Ahora puedes gestionar el pedido en la sección Pedidos.`
      )
    } catch (err) {
      alert(
        `❌ Error al convertir cotización: ${err instanceof Error ? err.message : err}`
      )
    } finally {
      setSavingConvert(false)
    }
  }

  const deleteQuotation = async (q: any) => {
    if (!confirm(`¿Eliminar la cotización ${q.quotation_number}?\n\nEsta acción no se puede deshacer.`)) {
      return
    }
    try {
      setDeletingQuotationId(q.id)
      const res = await fetch(`/api/quotations?id=${encodeURIComponent(q.id)}`, {
        method: "DELETE",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "No se pudo eliminar")
      }
      setAdminQuotations((prev) => prev.filter((x) => x.id !== q.id))
    } catch (err) {
      alert(`❌ Error al eliminar cotización: ${err instanceof Error ? err.message : err}`)
    } finally {
      setDeletingQuotationId(null)
    }
  }

  // Búsqueda de productos del catálogo (debounced en componente al usar)
  const searchCatalogForQuote = async (term: string) => {
    setCatalogSearchTerm(term)
    if (!term.trim()) {
      setCatalogResults([])
      return
    }
    try {
      setSearchingCatalog(true)
      const res = await fetch(
        `/api/products?search=${encodeURIComponent(term.trim())}&limit=15&activeOnly=false`
      )
      const data = await res.json().catch(() => ({ products: [] }))
      setCatalogResults(data.products || [])
    } catch (err) {
      console.error("searchCatalogForQuote error:", err)
      setCatalogResults([])
    } finally {
      setSearchingCatalog(false)
    }
  }

  const pushQuoteLine = (params: {
    productId: string | null
    productName: string
    productSku: string | null
    quantity: number
    unitPrice: number
    imageUrl?: string | null
    variationLabel?: string | null
  }) => {
    setNewQuoteItems((prev) => [
      ...prev,
      {
        id: `${params.productId || "free"}-${Date.now()}-${prev.length}`,
        productId: params.productId,
        productName: params.variationLabel
          ? `${params.productName} — ${params.variationLabel}`
          : params.productName,
        productSku: params.productSku,
        quantity: Math.max(1, Math.floor(params.quantity || 1)),
        unitPrice: Number(params.unitPrice) || 0,
        customization: "",
        imageUrl: params.imageUrl ?? null,
      },
    ])
  }

  const addProductToQuote = async (product: any) => {
    // Detectar si el producto tiene variantes activas y abrir selector
    try {
      setLoadingVariants(true)
      const supabase = getSupabaseClient()
      let variations: any[] = []
      if (supabase) {
        const { data } = await supabase
          .from("product_variations")
          .select("id, name, sku, price, stock_quantity, attributes, image_url, is_active")
          .eq("product_id", product.id)
          .eq("is_active", true)
          .order("name", { ascending: true })
        variations = (data as any[]) || []
      }

      if (variations.length > 0) {
        setVariantSelection({ product, variations })
        setCatalogSearchTerm("")
        setCatalogResults([])
        return
      }
    } catch (err) {
      console.warn("addProductToQuote: error consultando variantes:", err)
    } finally {
      setLoadingVariants(false)
    }

    // Sin variantes → agregar directo
    pushQuoteLine({
      productId: product.id,
      productName: product.name || "Producto",
      productSku: product.sku || null,
      quantity: Math.max(1, Number(product.min_quantity) || 1),
      unitPrice: Number(product.price) || 0,
      imageUrl: product.product_images?.[0]?.url || product.image_url || null,
    })
    setCatalogSearchTerm("")
    setCatalogResults([])
  }

  const addVariantToQuote = (variation: any) => {
    if (!variantSelection) return
    const { product } = variantSelection
    const variationPrice = variation.price ?? product.price ?? 0
    pushQuoteLine({
      productId: product.id,
      productName: product.name || "Producto",
      productSku: variation.sku || product.sku || null,
      quantity: Math.max(1, Number(product.min_quantity) || 1),
      unitPrice: Number(variationPrice) || 0,
      imageUrl:
        variation.image_url ||
        product.product_images?.[0]?.url ||
        product.image_url ||
        null,
      variationLabel: variation.name,
    })
    setVariantSelection(null)
  }

  // Búsqueda de clientes (en customers ya cargados)
  const searchClientsForQuote = (term: string) => {
    setClientSearchTerm(term)
    if (!term.trim()) {
      setClientResults([])
      return
    }
    setSearchingClients(true)
    try {
      const q = term.toLowerCase().trim()
      const matched = (customers || [])
        .filter((c: any) =>
          [c.name, c.email, c.phone, c.company_name]
            .filter(Boolean)
            .some((v: string) => v.toLowerCase().includes(q))
        )
        .slice(0, 10)
      setClientResults(matched)
    } finally {
      setSearchingClients(false)
    }
  }

  const selectClientForQuote = (client: any) => {
    setNewQuoteForm((prev) => ({
      ...prev,
      userId: client.id,
      contactName: client.full_name || client.name || prev.contactName,
      email: client.email || prev.email,
      phone: client.phone || prev.phone,
      companyName: client.company_name || prev.companyName,
      taxId: client.tax_id || prev.taxId,
    }))
    setClientSearchTerm("")
    setClientResults([])
  }

  const updateQuotationStatus = async (quotationId: string, newStatus: string) => {
    await fetch('/api/quotations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quotationId, status: newStatus }),
    })
    loadAdminQuotations()
  }

  const [sendingQuotationEmail, setSendingQuotationEmail] = useState<string | null>(null)
  const [sendingQuotationWA, setSendingQuotationWA] = useState<string | null>(null)

  const handleSendQuotationEmail = async (q: any) => {
    setSendingQuotationEmail(q.id)
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'quotation_admin', order: q }),
      })
      const data = await res.json()
      if (data.success || res.ok) {
        alert(`✅ Cotización ${q.quotation_number} enviada por email a ${q.contact_info?.email || 'cliente'}`)
        updateQuotationStatus(q.id, 'sent')
      } else {
        alert(`❌ Error al enviar: ${data.error || 'Error desconocido'}`)
      }
    } catch (e) {
      alert(`Error: ${e}`)
    } finally {
      setSendingQuotationEmail(null)
    }
  }

  const handleSendQuotationWA = async (q: any) => {
    const phone = q.contact_info?.phone
    if (!phone) {
      alert('Esta cotización no tiene teléfono de contacto registrado.')
      return
    }
    setSendingQuotationWA(q.id)
    try {
      const res = await fetch('/api/webhooks/whatsapp/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phone,
          quotationNumber: q.quotation_number,
          contactName: q.contact_info?.contactName || 'Cliente',
          total: q.total || 0,
        }),
      })
      if (res.ok) {
        alert(`✅ Mensaje de WhatsApp enviado a ${phone}`)
      } else {
        const data = await res.json()
        alert(`❌ Error al enviar WhatsApp: ${data.error || 'API no configurada'}`)
      }
    } catch (e) {
      alert(`Error: ${e}`)
    } finally {
      setSendingQuotationWA(null)
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
    if (activeSection === "quotations") {
      loadAdminQuotations()
    }
    if (activeSection === "dashboard") {
      loadDashboardStats()
    }
  }, [activeSection])

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
      case "Pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "processing":
      case "Procesando":
        return <Badge className="bg-blue-100 text-blue-800">Procesando</Badge>
      case "En revisión":
        return <Badge className="bg-orange-100 text-orange-800">En revisión</Badge>
      case "Cotización":
        return <Badge className="bg-purple-100 text-purple-800">Cotización</Badge>
      case "En producción":
        return <Badge className="bg-blue-100 text-blue-800">En producción</Badge>
      case "Listo para enviar":
        return <Badge className="bg-teal-100 text-teal-800">Listo para enviar</Badge>
      case "Enviado":
        return <Badge className="bg-indigo-100 text-indigo-800">Enviado</Badge>
      case "Entregado":
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Entregado</Badge>
      case "Cancelado":
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status || "Sin estado"}</Badge>
    }
  }

  type UserWithStats = Database["public"]["Tables"]["profiles"]["Row"] & {
    orders: number
    totalSpent: number
    lastLogin: string | null
  }

  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [creatingUser, setCreatingUser] = useState(false)
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null)
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false)
  const [editUserPassword, setEditUserPassword] = useState("")
  const [editUserPasswordConfirm, setEditUserPasswordConfirm] = useState("")
  const [updatingPassword, setUpdatingPassword] = useState(false)
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

  // Items principales del sidebar
  const mainNavItems = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "products", label: "Productos", icon: Package },
    { key: "orders", label: "Pedidos", icon: ShoppingCart },
    { key: "inventory", label: "Inventario", icon: Truck },
    { key: "customers", label: "Clientes", icon: Users },
    { key: "coupons", label: "Cupones", icon: Tag },
    { key: "quotations", label: "Cotizaciones", icon: Calculator },
    { key: "reports", label: "Reportes", icon: FileText },
  ] as const

  const settingsSubItems = [
    { key: "settings", label: "General", icon: Shield },
    { key: "content", label: "Contenido del sitio", icon: FileText },
    { key: "integrations", label: "Integraciones", icon: Plug },
    { key: "cotizador-config", label: "Cotizador", icon: Calculator },
    { key: "users", label: "Usuarios", icon: UserCog },
    { key: "shipping-config", label: "Envíos", icon: Truck },
  ] as const

  const isSettingsActive = settingsSubItems.some((s) => s.key === activeSection)

  // Helper para item del sidebar (con o sin tooltip cuando colapsado)
  const SidebarItem = ({
    itemKey,
    label,
    Icon,
    indented = false,
  }: {
    itemKey: string
    label: string
    Icon: React.ComponentType<{ className?: string }>
    indented?: boolean
  }) => {
    const isActive = activeSection === itemKey
    const button = (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        size={indented && !sidebarCollapsed ? "sm" : "default"}
        className={
          sidebarCollapsed
            ? "w-full justify-center px-0 h-10"
            : `w-full justify-start ${indented ? "text-sm" : ""}`
        }
        onClick={() => {
          setActiveSection(itemKey)
          setMobileSidebarOpen(false)
        }}
      >
        <Icon
          className={
            sidebarCollapsed
              ? "h-5 w-5"
              : indented
              ? "h-3 w-3 mr-2"
              : "h-4 w-4 mr-3"
          }
        />
        {!sidebarCollapsed && <span className="truncate">{label}</span>}
      </Button>
    )
    if (!sidebarCollapsed) return button
    return (
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }

  const sidebarWidthClass = sidebarCollapsed ? "w-16" : "w-64"

  const sidebarContent = (
    <>
      <div className={`flex items-center justify-between ${sidebarCollapsed ? "p-3" : "p-4"} border-b border-border`}>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h2 className="text-lg font-bold leading-tight">Administración</h2>
            <p className="text-xs text-muted-foreground">Panel de control</p>
          </div>
        )}
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {sidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
          </TooltipContent>
        </Tooltip>
      </div>

      <nav className={`flex-1 ${sidebarCollapsed ? "px-2" : "px-3"} py-3 space-y-1 overflow-y-auto`}>
        {mainNavItems.map((it) => (
          <SidebarItem key={it.key} itemKey={it.key} label={it.label} Icon={it.icon} />
        ))}

        <Separator className="my-3" />

        {/* Configuración */}
        {sidebarCollapsed ? (
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <Button
                variant={isSettingsActive ? "secondary" : "ghost"}
                className="w-full justify-center px-0 h-10"
                onClick={() => setActiveSection(isSettingsActive ? "dashboard" : "settings")}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Configuración</TooltipContent>
          </Tooltip>
        ) : (
          <div className="space-y-1">
            <Button
              variant={isSettingsActive ? "secondary" : "ghost"}
              className="w-full justify-start font-semibold"
              onClick={() =>
                setActiveSection(isSettingsActive ? "dashboard" : "settings")
              }
            >
              <Settings className="h-4 w-4 mr-3" />
              Configuración
              <ChevronRight
                className={`ml-auto h-4 w-4 transition-transform ${
                  isSettingsActive ? "rotate-90" : ""
                }`}
              />
            </Button>
            {isSettingsActive && (
              <div className="ml-4 pl-3 border-l border-border space-y-1">
                {settingsSubItems.map((it) => (
                  <SidebarItem
                    key={it.key}
                    itemKey={it.key}
                    label={it.label}
                    Icon={it.icon}
                    indented
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  )

  return (
    <AdminGuard>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <TopHeader />
          <WhatsappButton />

          <div className="flex overflow-x-hidden">
            {/* Sidebar desktop */}
            <aside
              className={`hidden md:flex md:flex-col ${sidebarWidthClass} shrink-0 border-r bg-card h-screen sticky top-0 transition-[width] duration-200 ease-in-out`}
            >
              {sidebarContent}
            </aside>

            {/* Sidebar móvil (drawer) */}
            {mobileSidebarOpen && (
              <div className="md:hidden fixed inset-0 z-50 flex">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setMobileSidebarOpen(false)}
                />
                <aside className="relative flex flex-col w-64 max-w-[80vw] bg-card border-r animate-in slide-in-from-left">
                  {sidebarContent}
                </aside>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileSidebarOpen(true)}
                    aria-label="Abrir menú"
                  >
                    <PanelLeftOpen className="h-5 w-5" />
                  </Button>
                  <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                      Panel de Administración
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Sistema completo de gestión para 3A Branding
                    </p>
                  </div>
                </div>

          {/* Content Sections */}
          <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">

            {/* Dashboard */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Header acciones rápidas */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Resumen general</h2>
                  <p className="text-sm text-muted-foreground">
                    Estado actual del negocio · {new Date().toLocaleDateString("es-MX", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      loadDashboardStats()
                      loadOrders()
                      loadProducts()
                    }}
                    disabled={loadingStats}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {loadingStats ? "Actualizando..." : "Refrescar datos"}
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ventas totales</CardTitle>
                    <div className="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-700" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingStats ? (
                      <div className="text-2xl font-bold animate-pulse">...</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          ${Math.round(dashboardStats.totalRevenue).toLocaleString("es-MX")}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total acumulado · {dashboardStats.totalOrders} pedidos
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                    <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-blue-700" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingStats ? (
                      <div className="text-2xl font-bold animate-pulse">...</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{dashboardStats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                          {dashboardStats.pendingOrders > 0
                            ? `${dashboardStats.pendingOrders} pendiente${dashboardStats.pendingOrders === 1 ? "" : "s"}`
                            : "Todo procesado"}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                    <div className="h-8 w-8 rounded-md bg-purple-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-700" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingStats ? (
                      <div className="text-2xl font-bold animate-pulse">...</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{dashboardStats.totalCustomers}</div>
                        <p className="text-xs text-green-600">
                          +{dashboardStats.newCustomersThisMonth} nuevos este mes
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ticket promedio</CardTitle>
                    <div className="h-8 w-8 rounded-md bg-orange-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-orange-700" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingStats ? (
                      <div className="text-2xl font-bold animate-pulse">...</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          ${Math.round(dashboardStats.averageTicket || 0).toLocaleString("es-MX")}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {dashboardStats.totalOrders > 0
                            ? "Promedio por pedido"
                            : "Sin pedidos aún"}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Acciones rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Acciones rápidas</CardTitle>
                  <CardDescription>Atajos a las funciones más usadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex-col gap-1"
                      onClick={() => setActiveSection("products")}
                    >
                      <Package className="h-5 w-5" />
                      <span className="text-xs">Catálogo</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex-col gap-1"
                      onClick={() => setActiveSection("orders")}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span className="text-xs">Pedidos</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex-col gap-1"
                      onClick={() => setActiveSection("quotations")}
                    >
                      <Calculator className="h-5 w-5" />
                      <span className="text-xs">Cotizaciones</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex-col gap-1"
                      onClick={() => setActiveSection("inventory")}
                    >
                      <Truck className="h-5 w-5" />
                      <span className="text-xs">Sincronizar</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
              {/* Configuración masiva de precios con margen de ganancia */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Configuración masiva de precios
                  </CardTitle>
                  <CardDescription>
                    Aumenta los precios aplicando un margen de ganancia (%) a la selección actual o a todos los productos de una categoría. Luego usa &quot;Guardar seleccionados&quot; para aplicar los cambios permanentemente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bulkMarginPercent">Margen de ganancia (%)</Label>
                      <Input
                        id="bulkMarginPercent"
                        type="number"
                        min={0.01}
                        step={0.5}
                        placeholder="Ej: 25"
                        value={bulkMarginPercent}
                        onChange={(e) => setBulkMarginPercent(e.target.value)}
                        className="w-32"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Aplicar a</Label>
                      <Select value={bulkMarginApplyToCategory} onValueChange={setBulkMarginApplyToCategory}>
                        <SelectTrigger className="w-56">
                          <SelectValue placeholder="Selección actual" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="selection">
                            Selección actual ({selectedProductIds.length} {selectedProductIds.length === 1 ? 'producto' : 'productos'})
                          </SelectItem>
                          {categoryOptions.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              Todos de: {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={applyBulkMargin}
                      className="bg-primary hover:bg-primary/90"
                      disabled={!bulkMarginPercent || Number(bulkMarginPercent) <= 0}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Aplicar margen a precios
                    </Button>
                  </div>
                  
                  {/* Información de ayuda */}
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm">
                    <p className="font-medium text-blue-900 mb-1">💡 Cómo funciona:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-800">
                      <li>Ingresa el margen de ganancia (ej: 25 para 25%)</li>
                      <li>Elige si aplicar a productos seleccionados o a una categoría completa</li>
                      <li>Haz clic en &quot;Aplicar margen a precios&quot;</li>
                      <li>Verifica los nuevos precios en la tabla (con fondo amarillo)</li>
                      <li>Haz clic en &quot;Guardar seleccionados&quot; más abajo para guardar definitivamente</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>Gestión de Productos</CardTitle>
                        <Badge variant="outline" className="text-xs">Solo administradores</Badge>
                      </div>
                      <CardDescription>Administra el catálogo completo de productos. Los usuarios no pueden modificar esta configuración.</CardDescription>
                    </div>
                    <div className="flex flex-col gap-3 items-end min-w-[380px]">
                      {/* Tabla de proveedores: nombre | sincronizar | test */}
                      <div className="w-full rounded-lg border overflow-hidden divide-y text-sm">
                        {/* Fila cabecera */}
                        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-1.5 bg-muted/60 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          <span>Proveedor</span>
                          <span className="w-28 text-center">Sincronizar</span>
                          <span className="w-16 text-center">Test</span>
                        </div>

                        {/* 4Promotional */}
                        {(() => {
                          const anySync = syncingProducts || syncingPromocion || syncingDoblevela || syncingInnovation || syncingPromoopcion
                          return (
                            <>
                              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-2">
                                <span className="flex items-center gap-2 font-medium">
                                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                                  4Promotional
                                </span>
                                <Button variant="outline" size="sm" className="w-28" onClick={handleSyncProducts} disabled={anySync} title="Sincronización por chunks (sin timeout)">
                                  {syncingProducts ? (
                                    <><Package className="h-3 w-3 mr-1 animate-spin" />
                                      {syncProgress4P ? `${syncProgress4P.current}/${syncProgress4P.total}` : 'Sincronizando'}
                                    </>
                                  ) : (
                                    <><Upload className="h-3 w-3 mr-1" />Sincronizar</>
                                  )}
                                </Button>
                                <Button variant="ghost" size="sm" className="w-16 text-xs" onClick={handleTest4Promotional} disabled={testing4Promotional} title="Probar conexión con 4Promotional">
                                  {testing4Promotional ? "…" : "🔍 Test"}
                                </Button>
                              </div>

                              {/* Doblevela */}
                              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-2">
                                <span className="flex items-center gap-2 font-medium">
                                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-600 shrink-0" />
                                  Doblevela
                                </span>
                                <Button variant="outline" size="sm" className="w-28" onClick={handleSyncDoblevela} disabled={anySync}>
                                  {syncingDoblevela ? <><Package className="h-3 w-3 mr-1 animate-spin" />Sincronizando</> : <><Upload className="h-3 w-3 mr-1" />Sincronizar</>}
                                </Button>
                                <Button variant="ghost" size="sm" className="w-16 text-xs" onClick={handleTestDoblevela} disabled={testingDoblevela} title="Probar conexión con Doblevela">
                                  {testingDoblevela ? "…" : "🔍 Test"}
                                </Button>
                              </div>

                              {/* Innovation Line */}
                              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-2">
                                <span className="flex items-center gap-2 font-medium">
                                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                                  Innovation Line
                                </span>
                                <Button variant="outline" size="sm" className="w-28" onClick={handleSyncInnovation} disabled={anySync}>
                                  {syncingInnovation ? <><Package className="h-3 w-3 mr-1 animate-spin" />Sincronizando</> : <><Upload className="h-3 w-3 mr-1" />Sincronizar</>}
                                </Button>
                                <Button variant="ghost" size="sm" className="w-16 text-xs" onClick={handleTestInnovation} disabled={testingInnovation} title="Probar conexión con Innovation Line (solo en horario 9-10, 13-14, 17-18 CDMX)">
                                  {testingInnovation ? "…" : "🔍 Test"}
                                </Button>
                              </div>

                              {/* PromoOpción */}
                              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-2">
                                <span className="flex items-center gap-2 font-medium">
                                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-600 shrink-0" />
                                  PromoOpción
                                </span>
                                <Button variant="outline" size="sm" className="w-28" onClick={handleSyncPromoopcion} disabled={anySync}>
                                  {syncingPromoopcion ? <><Package className="h-3 w-3 mr-1 animate-spin" />Sincronizando</> : <><Upload className="h-3 w-3 mr-1" />Sincronizar</>}
                                </Button>
                                <Button variant="ghost" size="sm" className="w-16 text-xs" onClick={handleTestPromoopcion} disabled={testingPromoopcion} title="Probar conexión con PromoOpción">
                                  {testingPromoopcion ? "…" : "🔍 Test"}
                                </Button>
                              </div>
                            </>
                          )
                        })()}
                      </div>

                      {/* Auditoría rápida */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={handleAudit}
                        disabled={auditing}
                        title="Probar conectividad con los 5 proveedores"
                      >
                        {auditing ? '⏳ Auditando…' : '🔬 Auditoría completa de proveedores'}
                      </Button>

                      {auditResult && (
                        <div className="w-full rounded-lg border bg-muted/30 p-3 text-xs space-y-2">
                          <div className="font-medium">
                            Estado: {auditResult.summary?.ok ?? 0}/4 OK
                            {auditResult.serverIp && (
                              <span className="block mt-0.5 font-normal text-muted-foreground">
                                IP de servidor: <code className="bg-background px-1">{auditResult.serverIp}</code>
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            {auditResult.providers?.map((p: any) => {
                              const icon = p.status === 'ok' ? '✅'
                                : p.status === 'blocked-ip' ? '🚫'
                                : p.status === 'wrong-hours' ? '⏰'
                                : p.status === 'wrong-credentials' ? '🔑'
                                : p.status === 'timeout' ? '⏱️'
                                : p.status === 'not-configured' ? '⚙️'
                                : '❌'
                              return (
                                <div key={p.name} className="flex items-start gap-1.5 leading-tight">
                                  <span>{icon}</span>
                                  <div className="flex-1">
                                    <span className="font-medium">{p.name}:</span>{' '}
                                    <span className="text-muted-foreground">{p.message}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Acciones generales */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Exportar
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-primary hover:bg-primary/90">
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
                              <h3 className="font-semibold">Inventario y cantidades</h3>
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
                                  <Label htmlFor="minQuantity">Cantidad mínima de piezas *</Label>
                                  <Input
                                    id="minQuantity"
                                    type="number"
                                    min={1}
                                    value={newProduct.minQuantity}
                                    onChange={(e) => setNewProduct({ ...newProduct, minQuantity: e.target.value || "1" })}
                                    placeholder="1"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">Mínimo por pedido para este producto</p>
                                </div>
                                <div>
                                  <Label htmlFor="multipleOf">Múltiplo de</Label>
                                  <Input
                                    id="multipleOf"
                                    type="number"
                                    min={1}
                                    value={newProduct.multipleOf}
                                    onChange={(e) => setNewProduct({ ...newProduct, multipleOf: e.target.value || "1" })}
                                    placeholder="1"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">Ej: 6 para cajas por 6</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="minStock">Stock Mínimo (alerta)</Label>
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

                            <Button
                              onClick={handleAddProduct}
                              disabled={savingNewProduct || !newProduct.name || !newProduct.price || !newProduct.stock}
                              className="w-full bg-primary hover:bg-primary/90"
                            >
                              {savingNewProduct ? "Guardando..." : "Crear Producto"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      </div>{/* /acciones generales */}
                    </div>{/* /columna proveedores */}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">
                            Mostrando {filteredProducts.length} de {products.length} productos
                          </span>
                        </div>
                        {selectedProductIds.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {selectedProductIds.length} seleccionado(s)
                          </Badge>
                        )}
                      </div>
                      {(searchTerm || selectedProveedor !== "all" || selectedCategory !== "all") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearchTerm("")
                            setSelectedCategory("all")
                            setSelectedProveedor("all")
                            setCurrentPage(1)
                          }}
                        >
                          Limpiar filtros
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="Buscar por nombre o SKU..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10 h-10"
                          />
                        </div>
                      </div>
                      <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-full sm:w-48 h-10">
                          <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          {categoryOptions.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={selectedProveedor} onValueChange={handleProveedorChange}>
                        <SelectTrigger className="w-full sm:w-44 h-10">
                          <SelectValue placeholder="Proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los proveedores</SelectItem>
                          {proveedorOptions.map((prov) => (
                            <SelectItem key={prov} value={prov}>
                              {prov}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
                          <span className="text-xs font-medium text-muted-foreground">Por categoría:</span>
                          <Select value={bulkCategoryForSelect} onValueChange={setBulkCategoryForSelect}>
                            <SelectTrigger className="w-[200px] h-8">
                              <SelectValue placeholder="Elegir categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryOptions.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (!bulkCategoryForSelect) return
                              const idsInCategory = products.filter((p) => p.category === bulkCategoryForSelect).map((p) => p.id)
                              setSelectedProductIds(idsInCategory)
                            }}
                          >
                            Seleccionar todos de esta categoría
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Tip: Usa “Aplicar” para preparar cambios (drafts) y luego "Guardar seleccionados". Cantidad mínima y múltiplo definen la lógica del cálculo en la calculadora de precios.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Aviso de cambios pendientes */}
                  {Object.keys(productDrafts).length > 0 && (
                    <Card className="border-yellow-500 bg-yellow-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center">
                              <AlertCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-yellow-900">
                                ⚠️ Tienes {Object.keys(productDrafts).length} producto(s) con cambios sin guardar
                              </p>
                              <p className="text-sm text-yellow-800">
                                Los productos marcados con fondo amarillo tienen cambios pendientes. Haz clic en &quot;Guardar cambios&quot; para aplicarlos permanentemente.
                              </p>
                            </div>
                          </div>
                          <Button 
                            onClick={saveSelectedEdits} 
                            disabled={savingBulkProducts}
                            size="lg"
                            className="bg-green-600 hover:bg-green-700 whitespace-nowrap shrink-0"
                          >
                            {savingBulkProducts ? (
                              <>
                                <Package className="h-5 w-5 mr-2 animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Guardar cambios ({Object.keys(productDrafts).length})
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Products Table */}
                  <div className="rounded-md border overflow-x-auto">
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
                          <TableHead className="min-w-[200px]">Producto</TableHead>
                          <TableHead className="min-w-[120px]">SKU</TableHead>
                          <TableHead className="min-w-[140px]">Categoría</TableHead>
                          <TableHead className="min-w-[130px]">Proveedor</TableHead>
                          <TableHead className="min-w-[140px] bg-primary/5 font-bold">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-primary" />
                              Precio (MXN)
                            </div>
                          </TableHead>
                          <TableHead className="min-w-[100px]">Mínimo</TableHead>
                          <TableHead className="min-w-[100px]">Múltiplo</TableHead>
                          <TableHead className="min-w-[100px]">Stock</TableHead>
                          <TableHead className="min-w-[100px]">Estado</TableHead>
                          <TableHead className="min-w-[120px]">Rel./Cruzada</TableHead>
                          <TableHead className="text-right min-w-[150px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingProducts ? (
                          <TableRow>
                            <TableCell colSpan={12} className="text-center py-8">
                              <div className="flex flex-col items-center gap-2">
                                <Package className="h-8 w-8 text-muted-foreground animate-pulse" />
                                <p className="text-sm text-muted-foreground">Cargando productos...</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={12} className="text-center py-8">
                              <div className="flex flex-col items-center gap-2">
                                <Package className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">No hay productos disponibles</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedProducts.map((product) => {
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

                            const hasPendingChanges = !!productDrafts[product.id]
                            
                            return (
                              <TableRow 
                                key={product.id}
                                className={hasPendingChanges ? "bg-yellow-50 border-l-4 border-l-yellow-500" : ""}
                              >
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
                                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-medium truncate">{product.name}</p>
                                      <p className="text-xs text-muted-foreground truncate">ID: {product.id.slice(0, 8)}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <code className="text-xs bg-muted px-2 py-1 rounded whitespace-nowrap">
                                    {product.sku || `SKU-${product.id.slice(0, 8)}`}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="whitespace-nowrap">
                                    {product.category}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {product.proveedor ? (
                                    <Badge
                                      className="whitespace-nowrap text-white"
                                      style={{
                                        backgroundColor:
                                          product.proveedor === "4promotional" ? "#2563eb" :
                                          product.proveedor === "doblevela" ? "#16a34a" :
                                          product.proveedor === "3a-promocion" ? "#9333ea" :
                                          product.proveedor === "innovation" ? "#ea580c" :
                                          product.proveedor === "promoopcion" ? "#0891b2" :
                                          "#6b7280",
                                      }}
                                    >
                                      {product.proveedor}
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="bg-primary/5">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">$</span>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={Number.isFinite(priceValue) ? priceValue.toFixed(2) : ""}
                                        onChange={(e) => setDraft(product.id, { price: Number(e.target.value || 0) })}
                                        className={`h-9 text-base font-semibold ${hasPendingChanges && productDrafts[product.id]?.price !== product.price ? "border-yellow-500 border-2" : ""}`}
                                      />
                                      <span className="text-xs text-muted-foreground whitespace-nowrap">MXN</span>
                                    </div>
                                    {hasPendingChanges && productDrafts[product.id]?.price !== product.price && (
                                      <div className="flex items-center gap-1 text-xs">
                                        <span className="text-muted-foreground">Antes:</span>
                                        <span className="font-medium text-red-600 line-through">
                                          ${product.price.toFixed(2)}
                                        </span>
                                        <span className="text-green-600 font-semibold">
                                          → ${priceValue.toFixed(2)}
                                        </span>
                                      </div>
                                    )}
                                    {!hasPendingChanges && (
                                      <p className="text-xs text-primary font-medium">
                                        ${priceValue.toFixed(2)} MXN
                                      </p>
                                    )}
                                  </div>
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
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Ver ficha pública"
                                      onClick={() => window.open(`/productos/${product.id}`, "_blank")}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Duplicar (borrador local)"
                                      onClick={() => {
                                        const copy: Product = {
                                          ...product,
                                          id: `${product.id}-draft-${Date.now()}`,
                                          name: `${product.name} (copia)`,
                                          sku: null,
                                          lastUpdated: new Date().toISOString().split("T")[0],
                                        }
                                        setProducts((prev) => [copy, ...prev])
                                      }}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteProduct(product.id)}
                                      disabled={deletingProductId === product.id}
                                      className="text-primary hover:text-primary/80"
                                      title="Desactivar producto"
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
                      Mostrando {Math.min((safePage - 1) * ITEMS_PER_PAGE + 1, filteredProducts.length)}–
                      {Math.min(safePage * ITEMS_PER_PAGE, filteredProducts.length)} de{" "}
                      {filteredProducts.length} productos
                      {filteredProducts.length !== products.length && ` (filtrado de ${products.length})`}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Pág. {safePage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={safePage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={safePage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      >
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
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  title="Ver detalles"
                                  onClick={() => handleViewOrder(order)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  title="Editar"
                                  onClick={() => handleEditOrder(order)}
                                >
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

                  {/* Dialog Ver Detalles del Pedido */}
                  <Dialog open={viewOrderDialogOpen} onOpenChange={setViewOrderDialogOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Detalles del Pedido</DialogTitle>
                        <DialogDescription>
                          Información completa del pedido {selectedOrder?.id}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedOrder && (
                        <div className="space-y-6">
                          {/* Información General */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Número de Pedido</Label>
                              <p className="font-medium">{selectedOrder.id}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Fecha</Label>
                              <p className="font-medium">{selectedOrder.date}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Estado</Label>
                              <div className="mt-1">{getOrderStatusBadge(selectedOrder.status)}</div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Total</Label>
                              <p className="font-bold text-lg">${selectedOrder.total.toLocaleString()}</p>
                            </div>
                          </div>

                          <Separator />

                          {/* Información del Cliente */}
                          <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Información del Cliente
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                              <div>
                                <Label className="text-xs text-muted-foreground">Nombre</Label>
                                <p className="font-medium">{selectedOrder.customer}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Email</Label>
                                <p className="font-medium">{selectedOrder.email}</p>
                              </div>
                              {selectedOrder.phone && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Teléfono</Label>
                                  <p className="font-medium">{selectedOrder.phone}</p>
                                </div>
                              )}
                              {selectedOrder.company && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Empresa</Label>
                                  <p className="font-medium">{selectedOrder.company}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <Separator />

                          {/* Información de Envío */}
                          {selectedOrder.shippingAddress && (
                            <>
                              <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                  <Truck className="h-4 w-4" />
                                  Información de Envío
                                </h3>
                                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                  <p className="font-medium">{selectedOrder.shippingAddress.addressLine}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedOrder.shippingAddress.neighborhood && `${selectedOrder.shippingAddress.neighborhood}, `}
                                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    C.P. {selectedOrder.shippingAddress.postalCode}
                                  </p>
                                  {selectedOrder.shippingAddress.notes && (
                                    <div className="mt-2 pt-2 border-t">
                                      <Label className="text-xs text-muted-foreground">Notas de envío</Label>
                                      <p className="text-sm mt-1">{selectedOrder.shippingAddress.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Separator />
                            </>
                          )}

                          {/* Productos */}
                          <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Productos ({selectedOrder.items})
                            </h3>
                            <div className="border rounded-lg overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-center">Cantidad</TableHead>
                                    <TableHead className="text-right">Precio Unit.</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedOrder.productsList?.map((item: any, index: number) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        <div>
                                          <p className="font-medium">{item.name}</p>
                                          {item.variation && (
                                            <p className="text-xs text-muted-foreground">{item.variation}</p>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-center">{item.quantity}</TableCell>
                                      <TableCell className="text-right">${item.unitPrice?.toLocaleString()}</TableCell>
                                      <TableCell className="text-right font-medium">
                                        ${item.subtotal?.toLocaleString()}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>

                          <Separator />

                          {/* Resumen de Pago */}
                          <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Resumen de Pago
                            </h3>
                            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span className="font-medium">${selectedOrder.subtotal?.toLocaleString() || '0'}</span>
                              </div>
                              {selectedOrder.taxes > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Impuestos:</span>
                                  <span className="font-medium">${selectedOrder.taxes?.toLocaleString()}</span>
                                </div>
                              )}
                              {selectedOrder.shippingCost > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Envío:</span>
                                  <span className="font-medium">${selectedOrder.shippingCost?.toLocaleString()}</span>
                                </div>
                              )}
                              <Separator />
                              <div className="flex justify-between text-lg">
                                <span className="font-semibold">Total:</span>
                                <span className="font-bold">${selectedOrder.total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Dialog Editar Pedido */}
                  <Dialog open={editOrderDialogOpen} onOpenChange={setEditOrderDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Pedido</DialogTitle>
                        <DialogDescription>
                          Actualiza el estado del pedido {selectedOrder?.id}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedOrder && (
                        <div className="space-y-4">
                          {/* Comparación de Estados */}
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <Label className="text-xs text-muted-foreground mb-3 block">Cambio de Estado</Label>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground mb-2">Estado Actual</p>
                                {getOrderStatusBadge(selectedOrder.status)}
                              </div>
                              <div className="flex-shrink-0">
                                <svg 
                                  className="h-6 w-6 text-muted-foreground" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground mb-2">Nuevo Estado</p>
                                {getOrderStatusBadge(editingOrderStatus)}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="order-status">Seleccionar Nuevo Estado</Label>
                            <Select value={editingOrderStatus} onValueChange={setEditingOrderStatus}>
                              <SelectTrigger id="order-status">
                                <SelectValue placeholder="Selecciona un estado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pendiente">Pendiente</SelectItem>
                                <SelectItem value="En revisión">En revisión</SelectItem>
                                <SelectItem value="Cotización">Cotización</SelectItem>
                                <SelectItem value="En producción">En producción</SelectItem>
                                <SelectItem value="Listo para enviar">Listo para enviar</SelectItem>
                                <SelectItem value="Enviado">Enviado</SelectItem>
                                <SelectItem value="Entregado">Entregado</SelectItem>
                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              Pedido: {selectedOrder.id} • Cliente: {selectedOrder.customer} • Total: ${selectedOrder.total.toLocaleString()}
                            </p>
                          </div>

                          {/* Indicador de cambio */}
                          {editingOrderStatus !== selectedOrder.status ? (
                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                              <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                El estado cambiará al hacer clic en "Guardar Cambios"
                              </p>
                            </div>
                          ) : (
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Sin cambios - Selecciona un estado diferente
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2 pt-4">
                            <Button 
                              onClick={handleUpdateOrderStatus}
                              className="flex-1"
                              disabled={editingOrderStatus === selectedOrder.status}
                            >
                              {editingOrderStatus === selectedOrder.status ? 'Sin Cambios' : 'Guardar Cambios'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setEditOrderDialogOpen(false)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
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
                        <Input
                          placeholder="Buscar clientes por nombre, email o teléfono..."
                          className="pl-10"
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    {customerSearch && (
                      <Button variant="outline" onClick={() => setCustomerSearch("")}>
                        <X className="h-4 w-4 mr-2" />
                        Limpiar
                      </Button>
                    )}
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
                          customers
                            .filter((c) => {
                              if (!customerSearch.trim()) return true
                              const q = customerSearch.toLowerCase()
                              return (
                                (c.name || "").toLowerCase().includes(q) ||
                                (c.email || "").toLowerCase().includes(q) ||
                                (c.phone || "").toLowerCase().includes(q)
                              )
                            })
                            .map((customer) => {
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
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Ver perfil"
                                      onClick={() => openViewCustomer(customer)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Editar"
                                      onClick={() => openEditCustomer(customer)}
                                    >
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
              {/* Actualización de stock desde proveedores - Solo admin */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Actualización de stock de productos</CardTitle>
                      <CardDescription>Sincroniza inventario desde cada proveedor. Solo administradores pueden ejecutar estas acciones.</CardDescription>
                    </div>
                    <Badge variant="secondary">Solo admin</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={handleSyncProducts}
                      disabled={syncingProducts || syncingPromocion || syncingInnovation || syncingDoblevela || syncingPromoopcion}
                    >
                      {syncingProducts ? (
                        <>
                          <Package className="h-4 w-4 mr-2 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          For Promotional
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSyncPromocion}
                      disabled={syncingProducts || syncingPromocion || syncingInnovation || syncingDoblevela || syncingPromoopcion}
                    >
                      {syncingPromocion ? (
                        <>
                          <Package className="h-4 w-4 mr-2 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Promopción
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSyncDoblevela}
                      disabled={syncingProducts || syncingPromocion || syncingInnovation || syncingDoblevela || syncingPromoopcion}
                    >
                      {syncingDoblevela ? (
                        <>
                          <Package className="h-4 w-4 mr-2 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Doblevela
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSyncInnovation}
                      disabled={syncingProducts || syncingPromocion || syncingInnovation || syncingDoblevela || syncingPromoopcion}
                    >
                      {syncingInnovation ? (
                        <>
                          <Package className="h-4 w-4 mr-2 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Innovation Line
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSyncPromoopcion}
                      disabled={syncingProducts || syncingPromocion || syncingInnovation || syncingDoblevela || syncingPromoopcion}
                    >
                      {syncingPromoopcion ? (
                        <>
                          <Package className="h-4 w-4 mr-2 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          PromoOpción
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={openNewCoupon}
                    >
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditCoupon(coupon)}
                                  title="Editar cupón"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary"
                                  onClick={() => deleteCoupon(coupon)}
                                  title="Eliminar cupón"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {coupons.length === 0 && !loadingCoupons && (
                      <div className="py-10 text-center">
                        <Tag className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No hay cupones creados todavía
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={openNewCoupon}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Crear primer cupón
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quotations */}
            <TabsContent value="quotations" className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold">Cotizaciones y propuestas</h2>
                  <p className="text-sm text-muted-foreground">
                    Genera cotizaciones profesionales con productos del catálogo
                  </p>
                </div>
                <Button onClick={openNewQuoteEditor}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva cotización
                </Button>
              </div>

              {/* KPIs */}
              {(() => {
                const stats = adminQuotations.reduce(
                  (acc, q) => {
                    acc.total += 1
                    acc.totalAmount += Number(q.total || 0)
                    if (q.status === "accepted" || q.status === "converted") {
                      acc.accepted += 1
                      acc.acceptedAmount += Number(q.total || 0)
                    }
                    if (q.status === "draft" || q.status === "sent") acc.pending += 1
                    return acc
                  },
                  { total: 0, accepted: 0, pending: 0, totalAmount: 0, acceptedAmount: 0 }
                )
                const conversion = stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0
                return (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground">Total cotizaciones</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground">Pendientes</p>
                        <p className="text-2xl font-bold text-blue-700">{stats.pending}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground">Conversión</p>
                        <p className="text-2xl font-bold text-green-700">
                          {conversion.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stats.accepted} aceptadas
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground">Monto cotizado</p>
                        <p className="text-2xl font-bold">
                          ${Math.round(stats.totalAmount).toLocaleString("es-MX")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${Math.round(stats.acceptedAmount).toLocaleString("es-MX")} aceptado
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )
              })()}

              {/* Búsqueda + filtros */}
              <Card>
                <CardContent className="pt-6 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por número, cliente, email..."
                      className="pl-10"
                      value={quotationSearch}
                      onChange={(e) => setQuotationSearch(e.target.value)}
                    />
                  </div>
                  <Select value={quotationFilter} onValueChange={setQuotationFilter}>
                    <SelectTrigger className="w-full sm:w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="sent">Enviada</SelectItem>
                      <SelectItem value="accepted">Aceptada</SelectItem>
                      <SelectItem value="rejected">Rechazada</SelectItem>
                      <SelectItem value="expired">Expirada</SelectItem>
                      <SelectItem value="converted">Convertida</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Lista */}
              {loadingAdminQuotations ? (
                <Card>
                  <CardContent className="py-10 text-center">
                    <Calculator className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
                    <p className="text-sm text-muted-foreground">Cargando cotizaciones...</p>
                  </CardContent>
                </Card>
              ) : (() => {
                const filtered = adminQuotations.filter((q) => {
                  if (quotationFilter !== "all" && q.status !== quotationFilter) return false
                  if (!quotationSearch.trim()) return true
                  const term = quotationSearch.toLowerCase().trim()
                  const ci = q.contact_info || {}
                  return (
                    (q.quotation_number || "").toLowerCase().includes(term) ||
                    (ci.contactName || "").toLowerCase().includes(term) ||
                    (ci.companyName || "").toLowerCase().includes(term) ||
                    (ci.email || "").toLowerCase().includes(term) ||
                    (ci.phone || "").toLowerCase().includes(term)
                  )
                })
                if (filtered.length === 0) {
                  return (
                    <Card>
                      <CardContent className="py-12 text-center space-y-3">
                        <Calculator className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="font-medium">
                          {adminQuotations.length === 0
                            ? "No hay cotizaciones todavía"
                            : "No hay cotizaciones que coincidan con tu búsqueda"}
                        </p>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          {adminQuotations.length === 0
                            ? "Crea la primera cotización profesional con el botón de arriba. Puedes seleccionar productos del catálogo, vincular un cliente existente y enviar por email o WhatsApp."
                            : "Prueba con otro término o cambia el filtro de estado."}
                        </p>
                        {adminQuotations.length === 0 && (
                          <Button onClick={openNewQuoteEditor}>
                            <Plus className="h-4 w-4 mr-2" />
                            Crear primera cotización
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                }
                const statusColors: Record<string, string> = {
                  draft: "bg-gray-100 text-gray-800",
                  sent: "bg-blue-100 text-blue-800",
                  accepted: "bg-green-100 text-green-800",
                  rejected: "bg-red-100 text-red-800",
                  expired: "bg-amber-100 text-amber-800",
                  converted: "bg-purple-100 text-purple-800",
                }
                const statusLabels: Record<string, string> = {
                  draft: "Borrador",
                  sent: "Enviada",
                  accepted: "Aceptada",
                  rejected: "Rechazada",
                  expired: "Expirada",
                  converted: "Convertida",
                }
                return (
                  <Card>
                    <CardContent className="p-0 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cotización</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead className="text-right">Items</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Vence</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.map((q) => {
                            const ci = q.contact_info || {}
                            const itemsCount = Array.isArray(q.quotation_items)
                              ? q.quotation_items.length
                              : (() => {
                                  try {
                                    return JSON.parse(q.admin_notes || "[]").length
                                  } catch {
                                    return 0
                                  }
                                })()
                            const isExpired =
                              q.valid_until &&
                              new Date(q.valid_until).getTime() < Date.now() &&
                              q.status !== "accepted" &&
                              q.status !== "converted"
                            return (
                              <TableRow
                                key={q.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => setDetailQuotation(q)}
                              >
                                <TableCell>
                                  <div>
                                    <p className="font-mono font-semibold text-sm">
                                      {q.quotation_number}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(q.created_at).toLocaleDateString("es-MX", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="min-w-0">
                                    <p className="font-medium truncate max-w-[200px]">
                                      {ci.contactName || "—"}
                                    </p>
                                    {ci.companyName && (
                                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {ci.companyName}
                                      </p>
                                    )}
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                      {ci.email}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge variant="outline">{itemsCount}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  ${(q.total || 0).toLocaleString("es-MX", {
                                    minimumFractionDigits: 2,
                                  })}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      statusColors[q.status] || "bg-gray-100 text-gray-800"
                                    }
                                  >
                                    {statusLabels[q.status] || q.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {q.valid_until ? (
                                    <span
                                      className={`text-xs ${
                                        isExpired ? "text-red-600 font-medium" : ""
                                      }`}
                                    >
                                      {new Date(q.valid_until).toLocaleDateString("es-MX", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                      {isExpired && " · Vencida"}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div
                                    className="flex justify-end gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Ver detalle"
                                      onClick={() => setDetailQuotation(q)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Editar"
                                      onClick={() => openEditQuoteEditor(q)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Duplicar"
                                      onClick={() => duplicateQuotation(q)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Imprimir / PDF"
                                      onClick={() => openQuotationPrint(q)}
                                    >
                                      <Printer className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Enviar email"
                                      disabled={sendingQuotationEmail === q.id}
                                      onClick={() => handleSendQuotationEmail(q)}
                                    >
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-green-700 hover:bg-green-50"
                                      title="Enviar WhatsApp"
                                      disabled={sendingQuotationWA === q.id || !ci.phone}
                                      onClick={() => handleSendQuotationWA(q)}
                                    >
                                      <Phone className="h-4 w-4" />
                                    </Button>
                                    {q.status !== "converted" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-purple-700 hover:bg-purple-50"
                                        title="Convertir a pedido"
                                        onClick={() => setConvertingQuotation(q)}
                                      >
                                        <ArrowRight className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive"
                                      title="Eliminar"
                                      disabled={deletingQuotationId === q.id}
                                      onClick={() => deleteQuotation(q)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )
              })()}
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
                  ) : usersError ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <p className="text-destructive text-sm">{usersError}</p>
                      <Button variant="outline" size="sm" onClick={() => loadUsers()}>
                        Reintentar
                      </Button>
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
                <Dialog
                  open={!!editingUser}
                  onOpenChange={(open) => {
                    if (!open) {
                      setEditingUser(null)
                      setEditUserPassword("")
                      setEditUserPasswordConfirm("")
                    }
                  }}
                >
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
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Cambiar contraseña</p>
                        <p className="text-xs text-muted-foreground">
                          Deja en blanco si no quieres cambiar la contraseña. Mínimo 6 caracteres.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Nueva contraseña</Label>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              value={editUserPassword}
                              onChange={(e) => setEditUserPassword(e.target.value)}
                              autoComplete="new-password"
                            />
                          </div>
                          <div>
                            <Label>Confirmar contraseña</Label>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              value={editUserPasswordConfirm}
                              onChange={(e) => setEditUserPasswordConfirm(e.target.value)}
                              autoComplete="new-password"
                            />
                          </div>
                        </div>
                        {(editUserPassword || editUserPasswordConfirm) && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={updatingPassword || editUserPassword.length < 6 || editUserPassword !== editUserPasswordConfirm}
                            onClick={handleUpdateUserPassword}
                          >
                            {updatingPassword ? "Actualizando…" : "Cambiar contraseña"}
                          </Button>
                        )}
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

            {/* Contenido del sitio (CMS) */}
            <TabsContent value="content" className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Contenido del sitio</h2>
                <p className="text-muted-foreground">
                  Edita textos e imágenes de las páginas del front (Inicio, Nosotros, Productos). Los visitantes verán los cambios al guardar.
                </p>
              </div>
              <AdminSiteContentEditor />
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
                {integrationsStatus.map((integration, index) => (
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

                {/* Configurador de la calculadora de precios */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calculator className="h-5 w-5 text-primary" />
                          Calculadora de precios
                        </CardTitle>
                        <CardDescription>
                          Márgenes por tramo de cantidad y costos de extras (placa, ponchado, tratamiento). Se aplican en el cotizador y en la ficha de producto.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {loadingCotizadorConfig ? (
                      <p className="text-sm text-muted-foreground">Cargando configuración…</p>
                    ) : (
                      <>
                        <div className="space-y-4">
                          <h3 className="font-semibold text-sm">Márgenes por cantidad</h3>
                          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            <div className="space-y-2">
                              <Label>Bajo: hasta (uds)</Label>
                              <Input
                                type="number"
                                value={cotizadorConfig.margins.low.threshold}
                                onChange={(e) =>
                                  setCotizadorConfig({
                                    ...cotizadorConfig,
                                    margins: {
                                      ...cotizadorConfig.margins,
                                      low: { ...cotizadorConfig.margins.low, threshold: parseInt(e.target.value) || 0 },
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Bajo: margen (%)</Label>
                              <Input
                                type="number"
                                value={cotizadorConfig.margins.low.percentage}
                                onChange={(e) =>
                                  setCotizadorConfig({
                                    ...cotizadorConfig,
                                    margins: {
                                      ...cotizadorConfig.margins,
                                      low: { ...cotizadorConfig.margins.low, percentage: parseInt(e.target.value) || 0 },
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Medio: hasta (uds)</Label>
                              <Input
                                type="number"
                                value={cotizadorConfig.margins.medium.threshold}
                                onChange={(e) =>
                                  setCotizadorConfig({
                                    ...cotizadorConfig,
                                    margins: {
                                      ...cotizadorConfig.margins,
                                      medium: { ...cotizadorConfig.margins.medium, threshold: parseInt(e.target.value) || 0 },
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Medio: margen (%)</Label>
                              <Input
                                type="number"
                                value={cotizadorConfig.margins.medium.percentage}
                                onChange={(e) =>
                                  setCotizadorConfig({
                                    ...cotizadorConfig,
                                    margins: {
                                      ...cotizadorConfig.margins,
                                      medium: { ...cotizadorConfig.margins.medium, percentage: parseInt(e.target.value) || 0 },
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Alto: desde (uds)</Label>
                              <Input
                                type="number"
                                value={cotizadorConfig.margins.high.threshold}
                                onChange={(e) =>
                                  setCotizadorConfig({
                                    ...cotizadorConfig,
                                    margins: {
                                      ...cotizadorConfig.margins,
                                      high: { ...cotizadorConfig.margins.high, threshold: parseInt(e.target.value) || 0 },
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Alto: margen (%)</Label>
                              <Input
                                type="number"
                                value={cotizadorConfig.margins.high.percentage}
                                onChange={(e) =>
                                  setCotizadorConfig({
                                    ...cotizadorConfig,
                                    margins: {
                                      ...cotizadorConfig.margins,
                                      high: { ...cotizadorConfig.margins.high, percentage: parseInt(e.target.value) || 0 },
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                          <h3 className="font-semibold text-sm">Costos adicionales (MXN)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Placa de tampografía</Label>
                              <Input
                                type="number"
                                value={cotizadorConfig.extras.placa}
                                onChange={(e) =>
                                  setCotizadorConfig({
                                    ...cotizadorConfig,
                                    extras: { ...cotizadorConfig.extras, placa: parseFloat(e.target.value) || 0 },
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Ponchado de bordado</Label>
                              <Input
                                type="number"
                                value={cotizadorConfig.extras.ponchado}
                                onChange={(e) =>
                                  setCotizadorConfig({
                                    ...cotizadorConfig,
                                    extras: { ...cotizadorConfig.extras, ponchado: parseFloat(e.target.value) || 0 },
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Tratamiento especial</Label>
                              <Input
                                type="number"
                                value={cotizadorConfig.extras.tratamiento}
                                onChange={(e) =>
                                  setCotizadorConfig({
                                    ...cotizadorConfig,
                                    extras: { ...cotizadorConfig.extras, tratamiento: parseFloat(e.target.value) || 0 },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setCotizadorConfig(defaultCotizadorConfig)}
                          >
                            Restaurar valores por defecto
                          </Button>
                          <Button
                            onClick={saveCotizadorConfig}
                            disabled={savingCotizadorConfig}
                          >
                            {savingCotizadorConfig ? "Guardando…" : "Guardar configuración"}
                          </Button>
                        </div>
                      </>
                    )}
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
              {/* Configuración de precios y productos: acceso rápido y resumen */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Configuración de precios y productos
                  </CardTitle>
                  <CardDescription>
                    Gestiona el catálogo, precios y aplica márgenes de ganancia de forma masiva.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    {loadingProducts ? "Cargando..." : `${products.length} productos en el catálogo`}
                  </p>
                  <Button onClick={() => setActiveSection("products")} className="bg-primary hover:bg-primary/90">
                    <Package className="h-4 w-4 mr-2" />
                    Ver productos y configuración masiva de precios
                  </Button>
                </CardContent>
              </Card>

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

            {/* Shipping Configuration */}
            {activeSection === "shipping-config" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Configuración de Envíos</CardTitle>
                        <CardDescription>
                          Administra métodos, zonas, costos y reglas de envío
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={saveShippingConfig}
                        disabled={savingShippingConfig}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {savingShippingConfig ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingShippingConfig ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                          <p className="text-muted-foreground">Cargando configuración...</p>
                        </div>
                      </div>
                    ) : (
                      <Tabs defaultValue="methods" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="methods">Métodos</TabsTrigger>
                          <TabsTrigger value="zones">Zonas</TabsTrigger>
                          <TabsTrigger value="general">General</TabsTrigger>
                          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                        </TabsList>

                        {/* Métodos de Envío */}
                        <TabsContent value="methods" className="space-y-4">
                          <h3 className="text-lg font-semibold">Métodos de Envío</h3>
                          
                          {Object.entries(shippingConfig.methods).map(([key, method]: [string, any]) => (
                            <Card key={key}>
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base">{method.name}</CardTitle>
                                  <Switch
                                    checked={method.enabled}
                                    onCheckedChange={(checked) => 
                                      updateShippingMethod(key, 'enabled', checked)
                                    }
                                  />
                                </div>
                                <CardDescription>{method.description}</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor={`${key}-cost`}>Costo Base</Label>
                                    <Input
                                      id={`${key}-cost`}
                                      type="number"
                                      value={method.base_cost}
                                      onChange={(e) => 
                                        updateShippingMethod(key, 'base_cost', Number(e.target.value))
                                      }
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`${key}-threshold`}>Envío Gratis desde</Label>
                                    <Input
                                      id={`${key}-threshold`}
                                      type="number"
                                      value={method.free_shipping_threshold}
                                      onChange={(e) => 
                                        updateShippingMethod(key, 'free_shipping_threshold', Number(e.target.value))
                                      }
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor={`${key}-description`}>Descripción</Label>
                                  <Textarea
                                    id={`${key}-description`}
                                    value={method.description}
                                    onChange={(e) => 
                                      updateShippingMethod(key, 'description', e.target.value)
                                    }
                                    rows={2}
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </TabsContent>

                        {/* Zonas de Envío */}
                        <TabsContent value="zones" className="space-y-4">
                          <h3 className="text-lg font-semibold">Zonas de Envío</h3>
                          
                          {Object.entries(shippingConfig.zones).map(([key, zone]: [string, any]) => (
                            <Card key={key}>
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base">{zone.name}</CardTitle>
                                  <Switch
                                    checked={zone.enabled}
                                    onCheckedChange={(checked) => 
                                      updateShippingZone(key, 'enabled', checked)
                                    }
                                  />
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div>
                                  <Label htmlFor={`${key}-multiplier`}>Multiplicador de Costo</Label>
                                  <Input
                                    id={`${key}-multiplier`}
                                    type="number"
                                    step="0.1"
                                    value={zone.multiplier}
                                    onChange={(e) => 
                                      updateShippingZone(key, 'multiplier', Number(e.target.value))
                                    }
                                    placeholder="1.0"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    El costo base se multiplicará por este valor para esta zona
                                  </p>
                                </div>
                                <div>
                                  <Label htmlFor={`${key}-states`}>Estados Incluidos</Label>
                                  <Input
                                    id={`${key}-states`}
                                    value={Array.isArray(zone.states) ? zone.states.join(', ') : zone.states}
                                    onChange={(e) => 
                                      updateShippingZone(key, 'states', e.target.value.split(',').map(s => s.trim()))
                                    }
                                    placeholder="CDMX, Estado de México"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Separa los estados con comas. Usa "all" para todos los estados.
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </TabsContent>

                        {/* Configuración General */}
                        <TabsContent value="general" className="space-y-4">
                          <h3 className="text-lg font-semibold">Configuración General</h3>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Envío Gratis</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Habilitar Envío Gratis</Label>
                                  <p className="text-xs text-muted-foreground">
                                    Ofrecer envío gratis al alcanzar un monto mínimo
                                  </p>
                                </div>
                                <Switch
                                  checked={shippingConfig.general.free_shipping_enabled}
                                  onCheckedChange={(checked) => 
                                    updateShippingGeneral('free_shipping_enabled', checked)
                                  }
                                />
                              </div>
                              {shippingConfig.general.free_shipping_enabled && (
                                <div>
                                  <Label htmlFor="free-shipping-threshold">Monto Mínimo para Envío Gratis</Label>
                                  <Input
                                    id="free-shipping-threshold"
                                    type="number"
                                    value={shippingConfig.general.free_shipping_threshold}
                                    onChange={(e) => 
                                      updateShippingGeneral('free_shipping_threshold', Number(e.target.value))
                                    }
                                    placeholder="3000"
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Costos Adicionales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <Label htmlFor="handling-fee">Cargo por Manejo</Label>
                                <Input
                                  id="handling-fee"
                                  type="number"
                                  value={shippingConfig.general.handling_fee}
                                  onChange={(e) => 
                                    updateShippingGeneral('handling_fee', Number(e.target.value))
                                  }
                                  placeholder="0"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Cargo adicional por procesamiento y embalaje
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Impuestos Incluidos</Label>
                                  <p className="text-xs text-muted-foreground">
                                    Los precios de envío incluyen impuestos
                                  </p>
                                </div>
                                <Switch
                                  checked={shippingConfig.general.tax_included}
                                  onCheckedChange={(checked) => 
                                    updateShippingGeneral('tax_included', checked)
                                  }
                                />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Tiempos de Entrega</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="delivery-min">Días Mínimos</Label>
                                  <Input
                                    id="delivery-min"
                                    type="number"
                                    value={shippingConfig.general.estimated_delivery_days?.min || 5}
                                    onChange={(e) => 
                                      updateShippingGeneral('estimated_delivery_days', {
                                        ...shippingConfig.general.estimated_delivery_days,
                                        min: Number(e.target.value)
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="delivery-max">Días Máximos</Label>
                                  <Input
                                    id="delivery-max"
                                    type="number"
                                    value={shippingConfig.general.estimated_delivery_days?.max || 7}
                                    onChange={(e) => 
                                      updateShippingGeneral('estimated_delivery_days', {
                                        ...shippingConfig.general.estimated_delivery_days,
                                        max: Number(e.target.value)
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Notificaciones */}
                        <TabsContent value="notifications" className="space-y-4">
                          <h3 className="text-lg font-semibold">Notificaciones de Envío</h3>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Configurar Notificaciones</CardTitle>
                              <CardDescription>
                                Alertas automáticas sobre el estado de los envíos
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {Object.entries({
                                send_shipping_confirmation: 'Confirmar Envío',
                                send_tracking_updates: 'Actualizaciones de Rastreo',
                                send_delivery_confirmation: 'Confirmar Entrega',
                                notify_delays: 'Notificar Retrasos',
                              }).map(([key, label]) => (
                                <div key={key} className="flex items-center justify-between">
                                  <div>
                                    <Label>{label}</Label>
                                    <p className="text-xs text-muted-foreground">
                                      {key === 'send_shipping_confirmation' && 'Enviar confirmación cuando el pedido sea enviado'}
                                      {key === 'send_tracking_updates' && 'Actualizaciones sobre el estado del envío'}
                                      {key === 'send_delivery_confirmation' && 'Confirmar cuando el pedido sea entregado'}
                                      {key === 'notify_delays' && 'Notificar al cliente sobre retrasos'}
                                    </p>
                                  </div>
                                  <Switch
                                    checked={shippingConfig.notifications[key]}
                                    onCheckedChange={(checked) => {
                                      setShippingConfig((prev: any) => ({
                                        ...prev,
                                        notifications: {
                                          ...prev.notifications,
                                          [key]: checked
                                        }
                                      }))
                                    }}
                                  />
                                </div>
                              ))}
                              
                              <Separator className="my-4" />
                              
                              <div className="space-y-4">
                                <h4 className="font-medium">Canales de Notificación</h4>
                                {Object.entries({
                                  email_notifications: 'Email',
                                  sms_notifications: 'SMS',
                                  whatsapp_notifications: 'WhatsApp',
                                }).map(([key, label]) => (
                                  <div key={key} className="flex items-center justify-between">
                                    <Label>{label}</Label>
                                    <Switch
                                      checked={shippingConfig.notifications[key]}
                                      onCheckedChange={(checked) => {
                                        setShippingConfig((prev: any) => ({
                                          ...prev,
                                          notifications: {
                                            ...prev.notifications,
                                            [key]: checked
                                          }
                                        }))
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Cotizador Configuration */}
            {activeSection === "cotizador-config" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Configuración del Cotizador</CardTitle>
                        <CardDescription>
                          Administra márgenes de ganancia y costos de extras
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={saveCotizadorConfig}
                        disabled={savingCotizadorConfig}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {savingCotizadorConfig ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingCotizadorConfig ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                          <p className="text-muted-foreground">Cargando configuración...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Márgenes de Ganancia */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Márgenes de Ganancia</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            Define los márgenes según el volumen del pedido. Los márgenes se aplican automáticamente en el cotizador.
                          </p>

                          <div className="space-y-4">
                            {/* Margen Bajo */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Margen Bajo (Pedidos Pequeños)</CardTitle>
                                <CardDescription>
                                  Para pedidos de hasta {cotizadorConfig.margins.low.threshold} unidades
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="margin-low-threshold">Hasta (unidades)</Label>
                                    <Input
                                      id="margin-low-threshold"
                                      type="number"
                                      value={cotizadorConfig.margins.low.threshold}
                                      onChange={(e) => 
                                        updateCotizadorMargin('low', 'threshold', Number(e.target.value))
                                      }
                                      min={1}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="margin-low-percentage">Margen (%)</Label>
                                    <Input
                                      id="margin-low-percentage"
                                      type="number"
                                      value={cotizadorConfig.margins.low.percentage}
                                      onChange={(e) => 
                                        updateCotizadorMargin('low', 'percentage', Number(e.target.value))
                                      }
                                      min={0}
                                      max={100}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Ejemplo: 30% de margen = precio final incluye 30% de ganancia
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Margen Medio */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Margen Medio</CardTitle>
                                <CardDescription>
                                  Para pedidos de {cotizadorConfig.margins.low.threshold + 1} a {cotizadorConfig.margins.medium.threshold} unidades
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="margin-medium-threshold">Hasta (unidades)</Label>
                                    <Input
                                      id="margin-medium-threshold"
                                      type="number"
                                      value={cotizadorConfig.margins.medium.threshold}
                                      onChange={(e) => 
                                        updateCotizadorMargin('medium', 'threshold', Number(e.target.value))
                                      }
                                      min={cotizadorConfig.margins.low.threshold + 1}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="margin-medium-percentage">Margen (%)</Label>
                                    <Input
                                      id="margin-medium-percentage"
                                      type="number"
                                      value={cotizadorConfig.margins.medium.percentage}
                                      onChange={(e) => 
                                        updateCotizadorMargin('medium', 'percentage', Number(e.target.value))
                                      }
                                      min={0}
                                      max={100}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Margen Alto */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Margen Alto (Pedidos Grandes)</CardTitle>
                                <CardDescription>
                                  Para pedidos de más de {cotizadorConfig.margins.medium.threshold} unidades
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-muted-foreground">Desde (unidades)</Label>
                                    <Input
                                      disabled
                                      value={`${cotizadorConfig.margins.medium.threshold + 1}+`}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="margin-high-percentage">Margen (%)</Label>
                                    <Input
                                      id="margin-high-percentage"
                                      type="number"
                                      value={cotizadorConfig.margins.high.percentage}
                                      onChange={(e) => 
                                        updateCotizadorMargin('high', 'percentage', Number(e.target.value))
                                      }
                                      min={0}
                                      max={100}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Costos de Extras */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Costos de Extras</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            Precios adicionales que se pueden agregar a las cotizaciones según el servicio.
                          </p>

                          <div className="grid md:grid-cols-3 gap-4">
                            {/* Placa */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Placa de Tampografía</CardTitle>
                                <CardDescription>
                                  Costo de preparación de placa (una sola vez)
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <Label htmlFor="extra-placa">Costo (MXN)</Label>
                                <Input
                                  id="extra-placa"
                                  type="number"
                                  value={cotizadorConfig.extras.placa}
                                  onChange={(e) => 
                                    updateCotizadorExtra('placa', Number(e.target.value))
                                  }
                                  min={0}
                                  placeholder="280"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                  Se aplica en tampografía y vidrio/metal/rubber
                                </p>
                              </CardContent>
                            </Card>

                            {/* Ponchado */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Ponchado de Bordado</CardTitle>
                                <CardDescription>
                                  Costo de preparación para bordado
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <Label htmlFor="extra-ponchado">Costo (MXN)</Label>
                                <Input
                                  id="extra-ponchado"
                                  type="number"
                                  value={cotizadorConfig.extras.ponchado}
                                  onChange={(e) => 
                                    updateCotizadorExtra('ponchado', Number(e.target.value))
                                  }
                                  min={0}
                                  placeholder="280"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                  Se aplica solo en servicio de bordado
                                </p>
                              </CardContent>
                            </Card>

                            {/* Tratamiento */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Tratamiento Especial</CardTitle>
                                <CardDescription>
                                  Costo de tratamiento adicional
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <Label htmlFor="extra-tratamiento">Costo (MXN)</Label>
                                <Input
                                  id="extra-tratamiento"
                                  type="number"
                                  value={cotizadorConfig.extras.tratamiento}
                                  onChange={(e) => 
                                    updateCotizadorExtra('tratamiento', Number(e.target.value))
                                  }
                                  min={0}
                                  placeholder="150"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                  Se puede aplicar a cualquier servicio
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Preview de Cálculos */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Preview de Márgenes</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Cómo se aplicarán los márgenes según la cantidad
                          </p>

                          <div className="grid md:grid-cols-3 gap-4">
                            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                              <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                  <p className="text-sm text-muted-foreground">1 - {cotizadorConfig.margins.low.threshold} unidades</p>
                                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {cotizadorConfig.margins.low.percentage}%
                                  </p>
                                  <p className="text-xs text-muted-foreground">Margen de ganancia</p>
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                              <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                  <p className="text-sm text-muted-foreground">
                                    {cotizadorConfig.margins.low.threshold + 1} - {cotizadorConfig.margins.medium.threshold} unidades
                                  </p>
                                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                    {cotizadorConfig.margins.medium.percentage}%
                                  </p>
                                  <p className="text-xs text-muted-foreground">Margen de ganancia</p>
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                              <CardContent className="pt-6">
                                <div className="text-center space-y-2">
                                  <p className="text-sm text-muted-foreground">
                                    {cotizadorConfig.margins.medium.threshold + 1}+ unidades
                                  </p>
                                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {cotizadorConfig.margins.high.percentage}%
                                  </p>
                                  <p className="text-xs text-muted-foreground">Margen de ganancia</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="mt-6 bg-muted/50 p-4 rounded-lg">
                            <h4 className="font-medium mb-3">Ejemplo de Cálculo:</h4>
                            <div className="space-y-2 text-sm">
                              <p className="flex justify-between">
                                <span className="text-muted-foreground">Costo base de 100 unidades:</span>
                                <span className="font-medium">$1,000 MXN</span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-muted-foreground">Margen aplicado:</span>
                                <span className="font-medium text-amber-600">
                                  {cotizadorConfig.margins.low.percentage}%
                                </span>
                              </p>
                              <Separator />
                              <p className="flex justify-between text-base">
                                <span className="font-semibold">Precio final al cliente:</span>
                                <span className="font-bold text-primary">
                                  ${Math.round(1000 / (1 - cotizadorConfig.margins.low.percentage / 100)).toLocaleString()} MXN
                                </span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Ganancia: ${Math.round(1000 / (1 - cotizadorConfig.margins.low.percentage / 100) - 1000).toLocaleString()} MXN
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Users Management */}
            {activeSection === "users" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Gestión de Usuarios</CardTitle>
                        <CardDescription>
                          Administra usuarios registrados y sus permisos
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={loadUsers}
                          variant="outline"
                          disabled={loadingUsers}
                        >
                          {loadingUsers ? 'Cargando...' : 'Actualizar'}
                        </Button>
                        <Button 
                          onClick={() => setCreateUserDialogOpen(true)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Añadir Usuario
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingUsers ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                          <p className="text-muted-foreground">Cargando usuarios...</p>
                        </div>
                      </div>
                    ) : users.length === 0 ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No hay usuarios registrados</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Estadísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                            <CardContent className="pt-6">
                              <div className="text-center space-y-2">
                                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto" />
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                  {users.length}
                                </p>
                                <p className="text-sm text-muted-foreground">Total de Usuarios</p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                            <CardContent className="pt-6">
                              <div className="text-center space-y-2">
                                <Shield className="h-8 w-8 text-amber-600 dark:text-amber-400 mx-auto" />
                                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                  {users.filter(u => u.role === 'admin').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Administradores</p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                            <CardContent className="pt-6">
                              <div className="text-center space-y-2">
                                <UserCog className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto" />
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                  {users.filter(u => u.role === 'customer').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Clientes</p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Separator />

                        {/* Tabla de Usuarios */}
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Registro</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {users.map((user) => (
                                <TableRow key={user.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-sm font-semibold text-primary">
                                          {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="font-medium">{user.full_name || 'Sin nombre'}</p>
                                        <p className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm">{user.email || 'Sin email'}</span>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={
                                        user.role === 'admin' ? 'default' : 
                                        user.role === 'staff' ? 'secondary' : 
                                        'outline'
                                      }
                                      className={
                                        user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                        user.role === 'staff' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      }
                                    >
                                      {user.role === 'admin' ? '👑 Admin' : 
                                       user.role === 'staff' ? '⚙️ Staff' : 
                                       '👤 Cliente'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm">{user.company_name || '-'}</span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm">{user.phone || '-'}</span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(user.created_at).toLocaleDateString('es-MX', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditUser(user)}
                                    >
                                      <Edit className="h-3 w-3 mr-1" />
                                      Editar
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Dialog: Crear Usuario */}
            <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Agrega un nuevo usuario y asigna su rol en la plataforma
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Formulario de nuevo usuario */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="new-full-name">Nombre Completo *</Label>
                      <Input
                        id="new-full-name"
                        placeholder="Juan Pérez"
                        value={newUser.full_name}
                        onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="new-email">Email *</Label>
                      <Input
                        id="new-email"
                        type="email"
                        placeholder="juan@empresa.com"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="new-phone">Teléfono</Label>
                      <Input
                        id="new-phone"
                        placeholder="+52 55 1234 5678"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="new-password">Contraseña *</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Mínimo 6 caracteres. El usuario podrá cambiarla después.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="new-role">Rol del Usuario *</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value: "customer" | "admin" | "staff") =>
                          setNewUser({ ...newUser, role: value })
                        }
                      >
                        <SelectTrigger id="new-role">
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">
                            <div className="flex items-center gap-2">
                              <span>👤</span>
                              <div>
                                <p className="font-medium">Cliente</p>
                                <p className="text-xs text-muted-foreground">Puede realizar pedidos</p>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="staff">
                            <div className="flex items-center gap-2">
                              <span>⚙️</span>
                              <div>
                                <p className="font-medium">Staff</p>
                                <p className="text-xs text-muted-foreground">Acceso limitado al admin</p>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <span>👑</span>
                              <div>
                                <p className="font-medium">Administrador</p>
                                <p className="text-xs text-muted-foreground">Acceso completo</p>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/30">
                      <Switch
                        id="send-email"
                        checked={newUser.sendEmail}
                        onCheckedChange={(checked) => setNewUser({ ...newUser, sendEmail: checked })}
                      />
                      <Label htmlFor="send-email" className="cursor-pointer">
                        Enviar email de bienvenida al usuario
                      </Label>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCreateUserDialogOpen(false)
                        // Limpiar formulario
                        setNewUser({
                          full_name: "",
                          email: "",
                          phone: "",
                          role: "customer",
                          password: "",
                          sendEmail: true,
                        })
                      }}
                      disabled={creatingUser}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreateUser}
                      disabled={
                        creatingUser || 
                        !newUser.email || 
                        !newUser.password || 
                        !newUser.full_name ||
                        newUser.password.length < 6
                      }
                    >
                      {creatingUser ? (
                        <>
                          <span className="animate-pulse">Creando...</span>
                        </>
                      ) : (
                        'Crear Usuario'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Dialog: Editar Usuario */}
            <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Editar Usuario</DialogTitle>
                  <DialogDescription>
                    Modifica el rol y permisos del usuario
                  </DialogDescription>
                </DialogHeader>
                
                {editingUser && (
                  <div className="space-y-6">
                    {/* Información del Usuario */}
                    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary">
                            {editingUser.full_name?.charAt(0)?.toUpperCase() || editingUser.email?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{editingUser.full_name || 'Sin nombre'}</p>
                          <p className="text-sm text-muted-foreground">{editingUser.email || 'Sin email'}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Empresa:</p>
                          <p className="font-medium">{editingUser.company_name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Teléfono:</p>
                          <p className="font-medium">{editingUser.phone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">RFC:</p>
                          <p className="font-medium">{editingUser.tax_id || '-'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Registro:</p>
                          <p className="font-medium">
                            {new Date(editingUser.created_at).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cambiar Rol */}
                    <div className="space-y-3">
                      <Label>Rol del Usuario</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Define el nivel de acceso y permisos del usuario en la plataforma
                      </p>

                      <RadioGroup
                        value={editingUser.role}
                        onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                      >
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                          <RadioGroupItem value="customer" id="role-customer" />
                          <Label htmlFor="role-customer" className="flex-1 cursor-pointer">
                            <div>
                              <p className="font-medium">👤 Cliente</p>
                              <p className="text-xs text-muted-foreground">
                                Puede realizar pedidos y ver su historial
                              </p>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                          <RadioGroupItem value="staff" id="role-staff" />
                          <Label htmlFor="role-staff" className="flex-1 cursor-pointer">
                            <div>
                              <p className="font-medium">⚙️ Staff</p>
                              <p className="text-xs text-muted-foreground">
                                Acceso limitado al panel administrativo
                              </p>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                          <RadioGroupItem value="admin" id="role-admin" />
                          <Label htmlFor="role-admin" className="flex-1 cursor-pointer">
                            <div>
                              <p className="font-medium">👑 Administrador</p>
                              <p className="text-xs text-muted-foreground">
                                Acceso completo a todas las funciones
                              </p>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Confirmación visual */}
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <p className="font-medium text-sm text-blue-900 dark:text-blue-100">
                            Cambio de Rol
                          </p>
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-white dark:bg-gray-900">
                                {editingUser.role === 'admin' ? '👑 Admin' : 
                                 editingUser.role === 'staff' ? '⚙️ Staff' : 
                                 '👤 Cliente'}
                              </Badge>
                              <span className="text-muted-foreground">← Rol seleccionado</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditUserDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => handleUpdateUserRole(editingUser.id, editingUser.role)}
                      >
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Diálogo: Ver perfil de cliente */}
            <Dialog open={!!viewCustomer} onOpenChange={(open) => !open && setViewCustomer(null)}>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Perfil del cliente</DialogTitle>
                  <DialogDescription>
                    Información completa y pedidos recientes
                  </DialogDescription>
                </DialogHeader>
                {viewCustomer && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {(viewCustomer.full_name || viewCustomer.name || "C")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-lg truncate">
                          {viewCustomer.full_name || viewCustomer.name || "Sin nombre"}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {viewCustomer.email}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Teléfono</p>
                        <p className="font-medium">{viewCustomer.phone || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Empresa</p>
                        <p className="font-medium">{viewCustomer.company_name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">RFC</p>
                        <p className="font-medium">{viewCustomer.tax_id || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rol</p>
                        <p className="font-medium capitalize">{viewCustomer.role || "customer"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total pedidos</p>
                        <p className="font-medium">{viewCustomer.totalOrders ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total gastado</p>
                        <p className="font-medium">
                          ${Number(viewCustomer.totalSpent ?? 0).toLocaleString("es-MX")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cliente desde</p>
                        <p className="font-medium">
                          {viewCustomer.created_at
                            ? new Date(viewCustomer.created_at).toLocaleDateString("es-MX")
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ID</p>
                        <p className="font-mono text-xs truncate">{viewCustomer.id}</p>
                      </div>
                    </div>

                    {Array.isArray(viewCustomer.recentOrders) && viewCustomer.recentOrders.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Pedidos recientes</h4>
                          <div className="space-y-1.5">
                            {viewCustomer.recentOrders.map((o: any) => (
                              <div
                                key={o.id}
                                className="flex items-center justify-between text-sm border rounded-md px-3 py-2"
                              >
                                <div>
                                  <p className="font-medium">#{o.order_number || o.id.slice(0, 8)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {o.created_at ? new Date(o.created_at).toLocaleDateString("es-MX") : "—"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">
                                    ${Number(o.total ?? 0).toLocaleString("es-MX")}
                                  </p>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {o.status || "—"}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setViewCustomer(null)}>
                        Cerrar
                      </Button>
                      <Button
                        onClick={() => {
                          openEditCustomer(viewCustomer)
                          setViewCustomer(null)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar cliente
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Diálogo: Editar cliente */}
            <Dialog open={!!editCustomer} onOpenChange={(open) => !open && setEditCustomer(null)}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Editar cliente</DialogTitle>
                  <DialogDescription>
                    Los cambios se guardan en la base de datos (tabla profiles)
                  </DialogDescription>
                </DialogHeader>
                {editCustomer && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nombre completo</Label>
                      <Input
                        value={editCustomerForm.full_name}
                        onChange={(e) =>
                          setEditCustomerForm((p) => ({ ...p, full_name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={editCustomerForm.email} disabled />
                      <p className="text-xs text-muted-foreground">
                        El email es identificador y no se puede cambiar desde aquí.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Teléfono</Label>
                        <Input
                          value={editCustomerForm.phone}
                          onChange={(e) =>
                            setEditCustomerForm((p) => ({ ...p, phone: e.target.value }))
                          }
                          placeholder="+52 ..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Empresa</Label>
                        <Input
                          value={editCustomerForm.company_name}
                          onChange={(e) =>
                            setEditCustomerForm((p) => ({ ...p, company_name: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>RFC</Label>
                      <Input
                        value={editCustomerForm.tax_id}
                        onChange={(e) =>
                          setEditCustomerForm((p) => ({ ...p, tax_id: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setEditCustomer(null)}>
                        Cancelar
                      </Button>
                      <Button onClick={saveCustomer} disabled={savingCustomer}>
                        {savingCustomer ? "Guardando..." : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* =========================================
                 EDITOR de cotizaciones (crear / editar)
                 ========================================= */}
            <Dialog
              open={quoteEditorOpen}
              onOpenChange={(open) => {
                setQuoteEditorOpen(open)
                if (!open) {
                  setEditingQuotationId(null)
                }
              }}
            >
              <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuotationId ? "Editar cotización" : "Nueva cotización"}
                  </DialogTitle>
                  <DialogDescription>
                    Completa los datos del cliente, agrega productos del catálogo y define los
                    términos comerciales.
                  </DialogDescription>
                </DialogHeader>

                {(() => {
                  const totals = computeQuoteTotals(newQuoteItems, newQuoteForm)
                  return (
                    <div className="space-y-4">
                      <Tabs value={quoteEditorTab} onValueChange={(v) => setQuoteEditorTab(v as any)}>
                        <TabsList className="grid grid-cols-3 w-full">
                          <TabsTrigger value="client">
                            <Users className="h-4 w-4 mr-2" />
                            Cliente
                          </TabsTrigger>
                          <TabsTrigger value="products">
                            <Package className="h-4 w-4 mr-2" />
                            Productos {newQuoteItems.length > 0 && `(${newQuoteItems.length})`}
                          </TabsTrigger>
                          <TabsTrigger value="terms">
                            <FileText className="h-4 w-4 mr-2" />
                            Términos
                          </TabsTrigger>
                        </TabsList>

                        {/* TAB: CLIENTE */}
                        <TabsContent value="client" className="space-y-4 pt-4">
                          {/* Buscador de clientes existentes */}
                          <Card className="bg-muted/50">
                            <CardContent className="pt-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold">
                                  Buscar cliente existente
                                </Label>
                                {newQuoteForm.userId && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Vinculado
                                  </Badge>
                                )}
                              </div>
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Nombre, email, teléfono o empresa..."
                                  className="pl-10"
                                  value={clientSearchTerm}
                                  onChange={(e) => searchClientsForQuote(e.target.value)}
                                />
                              </div>
                              {searchingClients && (
                                <p className="text-xs text-muted-foreground">Buscando...</p>
                              )}
                              {clientResults.length > 0 && (
                                <div className="border rounded-lg bg-background max-h-48 overflow-y-auto">
                                  {clientResults.map((c) => (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => selectClientForQuote(c)}
                                      className="w-full text-left px-3 py-2 hover:bg-muted/50 border-b last:border-b-0"
                                    >
                                      <p className="text-sm font-medium">
                                        {c.full_name || c.name || "Sin nombre"}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {c.email} {c.phone ? `· ${c.phone}` : ""}
                                      </p>
                                    </button>
                                  ))}
                                </div>
                              )}
                              {newQuoteForm.userId && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setNewQuoteForm((p) => ({ ...p, userId: null }))
                                  }
                                  className="text-xs"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Desvincular cliente
                                </Button>
                              )}
                            </CardContent>
                          </Card>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Nombre del contacto *</Label>
                              <Input
                                value={newQuoteForm.contactName}
                                onChange={(e) =>
                                  setNewQuoteForm((p) => ({ ...p, contactName: e.target.value }))
                                }
                                placeholder="Juan Pérez"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Empresa</Label>
                              <Input
                                value={newQuoteForm.companyName}
                                onChange={(e) =>
                                  setNewQuoteForm((p) => ({ ...p, companyName: e.target.value }))
                                }
                                placeholder="Corporativo XYZ"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Email *</Label>
                              <Input
                                type="email"
                                value={newQuoteForm.email}
                                onChange={(e) =>
                                  setNewQuoteForm((p) => ({ ...p, email: e.target.value }))
                                }
                                placeholder="cliente@empresa.com"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Teléfono</Label>
                              <Input
                                value={newQuoteForm.phone}
                                onChange={(e) =>
                                  setNewQuoteForm((p) => ({ ...p, phone: e.target.value }))
                                }
                                placeholder="+52 55 1234 5678"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>RFC</Label>
                              <Input
                                value={newQuoteForm.taxId}
                                onChange={(e) =>
                                  setNewQuoteForm((p) => ({ ...p, taxId: e.target.value }))
                                }
                                placeholder="XAXX010101000"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Tipo de evento / proyecto</Label>
                              <Input
                                value={newQuoteForm.eventType}
                                onChange={(e) =>
                                  setNewQuoteForm((p) => ({ ...p, eventType: e.target.value }))
                                }
                                placeholder="Convención, kit corporativo..."
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label>Dirección de entrega</Label>
                              <Textarea
                                value={newQuoteForm.deliveryAddress}
                                onChange={(e) =>
                                  setNewQuoteForm((p) => ({
                                    ...p,
                                    deliveryAddress: e.target.value,
                                  }))
                                }
                                rows={2}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Fecha de entrega deseada</Label>
                              <Input
                                type="date"
                                value={newQuoteForm.deliveryDate}
                                onChange={(e) =>
                                  setNewQuoteForm((p) => ({
                                    ...p,
                                    deliveryDate: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Forma de pago</Label>
                              <Input
                                value={newQuoteForm.paymentTerms}
                                onChange={(e) =>
                                  setNewQuoteForm((p) => ({
                                    ...p,
                                    paymentTerms: e.target.value,
                                  }))
                                }
                                placeholder="50% anticipo / 50% contra entrega"
                              />
                            </div>
                          </div>
                        </TabsContent>

                        {/* TAB: PRODUCTOS */}
                        <TabsContent value="products" className="space-y-4 pt-4">
                          {/* Buscador del catálogo */}
                          <Card className="bg-muted/50">
                            <CardContent className="pt-4 space-y-3">
                              <Label className="text-sm font-semibold">
                                Agregar producto del catálogo
                              </Label>
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Buscar por nombre o SKU..."
                                  className="pl-10"
                                  value={catalogSearchTerm}
                                  onChange={(e) => searchCatalogForQuote(e.target.value)}
                                />
                              </div>
                              {searchingCatalog && (
                                <p className="text-xs text-muted-foreground">Buscando...</p>
                              )}
                              {catalogResults.length > 0 && (
                                <div className="border rounded-lg bg-background max-h-64 overflow-y-auto">
                                  {catalogResults.map((p) => (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onClick={() => addProductToQuote(p)}
                                      className="w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-muted/50 border-b last:border-b-0"
                                    >
                                      {p.product_images?.[0]?.url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={p.product_images[0].url}
                                          alt={p.name}
                                          className="h-10 w-10 object-cover rounded"
                                        />
                                      ) : (
                                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                          <Package className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{p.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {p.sku && `${p.sku} · `}
                                          {p.category?.name || "Sin categoría"}
                                        </p>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <p className="text-sm font-semibold">
                                          ${Number(p.price || 0).toLocaleString("es-MX")}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          stock: {p.stock_quantity ?? 0}
                                        </p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground">
                                También puedes agregar productos personalizados manualmente abajo.
                              </p>
                            </CardContent>
                          </Card>

                          {/* Líneas */}
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">
                              Líneas de la cotización
                            </Label>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setNewQuoteItems((prev) => [
                                  ...prev,
                                  {
                                    id: Date.now().toString(),
                                    productId: null,
                                    productName: "",
                                    productSku: null,
                                    quantity: 100,
                                    unitPrice: 0,
                                    customization: "",
                                    imageUrl: null,
                                  },
                                ])
                              }
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Línea libre
                            </Button>
                          </div>

                          {newQuoteItems.length === 0 ? (
                            <Card>
                              <CardContent className="py-8 text-center">
                                <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  Agrega productos desde el buscador de arriba o crea una línea
                                  libre.
                                </p>
                              </CardContent>
                            </Card>
                          ) : (
                            <div className="space-y-2">
                              {newQuoteItems.map((item) => (
                                <Card key={item.id}>
                                  <CardContent className="p-3 space-y-2">
                                    <div className="grid grid-cols-12 gap-2 items-end">
                                      <div className="col-span-12 sm:col-span-5 space-y-1">
                                        <Label className="text-xs">Producto</Label>
                                        <Input
                                          value={item.productName}
                                          onChange={(e) =>
                                            setNewQuoteItems((prev) =>
                                              prev.map((i) =>
                                                i.id === item.id
                                                  ? { ...i, productName: e.target.value }
                                                  : i
                                              )
                                            )
                                          }
                                          placeholder="Nombre del producto"
                                        />
                                        {item.productSku && (
                                          <p className="text-xs text-muted-foreground font-mono">
                                            SKU: {item.productSku}
                                          </p>
                                        )}
                                      </div>
                                      <div className="col-span-4 sm:col-span-2 space-y-1">
                                        <Label className="text-xs">Cantidad</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={item.quantity}
                                          onChange={(e) =>
                                            setNewQuoteItems((prev) =>
                                              prev.map((i) =>
                                                i.id === item.id
                                                  ? { ...i, quantity: parseInt(e.target.value) || 1 }
                                                  : i
                                              )
                                            )
                                          }
                                        />
                                      </div>
                                      <div className="col-span-4 sm:col-span-2 space-y-1">
                                        <Label className="text-xs">Precio unit.</Label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={item.unitPrice}
                                          onChange={(e) =>
                                            setNewQuoteItems((prev) =>
                                              prev.map((i) =>
                                                i.id === item.id
                                                  ? {
                                                      ...i,
                                                      unitPrice: parseFloat(e.target.value) || 0,
                                                    }
                                                  : i
                                              )
                                            )
                                          }
                                        />
                                      </div>
                                      <div className="col-span-3 sm:col-span-2 space-y-1">
                                        <Label className="text-xs">Total</Label>
                                        <p className="text-sm font-semibold pt-2">
                                          $
                                          {(item.quantity * item.unitPrice).toLocaleString(
                                            "es-MX",
                                            { minimumFractionDigits: 2 }
                                          )}
                                        </p>
                                      </div>
                                      <div className="col-span-1 flex justify-end">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-destructive h-8 w-8 p-0"
                                          onClick={() =>
                                            setNewQuoteItems((prev) =>
                                              prev.filter((i) => i.id !== item.id)
                                            )
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    <Input
                                      value={item.customization}
                                      onChange={(e) =>
                                        setNewQuoteItems((prev) =>
                                          prev.map((i) =>
                                            i.id === item.id
                                              ? { ...i, customization: e.target.value }
                                              : i
                                          )
                                        )
                                      }
                                      placeholder="Personalización: 1 tinta, logo, color, etc. (opcional)"
                                      className="text-sm"
                                    />
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        {/* TAB: TÉRMINOS */}
                        <TabsContent value="terms" className="space-y-4 pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Vigencia (días)</Label>
                              <Input
                                type="number"
                                min="1"
                                value={newQuoteForm.validDays}
                                onChange={(e) =>
                                  setNewQuoteForm((p) => ({
                                    ...p,
                                    validDays: e.target.value,
                                  }))
                                }
                              />
                              <p className="text-xs text-muted-foreground">
                                Vence el{" "}
                                {(() => {
                                  const days =
                                    Math.max(0, Math.floor(Number(newQuoteForm.validDays) || 30))
                                  const d = new Date()
                                  d.setDate(d.getDate() + days)
                                  return d.toLocaleDateString("es-MX")
                                })()}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label>Estado</Label>
                              <Select
                                value={newQuoteForm.status}
                                onValueChange={(v) =>
                                  setNewQuoteForm((p) => ({ ...p, status: v as any }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Borrador</SelectItem>
                                  <SelectItem value="sent">Enviada</SelectItem>
                                  <SelectItem value="accepted">Aceptada</SelectItem>
                                  <SelectItem value="rejected">Rechazada</SelectItem>
                                  <SelectItem value="expired">Expirada</SelectItem>
                                  <SelectItem value="converted">Convertida</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Descuento (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={newQuoteForm.discountPercent}
                                onChange={(e) =>
                                  setNewQuoteForm((p) => ({
                                    ...p,
                                    discountPercent: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Descuento adicional ($)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={newQuoteForm.discountAmount}
                                onChange={(e) =>
                                  setNewQuoteForm((p) => ({
                                    ...p,
                                    discountAmount: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>IVA (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={newQuoteForm.taxRate}
                                onChange={(e) =>
                                  setNewQuoteForm((p) => ({ ...p, taxRate: e.target.value }))
                                }
                                placeholder="16"
                              />
                              <p className="text-xs text-muted-foreground">
                                0 si la cotización va sin IVA
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label>Costo de envío ($)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={newQuoteForm.shippingCost}
                                onChange={(e) =>
                                  setNewQuoteForm((p) => ({
                                    ...p,
                                    shippingCost: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Notas para el cliente</Label>
                            <Textarea
                              value={newQuoteForm.notes}
                              onChange={(e) =>
                                setNewQuoteForm((p) => ({ ...p, notes: e.target.value }))
                              }
                              placeholder="Tiempo de entrega: 10 días hábiles. Personalización a 1 tinta. Etc."
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              Notas internas
                              <Badge variant="outline" className="text-xs">
                                Solo equipo
                              </Badge>
                            </Label>
                            <Textarea
                              value={newQuoteForm.adminNotes}
                              onChange={(e) =>
                                setNewQuoteForm((p) => ({ ...p, adminNotes: e.target.value }))
                              }
                              placeholder="Comentarios para el equipo (no visible para el cliente)..."
                              rows={2}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>

                      {/* Resumen siempre visible */}
                      <Card className="bg-muted/30 border-primary/30">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs">Subtotal</p>
                              <p className="font-semibold">
                                ${totals.subtotal.toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Descuento</p>
                              <p className="font-semibold text-red-600">
                                −${totals.discount.toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">IVA</p>
                              <p className="font-semibold">
                                ${totals.taxes.toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Envío</p>
                              <p className="font-semibold">
                                ${totals.shipping.toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                            <div className="col-span-2 sm:col-span-1 sm:text-right border-t sm:border-t-0 sm:border-l pl-3 pt-2 sm:pt-0">
                              <p className="text-muted-foreground text-xs">TOTAL</p>
                              <p className="text-xl font-bold text-primary">
                                ${totals.total.toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t">
                        <Button variant="outline" onClick={() => setQuoteEditorOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={saveAdminQuote} disabled={savingNewQuote}>
                          {savingNewQuote ? "Guardando..." : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              {editingQuotationId ? "Guardar cambios" : "Crear cotización"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                })()}
              </DialogContent>
            </Dialog>

            {/* =========================================
                 DETALLE de cotización (read-only)
                 ========================================= */}
            <Dialog
              open={!!detailQuotation}
              onOpenChange={(open) => !open && setDetailQuotation(null)}
            >
              <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-mono">
                    {detailQuotation?.quotation_number}
                  </DialogTitle>
                  <DialogDescription>
                    Detalle de la cotización
                  </DialogDescription>
                </DialogHeader>
                {detailQuotation && (() => {
                  const q = detailQuotation
                  const ci = q.contact_info || {}
                  const items = Array.isArray(q.quotation_items)
                    ? q.quotation_items
                    : (() => {
                        try {
                          return JSON.parse(q.admin_notes || "[]")
                        } catch {
                          return []
                        }
                      })()
                  const statusLabels: Record<string, string> = {
                    draft: "Borrador",
                    sent: "Enviada",
                    accepted: "Aceptada",
                    rejected: "Rechazada",
                    expired: "Expirada",
                    converted: "Convertida",
                  }
                  const statusColors: Record<string, string> = {
                    draft: "bg-gray-100 text-gray-800",
                    sent: "bg-blue-100 text-blue-800",
                    accepted: "bg-green-100 text-green-800",
                    rejected: "bg-red-100 text-red-800",
                    expired: "bg-amber-100 text-amber-800",
                    converted: "bg-purple-100 text-purple-800",
                  }
                  return (
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={statusColors[q.status] || "bg-gray-100 text-gray-800"}>
                          {statusLabels[q.status] || q.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Creada: {new Date(q.created_at).toLocaleDateString("es-MX")}
                        </span>
                        {q.valid_until && (
                          <span className="text-sm text-muted-foreground">
                            · Vigente hasta: {new Date(q.valid_until).toLocaleDateString("es-MX")}
                          </span>
                        )}
                      </div>

                      {/* Cliente */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Contacto</p>
                            <p className="font-medium">{ci.contactName || "—"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Empresa</p>
                            <p className="font-medium">{ci.companyName || "—"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Email</p>
                            <p className="font-medium break-all">{ci.email || "—"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Teléfono</p>
                            <p className="font-medium">{ci.phone || "—"}</p>
                          </div>
                          {ci.taxId && (
                            <div>
                              <p className="text-muted-foreground text-xs">RFC</p>
                              <p className="font-medium font-mono">{ci.taxId}</p>
                            </div>
                          )}
                          {ci.eventType && (
                            <div>
                              <p className="text-muted-foreground text-xs">Evento</p>
                              <p className="font-medium">{ci.eventType}</p>
                            </div>
                          )}
                          {ci.deliveryAddress && (
                            <div className="sm:col-span-2">
                              <p className="text-muted-foreground text-xs">Dirección de entrega</p>
                              <p className="font-medium">{ci.deliveryAddress}</p>
                            </div>
                          )}
                          {ci.deliveryDate && (
                            <div>
                              <p className="text-muted-foreground text-xs">Entrega deseada</p>
                              <p className="font-medium">
                                {new Date(ci.deliveryDate).toLocaleDateString("es-MX")}
                              </p>
                            </div>
                          )}
                          {ci.paymentTerms && (
                            <div>
                              <p className="text-muted-foreground text-xs">Forma de pago</p>
                              <p className="font-medium">{ci.paymentTerms}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Items */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">
                            Productos ({items.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-right">Cant.</TableHead>
                                <TableHead className="text-right">P. Unit.</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {items.map((it: any, idx: number) => {
                                const name = it.product_name || it.product || it.name || "—"
                                const qty = Number(it.quantity) || 0
                                const price = Number(it.unit_price ?? it.unitPrice) || 0
                                const sub = Number(it.subtotal ?? it.total) || qty * price
                                const customization =
                                  it.customization_data?.description ||
                                  it.customization ||
                                  null
                                return (
                                  <TableRow key={it.id || idx}>
                                    <TableCell>
                                      <div className="space-y-0.5">
                                        <p className="font-medium text-sm">{name}</p>
                                        {it.product_sku && (
                                          <p className="text-xs text-muted-foreground font-mono">
                                            {it.product_sku}
                                          </p>
                                        )}
                                        {customization && (
                                          <p className="text-xs text-muted-foreground italic">
                                            {customization}
                                          </p>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">{qty}</TableCell>
                                    <TableCell className="text-right">
                                      ${price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                      ${sub.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>

                      {/* Totales */}
                      <Card>
                        <CardContent className="pt-4 space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>
                              ${Number(q.subtotal || 0).toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          {Number(q.discount) > 0 && (
                            <div className="flex justify-between text-red-600">
                              <span>Descuento</span>
                              <span>
                                −${Number(q.discount).toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          )}
                          {Number(q.taxes) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">IVA</span>
                              <span>
                                ${Number(q.taxes).toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          )}
                          {Number(q.shipping_cost) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Envío</span>
                              <span>
                                ${Number(q.shipping_cost).toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          )}
                          <Separator className="my-2" />
                          <div className="flex justify-between text-lg font-bold">
                            <span>TOTAL</span>
                            <span className="text-primary">
                              ${Number(q.total || 0).toLocaleString("es-MX", {
                                minimumFractionDigits: 2,
                              })}{" "}
                              {q.currency || "MXN"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      {q.notes && (
                        <Card>
                          <CardContent className="pt-4 text-sm">
                            <p className="text-muted-foreground text-xs mb-1">
                              Notas para el cliente
                            </p>
                            <p className="whitespace-pre-line">{q.notes}</p>
                          </CardContent>
                        </Card>
                      )}
                      {q.admin_notes && (
                        <Card className="bg-amber-50 border-amber-200">
                          <CardContent className="pt-4 text-sm">
                            <p className="text-amber-700 text-xs mb-1 font-medium">
                              Notas internas (no visibles para el cliente)
                            </p>
                            <p className="whitespace-pre-line">{q.admin_notes}</p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Acciones */}
                      <div className="flex flex-wrap justify-end gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          onClick={() => openQuotationPrint(q)}
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          Imprimir / PDF
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDetailQuotation(null)
                            duplicateQuotation(q)
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </Button>
                        <Button
                          variant="outline"
                          disabled={sendingQuotationEmail === q.id}
                          onClick={() => handleSendQuotationEmail(q)}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          {sendingQuotationEmail === q.id ? "Enviando..." : "Enviar email"}
                        </Button>
                        {ci.phone && (
                          <Button
                            variant="outline"
                            className="text-green-700 border-green-300 hover:bg-green-50"
                            disabled={sendingQuotationWA === q.id}
                            onClick={() => handleSendQuotationWA(q)}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            {sendingQuotationWA === q.id ? "Enviando..." : "WhatsApp"}
                          </Button>
                        )}
                        {q.status !== "converted" && (
                          <Button
                            variant="outline"
                            className="text-purple-700 border-purple-300 hover:bg-purple-50"
                            onClick={() => {
                              setConvertingQuotation(q)
                              setDetailQuotation(null)
                            }}
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Convertir a pedido
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            setDetailQuotation(null)
                            openEditQuoteEditor(q)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  )
                })()}
              </DialogContent>
            </Dialog>

            {/* =========================================
                 SELECTOR DE VARIANTE (al agregar producto al editor)
                 ========================================= */}
            <Dialog
              open={!!variantSelection}
              onOpenChange={(open) => !open && setVariantSelection(null)}
            >
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Selecciona una variante
                  </DialogTitle>
                  <DialogDescription>
                    Este producto tiene varias opciones. Elige la variante que va en la cotización.
                  </DialogDescription>
                </DialogHeader>
                {variantSelection && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      {variantSelection.product.product_images?.[0]?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={variantSelection.product.product_images[0].url}
                          alt={variantSelection.product.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold truncate">
                          {variantSelection.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {variantSelection.product.sku || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                      {variantSelection.variations.map((v: any) => {
                        const price = v.price ?? variantSelection.product.price ?? 0
                        const attrs = v.attributes || {}
                        const attrPairs = Object.entries(attrs)
                          .filter(([, val]) => val != null && val !== "")
                          .slice(0, 4)
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => addVariantToQuote(v)}
                            disabled={Number(v.stock_quantity) <= 0}
                            className="text-left p-3 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="flex items-center gap-3">
                              {v.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={v.image_url}
                                  alt={v.name}
                                  className="h-10 w-10 object-cover rounded"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                  <Layers className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{v.name}</p>
                                {v.sku && (
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {v.sku}
                                  </p>
                                )}
                                {attrPairs.length > 0 && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {attrPairs
                                      .map(([k, val]) => `${k}: ${val}`)
                                      .join(" · ")}
                                  </p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-semibold">
                                  ${Number(price).toLocaleString("es-MX")}
                                </p>
                                <p
                                  className={`text-xs ${
                                    Number(v.stock_quantity) > 0
                                      ? "text-muted-foreground"
                                      : "text-red-600"
                                  }`}
                                >
                                  {Number(v.stock_quantity) > 0
                                    ? `Stock: ${v.stock_quantity}`
                                    : "Sin stock"}
                                </p>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Permite agregar el producto base sin variante específica
                          if (!variantSelection) return
                          const product = variantSelection.product
                          pushQuoteLine({
                            productId: product.id,
                            productName: product.name || "Producto",
                            productSku: product.sku || null,
                            quantity: Math.max(1, Number(product.min_quantity) || 1),
                            unitPrice: Number(product.price) || 0,
                            imageUrl:
                              product.product_images?.[0]?.url ||
                              product.image_url ||
                              null,
                          })
                          setVariantSelection(null)
                        }}
                      >
                        Agregar producto base sin variante
                      </Button>
                      <Button variant="outline" onClick={() => setVariantSelection(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* =========================================
                 CONVERTIR cotización → pedido
                 ========================================= */}
            <Dialog
              open={!!convertingQuotation}
              onOpenChange={(open) => !open && setConvertingQuotation(null)}
            >
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-purple-700" />
                    Convertir cotización en pedido
                  </DialogTitle>
                  <DialogDescription>
                    Se creará un nuevo pedido vinculado a esta cotización y la cotización
                    quedará marcada como "Convertida".
                  </DialogDescription>
                </DialogHeader>
                {convertingQuotation && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cotización</span>
                        <span className="font-mono font-semibold">
                          {convertingQuotation.quotation_number}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cliente</span>
                        <span className="font-medium">
                          {convertingQuotation.contact_info?.contactName || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-semibold text-primary">
                          ${Number(convertingQuotation.total || 0).toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Productos</span>
                        <span>
                          {Array.isArray(convertingQuotation.quotation_items)
                            ? convertingQuotation.quotation_items.length
                            : 0}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Estado de pago inicial</Label>
                      <Select
                        value={convertForm.paymentStatus}
                        onValueChange={(v) =>
                          setConvertForm((p) => ({ ...p, paymentStatus: v as any }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente de pago</SelectItem>
                          <SelectItem value="partial">Anticipo recibido</SelectItem>
                          <SelectItem value="paid">Pagado completo</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Después podrás actualizar el pago desde el detalle del pedido.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Notas internas del pedido</Label>
                      <Textarea
                        value={convertForm.notes}
                        onChange={(e) =>
                          setConvertForm((p) => ({ ...p, notes: e.target.value }))
                        }
                        placeholder="Anticipo recibido por transferencia, fecha límite producción, etc."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setConvertingQuotation(null)}
                        disabled={savingConvert}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleConvertToOrder}
                        disabled={savingConvert}
                        className="bg-purple-700 hover:bg-purple-800"
                      >
                        {savingConvert ? "Convirtiendo..." : (
                          <>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Convertir en pedido
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Diálogo: Crear/Editar cupón */}
            <Dialog
              open={couponDialogOpen}
              onOpenChange={(open) => {
                setCouponDialogOpen(open)
                if (!open) setEditingCoupon(null)
              }}
            >
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCoupon ? "Editar cupón" : "Crear cupón"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCoupon
                      ? "Modifica el cupón existente"
                      : "Define un nuevo cupón promocional"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Código</Label>
                    <Input
                      value={couponForm.code}
                      onChange={(e) =>
                        setCouponForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                      }
                      placeholder="DESCUENTO10"
                      className="font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select
                        value={couponForm.type}
                        onValueChange={(v) =>
                          setCouponForm((p) => ({ ...p, type: v as "percentage" | "fixed" }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                          <SelectItem value="fixed">Monto fijo ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Descuento</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={couponForm.discount}
                        onChange={(e) =>
                          setCouponForm((p) => ({ ...p, discount: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Usos máx.</Label>
                      <Input
                        type="number"
                        min="0"
                        value={couponForm.maxUses}
                        onChange={(e) =>
                          setCouponForm((p) => ({ ...p, maxUses: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vencimiento</Label>
                      <Input
                        type="date"
                        value={couponForm.expiresAt}
                        onChange={(e) =>
                          setCouponForm((p) => ({ ...p, expiresAt: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={couponForm.isActive}
                      onCheckedChange={(v) =>
                        setCouponForm((p) => ({ ...p, isActive: v }))
                      }
                    />
                    <Label>Activo</Label>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCouponDialogOpen(false)
                        setEditingCoupon(null)
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={saveCoupon} disabled={savingCoupon}>
                      {savingCoupon ? "Guardando..." : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {editingCoupon ? "Guardar cambios" : "Crear cupón"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </Tabs>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </AdminGuard>
  )
}
