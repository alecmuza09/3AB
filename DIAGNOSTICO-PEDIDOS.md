# 🔍 Diagnóstico y Solución: Pedidos sin Usuario

## ❌ Error: "Hubo un problema al procesar tu pedido..."

Este error aparece cuando intentas crear un pedido sin estar autenticado. Aquí está la solución paso a paso:

---

## ✅ Solución en 5 Pasos

### 1️⃣ Verificar que las Tablas Existan en Supabase

Ve a **Supabase Dashboard** → **SQL Editor** y ejecuta:

```sql
-- Copiar y pegar este código en Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('orders', 'order_items');
```

**Resultado esperado:**
```
table_name
----------
orders
order_items
```

Si NO aparecen las tablas, continúa al paso 2. Si aparecen, salta al paso 3.

---

### 2️⃣ Crear las Tablas (Si no existen)

En **Supabase SQL Editor**, ejecuta el archivo completo:

`supabase/migrations/20260216_create_orders_tables.sql`

O cópialo manualmente:

```sql
-- Copiar TODO el contenido de:
-- /supabase/migrations/20260216_create_orders_tables.sql
-- Y pegarlo en Supabase SQL Editor, luego ejecutar
```

**Confirma que se ejecutó correctamente:**
- Debe decir "Success. No rows returned"
- O puede aparecer un warning de "already exists" (está bien)

---

### 3️⃣ Verificar Variables de Entorno

Abre `.env.local` y confirma que tengas estas 2 variables:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**¿Dónde obtenerlas?**
1. Ve a **Supabase Dashboard**
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`

---

### 4️⃣ Reiniciar el Servidor

Después de verificar las variables, **reinicia el servidor**:

```bash
# Detener el servidor (Ctrl + C)
# Luego reiniciar:
npm run dev
```

---

### 5️⃣ Probar el Pedido con Logs

Ahora intenta crear un pedido:

1. Abre **Consola del Navegador** (F12)
2. Ve a la pestaña **Console**
3. Intenta hacer un pedido sin iniciar sesión
4. Observa los logs:

**✅ Si funciona, verás:**
```
📦 Enviando pedido a la API... {orderId: "ORD-2026-XXXX", ...}
📡 Respuesta de API: 201 Created
📄 Resultado: {success: true, order: {...}, ...}
✅ Pedido creado exitosamente: ORD-2026-XXXX
```

**❌ Si falla, verás el error específico:**
```
❌ Error de API: {error: "...", details: "...", hint: "..."}
```

---

## 🧪 Prueba Automática (Opcional)

Si quieres hacer una prueba técnica completa:

```bash
npx ts-node scripts/test-orders-api.ts
```

Esto verificará:
- ✅ Variables de entorno
- ✅ Conexión a Supabase
- ✅ Creación de pedido
- ✅ Obtención de pedidos

---

## 🐛 Problemas Comunes y Soluciones

### Error: "La tabla 'orders' no existe"

**Causa:** No ejecutaste la migración SQL.

**Solución:** Ve al Paso 2️⃣

---

### Error: "Configuración de Supabase incompleta"

**Causa:** Faltan variables de entorno o están mal.

**Solución:** Ve al Paso 3️⃣

---

### Error: "column 'user_id' cannot be null"

**Causa:** La migración SQL no se ejecutó correctamente.

**Solución:** 
1. En Supabase SQL Editor:
```sql
ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;
```
2. Reinicia el servidor (Paso 4️⃣)

---

### Los pedidos se crean pero no aparecen en Admin

**Causa:** El admin panel puede estar usando cache.

**Solución:**
1. Abre el Admin Panel
2. Presiona **Ctrl + Shift + R** (recarga forzada)
3. O ve a la pestaña "Pedidos" y haz clic en "Recargar"

---

## 📊 Verificar en Supabase Directamente

Si quieres ver los pedidos directamente en Supabase:

1. Ve a **Supabase Dashboard**
2. **Table Editor** → `orders`
3. Deberías ver todos los pedidos (con y sin `user_id`)

---

## 💡 ¿Todavía no funciona?

Si después de seguir todos los pasos aún tienes problemas:

1. **Copia el error completo de la consola** (F12)
2. **Toma screenshot del error**
3. **Verifica que las 2 tablas existan en Supabase**:
   - `orders`
   - `order_items`
4. **Comparte el error exacto** para ayuda específica

---

## ✨ Confirmación de Éxito

Sabrás que todo funciona cuando:

- ✅ Puedes hacer pedidos sin iniciar sesión
- ✅ Los pedidos aparecen en el Admin Panel
- ✅ Los pedidos se guardan en Supabase
- ✅ No hay errores en la consola del navegador

---

**Última actualización:** 16 Feb 2026
