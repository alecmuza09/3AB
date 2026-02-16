# 📦 Sistema de Pedidos - 3A Branding

## 🎯 ¿Qué se implementó?

Sistema completo de gestión de pedidos que permite:

- ✅ **Pedidos sin registro**: Clientes pueden comprar sin crear cuenta
- ✅ **Pedidos con usuario**: Usuarios registrados ven su historial
- ✅ **Panel de administración**: Vista completa de todos los pedidos
- ✅ **Cálculos automáticos**: Subtotal, impuestos, envío
- ✅ **Estados de pedido**: En revisión, En producción, Enviado, Entregado
- ✅ **Información detallada**: Contacto, envío, facturación, productos

---

## 📋 Archivos Principales

### Backend/API
- `app/api/orders/route.ts` - API endpoint para crear/obtener pedidos
- `supabase/migrations/20260216_create_orders_tables.sql` - Schema de base de datos

### Frontend
- `app/checkout/page.tsx` - Página de checkout con creación de pedidos
- `app/admin/page.tsx` - Panel admin con gestión de pedidos
- `app/pedidos/page.tsx` - Historial de pedidos del usuario

### Contexto/Estado
- `lib/contexts/OrderContext.tsx` - Estado global de pedidos (localStorage)

---

## 🚀 Configuración Inicial

### 1. Ejecutar migración SQL

Ve a **INSTRUCCIONES-PEDIDOS.md** para guía detallada.

**Resumen rápido:**
1. Abre [Supabase Dashboard](https://supabase.com/dashboard)
2. SQL Editor → New query
3. Copia contenido de `supabase/migrations/20260216_create_orders_tables.sql`
4. Ejecutar (Run)

### 2. Variables de entorno

Archivo: `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Reiniciar servidor

```bash
npm run dev
```

---

## 🐛 Solución de Problemas

### ❌ Error: "Hubo un problema al procesar tu pedido..."

**Causa**: Pedidos sin usuario no funcionan.

**Solución**: 👉 **[DIAGNOSTICO-PEDIDOS.md](./DIAGNOSTICO-PEDIDOS.md)**

Guía completa con:
- ✅ Verificación paso a paso
- ✅ Queries SQL de diagnóstico
- ✅ Soluciones a errores comunes
- ✅ Logs para debugging

---

### ❌ Pedidos no aparecen en Admin

**Causa**: Falta configuración o tablas no existen.

**Solución**: 👉 **[INSTRUCCIONES-PEDIDOS.md](./INSTRUCCIONES-PEDIDOS.md)**

---

## 🧪 Herramientas de Diagnóstico

### 1. Script de prueba automático

```bash
npx ts-node scripts/test-orders-api.ts
```

Verifica:
- Variables de entorno ✅
- Creación de pedidos ✅
- Obtención de pedidos ✅

### 2. Verificación SQL

Ejecutar en Supabase SQL Editor:

```sql
-- Archivo: scripts/verify-supabase-tables.sql
-- Verifica tablas, columnas, RLS policies
```

---

## 📊 Estructura de Datos

### Tabla: `orders`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | ID único del pedido |
| `order_number` | TEXT | Número visible (ORD-2026-XXXX) |
| `user_id` | UUID? | Usuario (NULL para sin registro) |
| `status` | TEXT | Estado del pedido |
| `total` | NUMERIC | Total del pedido |
| `subtotal` | NUMERIC | Subtotal (antes de impuestos) |
| `tax` | NUMERIC | Impuestos |
| `shipping_cost` | NUMERIC | Costo de envío |
| `contact_info` | JSONB | Datos de contacto |
| `shipping_info` | JSONB | Datos de envío |
| `billing_info` | JSONB | Datos de facturación |
| `created_at` | TIMESTAMPTZ | Fecha de creación |

### Tabla: `order_items`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | ID único del item |
| `order_id` | UUID | Referencia al pedido |
| `product_id` | UUID? | Referencia al producto |
| `product_name` | TEXT | Nombre del producto |
| `quantity` | INTEGER | Cantidad |
| `unit_price` | NUMERIC | Precio unitario |
| `subtotal` | NUMERIC | Subtotal del item |
| `variation_label` | TEXT? | Variación (color, tamaño) |
| `image_url` | TEXT? | URL de imagen |

---

## 🔐 Seguridad (RLS)

### Políticas implementadas:

1. **SELECT**: Usuarios autenticados ven solo sus pedidos
2. **INSERT**: Cualquiera puede crear pedidos (incluso sin sesión)
3. **Admin**: Panel usa `service_role_key` para ver todo

---

## 📈 Flujo de Pedidos

```
1. Usuario agrega productos al carrito
   └─> lib/contexts/CartContext.tsx

2. Va al Checkout
   └─> app/checkout/page.tsx
   
3. Completa formulario (contacto, envío, facturación)

4. Confirma pedido
   └─> POST /api/orders
       └─> Crea registro en orders
       └─> Crea registros en order_items
       └─> Guarda en localStorage (para /pedidos)
   
5. Redirección a /pedidos
   └─> Usuario ve confirmación
   
6. Admin ve pedido
   └─> GET /api/orders
   └─> Muestra todos los pedidos
   └─> Puede cambiar estados
```

---

## 💡 Características Especiales

### Pedidos sin Usuario

- No requieren autenticación
- `user_id` es `NULL` en la BD
- Se guardan en Supabase igual que pedidos con usuario
- Admin puede verlos y gestionarlos normalmente

### Logs Detallados

Checkout muestra logs en consola del navegador:

```
📦 Enviando pedido a la API...
📡 Respuesta de API: 201 Created
📄 Resultado: {success: true, ...}
✅ Pedido creado exitosamente: ORD-2026-XXXX
```

En caso de error:

```
❌ Error de API: {error: "...", hint: "..."}
```

---

## 🎨 UI/UX

### Panel Admin

- Vista de tabla con todos los pedidos
- Filtros por estado
- Búsqueda por número de pedido o cliente
- Vista de detalles expandible
- Cambio de estados con confirmación

### Página de Pedidos (/pedidos)

- Historial de pedidos del usuario
- Estado actual de cada pedido
- Detalles completos (productos, envío, total)
- Descarga de comprobante (futuro)

---

## 🚧 Próximas Mejoras (Opcionales)

- [ ] Notificaciones por email al crear pedido
- [ ] WhatsApp automático al administrador
- [ ] Seguimiento de envío con guías
- [ ] Exportar pedidos a Excel/PDF
- [ ] Integración con sistemas de facturación
- [ ] Reportes y estadísticas avanzadas

---

## 📚 Documentación Adicional

- **[INSTRUCCIONES-PEDIDOS.md](./INSTRUCCIONES-PEDIDOS.md)** - Setup inicial paso a paso
- **[DIAGNOSTICO-PEDIDOS.md](./DIAGNOSTICO-PEDIDOS.md)** - Solución de problemas
- `scripts/test-orders-api.ts` - Prueba automática
- `scripts/verify-supabase-tables.sql` - Verificación de BD

---

## ✅ Checklist de Verificación

Antes de usar en producción, verifica:

- [ ] Tablas `orders` y `order_items` existen en Supabase
- [ ] Variables de entorno configuradas correctamente
- [ ] Servidor reiniciado después de cambios
- [ ] Pedido de prueba creado exitosamente
- [ ] Pedido aparece en admin panel
- [ ] Pedido guardado en Supabase (Table Editor)
- [ ] Sin errores en consola del navegador
- [ ] Sin errores en terminal del servidor

---

**Fecha de implementación:** 16 Febrero 2026  
**Versión:** 1.0
