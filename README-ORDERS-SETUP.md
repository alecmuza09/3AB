# Configuración del Sistema de Pedidos

Este documento explica cómo configurar el sistema de pedidos para que funcione completamente.

## 🎯 Problema resuelto

Los pedidos realizados desde la página de checkout no aparecían en el panel de administración porque:
- ❌ Solo se guardaban en localStorage del navegador
- ❌ No se almacenaban en la base de datos (Supabase)
- ❌ El admin buscaba pedidos en Supabase pero no encontraba nada

## ✅ Solución implementada

### 1. **API de pedidos creada**
   - `app/api/orders/route.ts` - Endpoint para crear y consultar pedidos
   - POST: Crear nuevo pedido
   - GET: Obtener listado de pedidos

### 2. **Checkout modificado**
   - Ahora guarda pedidos en **Supabase** (base de datos)
   - También guarda en **localStorage** para que el usuario los vea
   - Maneja errores y muestra feedback al usuario

### 3. **Tablas de base de datos**
   - `orders` - Tabla principal de pedidos
   - `order_items` - Items/productos de cada pedido

## 📋 Pasos para configurar

### Paso 1: Ejecutar migración en Supabase

Tienes 2 opciones:

#### Opción A: Desde Supabase Dashboard (Recomendada)

1. Ve a tu proyecto en [https://supabase.com](https://supabase.com)
2. Abre el **SQL Editor**
3. Copia todo el contenido del archivo: `supabase/migrations/20260216_create_orders_tables.sql`
4. Pégalo en el editor
5. Haz clic en **Run** (Ejecutar)

#### Opción B: Desde CLI de Supabase

```bash
# Instalar CLI de Supabase (si no lo tienes)
npm install -g supabase

# Ejecutar migración
supabase db push
```

### Paso 2: Verificar variables de entorno

Asegúrate de tener estas variables en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

⚠️ **IMPORTANTE**: El `SUPABASE_SERVICE_ROLE_KEY` es necesario para que la API pueda crear pedidos sin autenticación (usuarios sin sesión).

### Paso 3: Reiniciar el servidor de desarrollo

```bash
npm run dev
```

## 🧪 Probar el sistema

### 1. Crear un pedido de prueba

1. Navega a la tienda
2. Agrega productos al carrito
3. Ve al checkout
4. Completa el formulario (NO necesitas iniciar sesión)
5. Confirma el pedido

### 2. Verificar en el admin

1. Ve a `/admin`
2. Haz clic en la pestaña **"Pedidos"**
3. Deberías ver el pedido que acabas de crear

### 3. Verificar en Supabase

1. Ve al **Table Editor** en Supabase
2. Abre la tabla `orders`
3. Deberías ver el pedido registrado

## 📊 Estructura de datos

### Tabla `orders`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único del pedido |
| order_number | TEXT | Número de pedido (ej: ORD-2026-12345) |
| user_id | UUID | ID del usuario (null si sin sesión) |
| status | TEXT | Estado: "pending", "En revisión", "En producción", etc. |
| total | NUMERIC | Total del pedido (con IVA y envío) |
| subtotal | NUMERIC | Subtotal de productos |
| tax | NUMERIC | Impuestos (IVA 16%) |
| shipping_cost | NUMERIC | Costo de envío |
| payment_method | TEXT | "purchase", "quote", etc. |
| contact_info | JSONB | Datos de contacto del cliente |
| shipping_info | JSONB | Información de envío |
| billing_info | JSONB | Información de facturación |
| created_at | TIMESTAMPTZ | Fecha de creación |
| updated_at | TIMESTAMPTZ | Última actualización |

### Tabla `order_items`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único del item |
| order_id | UUID | Referencia al pedido |
| product_id | UUID | Referencia al producto |
| product_name | TEXT | Nombre del producto |
| quantity | INTEGER | Cantidad |
| unit_price | NUMERIC | Precio unitario |
| subtotal | NUMERIC | Subtotal del item |
| variation_label | TEXT | Variación (ej: "Azul", "Talla M") |
| image_url | TEXT | URL de imagen del producto |
| customization_notes | TEXT | Notas de personalización |
| created_at | TIMESTAMPTZ | Fecha de creación |

## 🔐 Seguridad (RLS - Row Level Security)

Las políticas configuradas:
- ✅ **Cualquiera puede crear pedidos** (usuarios sin sesión)
- ✅ **Usuarios autenticados ven solo sus pedidos**
- ✅ **Admins ven todos los pedidos** (usando service_role_key)

## 📱 Flujo completo

```
Usuario → Agrega productos → Checkout → Completa datos
    ↓
API /api/orders (POST)
    ↓
Guarda en Supabase (tabla orders + order_items)
    ↓
También guarda en localStorage
    ↓
Muestra confirmación y redirige a /pedidos
    ↓
Admin puede ver pedido en panel de administración
```

## 🐛 Solución de problemas

### Problema: "Error al crear el pedido"

**Causa**: Falta la variable `SUPABASE_SERVICE_ROLE_KEY`

**Solución**:
1. Ve a tu proyecto en Supabase
2. Settings → API
3. Copia la **service_role key** (secret)
4. Agrégala a `.env.local`

### Problema: Admin no muestra pedidos

**Causa**: Las tablas no existen o no se ejecutó la migración

**Solución**:
1. Ejecuta la migración SQL (Paso 1 arriba)
2. Verifica que las tablas existan en Supabase Table Editor

### Problema: Pedido se crea pero sin items

**Causa**: Error en la estructura de datos de items

**Solución**:
1. Verifica que cada item tenga: `productId`, `name`, `quantity`, `unitPrice`
2. Revisa los logs de la consola del navegador

## ✅ Checklist de verificación

- [ ] Migración SQL ejecutada en Supabase
- [ ] Variables de entorno configuradas (incluyendo service_role_key)
- [ ] Servidor de desarrollo reiniciado
- [ ] Pedido de prueba creado desde checkout
- [ ] Pedido visible en panel de admin
- [ ] Pedido visible en Supabase Table Editor

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de la consola del navegador (F12)
2. Revisa los logs del servidor (`npm run dev`)
3. Verifica las variables de entorno
4. Asegúrate de que las tablas existan en Supabase

---

**Última actualización**: 16 de Febrero 2026
