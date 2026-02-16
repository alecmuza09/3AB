# 🚨 SOLUCIÓN RÁPIDA: "Las tablas de pedidos no están configuradas correctamente"

## ❌ Error que estás viendo:

```
Las tablas de pedidos no están configuradas correctamente.
```

Este error significa que la API no puede encontrar las tablas `orders` o `order_items` en Supabase.

---

## ✅ SOLUCIÓN EN 3 PASOS

### Paso 1: Verificar si las tablas existen

1. Ve a **Supabase Dashboard**: https://supabase.com/dashboard
2. Abre tu proyecto
3. Ve a **SQL Editor** → **New query**
4. Copia y pega este código:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('orders', 'order_items');
```

5. Haz clic en **"Run"**

**¿Qué debe aparecer?**

✅ **Si funciona correctamente:**
```
table_name
----------
orders
order_items
```
(2 filas)

❌ **Si NO aparece nada:**
Las tablas NO se crearon. Continúa al Paso 2.

---

### Paso 2: Crear las tablas correctamente

Si el Paso 1 no mostró las tablas, sigue estos pasos:

#### Opción A: Limpiar y recrear (RECOMENDADO)

1. **Primero, eliminar las tablas si existen parcialmente:**

```sql
-- Ejecutar en Supabase SQL Editor
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
```

2. **Luego, copiar TODO el contenido de este archivo:**
   - Abre: `supabase/migrations/20260216_create_orders_tables.sql`
   - Selecciona TODO (Cmd/Ctrl + A)
   - Copia (Cmd/Ctrl + C)

3. **Pegar y ejecutar en Supabase SQL Editor:**
   - Nueva query en Supabase
   - Pegar el SQL completo
   - Click en **"Run"**

4. **Verificar el resultado:**
   - Debe decir: **"Success. No rows returned"** ✅
   - O puede decir: **"Success"** con algunas filas ✅

#### Opción B: Script de verificación completo

Ejecuta este script en Supabase SQL Editor:

📄 Archivo: `scripts/check-supabase-connection.sql`

Este script:
- ✅ Verifica si las tablas existen
- ✅ Verifica las columnas
- ✅ Prueba insertar un pedido
- ✅ Muestra qué está fallando exactamente

---

### Paso 3: Verificar el resultado

Después de ejecutar el SQL, vuelve a verificar:

```sql
-- En Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('orders', 'order_items');
```

Debe mostrar **2 filas** (orders y order_items).

También verifica visualmente:
1. Ve a **Table Editor** en Supabase
2. Deberías ver las tablas `orders` y `order_items` en la lista

---

## 🔍 VERIFICACIÓN ADICIONAL

### ¿Las tablas están en el schema correcto?

A veces las tablas se crean en otro schema. Verifica:

```sql
SELECT 
  table_schema,
  table_name 
FROM information_schema.tables 
WHERE table_name IN ('orders', 'order_items')
ORDER BY table_schema, table_name;
```

**Resultado esperado:**
```
table_schema | table_name
-------------|------------
public       | orders
public       | order_items
```

Si aparecen en otro schema (ej: `auth`, `storage`), necesitas recrearlas en `public`.

---

## 🐛 Problemas Comunes

### Problema 1: "Success" pero las tablas no aparecen

**Causa:** El SQL tiene algún error de sintaxis.

**Solución:**
1. Verifica que copiaste **TODO** el archivo SQL
2. Incluye desde la primera línea hasta la última
3. No copies solo partes del SQL

---

### Problema 2: Error de "relation already exists"

**Causa:** Las tablas ya existen pero están mal configuradas.

**Solución:**
1. Eliminar las tablas primero:
```sql
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
```

2. Volver a ejecutar el SQL completo de migración

---

### Problema 3: Error de "permission denied"

**Causa:** Tu usuario no tiene permisos para crear tablas.

**Solución:**
1. Verifica que estés usando tu proyecto correcto en Supabase
2. Debes ser el dueño del proyecto
3. Si no tienes permisos, contacta al administrador del proyecto

---

## 📸 ¿Cómo debe verse?

### En Table Editor:

Deberías ver algo así:

```
Tables:
├── orders (17 rows)
├── order_items (45 rows)
├── products (...)
└── ...
```

Si ves `orders` y `order_items` en la lista, ✅ **las tablas existen**.

---

## ⚡ Prueba Rápida Final

Una vez que las tablas existan, prueba insertar un pedido:

```sql
INSERT INTO public.orders (
  order_number,
  status,
  total,
  subtotal,
  tax,
  shipping_cost,
  user_id
) VALUES (
  'TEST-' || NOW()::text,
  'pending',
  100.00,
  80.00,
  12.80,
  7.20,
  NULL
)
RETURNING order_number, status;
```

**Si funciona:** ✅ Todo está OK, reinicia tu servidor (`npm run dev`)

**Si falla:** ❌ Copia el error exacto y compártelo

---

## 🔄 Después de Crear las Tablas

1. **Reinicia el servidor de desarrollo:**
```bash
# Detener (Ctrl + C)
npm run dev
```

2. **Intenta crear un pedido de nuevo**

3. **Abre la consola del navegador (F12)**

4. **Observa los logs:**
   - Debería decir: `✅ Pedido creado exitosamente`
   - Ya NO debería decir: "Las tablas de pedidos no están configuradas correctamente"

---

## 💡 Si Aún No Funciona

Por favor comparte:

1. ✅ Screenshot del **Table Editor** mostrando las tablas
2. ✅ Resultado del query de verificación (Paso 1)
3. ✅ Error exacto que aparece en la consola del navegador (F12)
4. ✅ Error exacto que aparece al ejecutar el SQL

---

**Última actualización:** 16 Feb 2026
