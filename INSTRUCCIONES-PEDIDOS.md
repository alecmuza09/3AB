# ⚠️ INSTRUCCIONES URGENTES - Sistema de Pedidos

## 🚨 ACCIÓN REQUERIDA AHORA

Para que los pedidos aparezcan en el panel de administración, debes ejecutar la migración SQL en Supabase.

---

## 📝 PASO 1: Ejecutar SQL en Supabase

### Opción A: Supabase Dashboard (MÁS FÁCIL)

1. **Abre tu proyecto en Supabase**: [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. **Ve al SQL Editor**:
   - En el menú lateral, haz clic en **"SQL Editor"**
   - Haz clic en **"New query"**

3. **Copia y pega el SQL**:
   - Abre el archivo: `supabase/migrations/20260216_create_orders_tables.sql`
   - Selecciona TODO el contenido (Cmd/Ctrl + A)
   - Cópialo (Cmd/Ctrl + C)
   - Pégalo en el SQL Editor de Supabase

4. **Ejecuta el SQL**:
   - Haz clic en el botón **"Run"** (esquina inferior derecha)
   - Espera unos segundos
   - ✅ Deberías ver: "Success. No rows returned"

### Opción B: Desde terminal (CLI)

```bash
# Si tienes instalado Supabase CLI
supabase db push
```

---

## 📝 PASO 2: Verificar variables de entorno

Abre tu archivo `.env.local` y verifica que tengas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...tu-service-role-key
```

### ⚠️ Si te falta el SUPABASE_SERVICE_ROLE_KEY:

1. Ve a tu proyecto en Supabase
2. **Settings** → **API**
3. Busca la sección **"service_role key"** (secret)
4. Haz clic en **"Reveal"** para mostrarla
5. Copia la key completa
6. Agrégala a tu `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 PASO 3: Reiniciar servidor

```bash
# Detén el servidor (Ctrl + C)
# Vuelve a iniciarlo:
npm run dev
```

---

## 🧪 PASO 4: Probar el sistema

### A. Crear un pedido de prueba

1. Abre tu sitio: `http://localhost:3000`
2. Navega a **Productos**
3. Agrega cualquier producto al carrito
4. Ve al **Checkout**
5. Completa el formulario con datos de prueba
6. Haz clic en **"Confirmar pedido"**

### B. Verificar en el admin

1. Ve a: `http://localhost:3000/admin`
2. Haz clic en la pestaña **"Pedidos"**
3. Abre la **Consola del navegador** (F12)
4. Busca estos mensajes:

**Si funciona:**
```
✅ Pedidos cargados desde API: 1
✅ Pedidos formateados: 1
```

**Si hay error:**
```
❌ Error loading orders: ...
Error loading orders - Status: 500
```

### C. Verificar en Supabase

1. Ve a tu proyecto en Supabase
2. **Table Editor**
3. Busca la tabla **"orders"**
4. Deberías ver tu pedido de prueba

---

## 🐛 Solución de problemas

### Problema: "Error loading orders - Status: 500"

**Causa**: La API no puede conectarse a Supabase

**Solución**:
1. Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté en `.env.local`
2. Reinicia el servidor de desarrollo
3. Verifica que las tablas existan en Supabase

---

### Problema: "No hay pedidos disponibles" pero creaste uno

**Causa**: El pedido se guardó en localStorage pero no en Supabase

**Solución**:
1. Abre la consola del navegador (F12) cuando hagas checkout
2. Busca errores en rojo
3. Si dice "Failed to fetch" o similar, verifica:
   - Que el servidor esté corriendo
   - Que la API `/api/orders` exista
   - Que las variables de entorno estén correctas

---

### Problema: Admin muestra "Cargando..." infinitamente

**Causa**: Error en la consulta o tablas no existen

**Solución**:
1. Abre consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Busca la petición a `/api/orders`
4. Haz clic y revisa la respuesta
5. Si es 404: La API no existe
6. Si es 500: Hay error en el servidor (revisa terminal)

---

## ✅ Checklist rápido

Verifica que hayas hecho todo:

- [ ] ✅ Ejecuté el SQL en Supabase SQL Editor
- [ ] ✅ Tengo `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`
- [ ] ✅ Reinicié el servidor (`npm run dev`)
- [ ] ✅ Abrí la consola del navegador (F12)
- [ ] ✅ Creé un pedido de prueba desde checkout
- [ ] ✅ Revisé la pestaña "Pedidos" en admin

---

## 📞 Siguiente paso después de configurar:

Una vez que veas pedidos en el admin, todo está funcionando correctamente y puedes:
- Gestionar estados de pedidos
- Ver detalles completos
- Exportar pedidos
- Ver estadísticas en el dashboard

---

**Importante**: El error de favicon.ico 404 es normal y no afecta los pedidos. Lo puedes ignorar por ahora.
