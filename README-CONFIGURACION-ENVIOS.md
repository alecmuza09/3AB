# 📦 Configuración de Envíos - 3A Branding

## 🎯 ¿Qué es esto?

Un sistema completo para configurar y gestionar todos los aspectos de los envíos de tu tienda desde el panel de administración, sin necesidad de tocar código.

---

## 🚀 Setup Inicial

### 1️⃣ Ejecutar la Migración SQL

Ve a **Supabase Dashboard** → **SQL Editor** y ejecuta:

```
supabase/migrations/20260216_shipping_configuration.sql
```

Esto creará:
- ✅ Tabla `shipping_configuration`
- ✅ Configuraciones por defecto
- ✅ RLS policies
- ✅ Trigger para `updated_at`

### 2️⃣ Reiniciar el Servidor

```bash
# Detener (Ctrl + C)
npm run dev
```

### 3️⃣ Acceder a la Configuración

1. Ve al **Panel de Administración**
2. En el sidebar, haz clic en **"Configuración"**
3. Haz clic en **"Envíos"**

---

## 📋 Secciones Disponibles

### 🚚 1. Métodos de Envío

Configura los métodos disponibles para tus clientes:

**Campos configurables:**
- **Nombre**: Ej: "Envío Estándar"
- **Descripción**: Ej: "Entrega en 5-7 días hábiles"
- **Costo Base**: Precio del envío (MXN)
- **Envío Gratis desde**: Monto mínimo para envío gratis
- **Estado**: Habilitado/Deshabilitado

**Métodos por defecto:**
- 📦 **Envío Estándar**: $100 MXN (gratis desde $3,000)
- ⚡ **Envío Express**: $250 MXN (gratis desde $5,000)
- 🏪 **Recoger en tienda**: $0 MXN

---

### 🗺️ 2. Zonas de Envío

Define zonas geográficas con costos diferentes:

**Campos configurables:**
- **Nombre de la Zona**: Ej: "Local (CDMX)"
- **Estados Incluidos**: Lista separada por comas
- **Multiplicador de Costo**: Ej: 1.5 = +50% sobre el costo base
- **Estado**: Habilitado/Deshabilitado

**Zonas por defecto:**
- 🏙️ **Local**: CDMX y Edo. México (1.0x)
- 🇲🇽 **Nacional**: Todos los estados (1.5x)
- 🏝️ **Remoto**: BCS, Q. Roo, Chiapas (2.0x)

**Ejemplo de cálculo:**
- Envío estándar: $100
- Zona nacional: 1.5x
- **Costo final: $150**

---

### ⚙️ 3. Configuración General

Ajustes globales de envío:

**Envío Gratis:**
- ✅ Habilitar/Deshabilitar
- 💰 Monto mínimo (por defecto: $3,000)

**Costos Adicionales:**
- 📦 Cargo por manejo (embalaje, procesamiento)
- 💵 Impuestos incluidos (toggle)

**Tiempos de Entrega:**
- ⏱️ Días mínimos (por defecto: 5)
- ⏱️ Días máximos (por defecto: 7)

---

### 🔔 4. Notificaciones

Configura alertas automáticas sobre envíos:

**Notificaciones de Estado:**
- ✅ Confirmar Envío
- 📍 Actualizaciones de Rastreo
- 📦 Confirmar Entrega
- ⚠️ Notificar Retrasos

**Canales de Notificación:**
- 📧 Email
- 📱 SMS
- 💬 WhatsApp

---

## 🔧 Cómo Usar

### Cambiar Costo de Envío Estándar

1. Ve a **Configuración** → **Envíos**
2. Tab **"Métodos"**
3. Busca **"Envío Estándar"**
4. Cambia el **"Costo Base"** a tu nuevo precio
5. Haz clic en **"Guardar Cambios"**

### Agregar Nueva Zona

Actualmente las zonas están predefinidas. Para agregar nuevas:

1. Modifica el archivo de migración SQL
2. Agrega una nueva zona en `shipping_zones`
3. Reinicia y recarga la configuración

### Habilitar Envío Gratis

1. Ve a **Configuración** → **Envíos**
2. Tab **"General"**
3. Activa **"Habilitar Envío Gratis"**
4. Configura el **"Monto Mínimo"**
5. Haz clic en **"Guardar Cambios"**

### Desactivar un Método de Envío

1. Ve a **Configuración** → **Envíos**
2. Tab **"Métodos"**
3. Desactiva el toggle del método
4. Haz clic en **"Guardar Cambios"**

---

## 💡 Casos de Uso Comunes

### Escenario 1: Promoción de Envío Gratis

**Objetivo**: Envío gratis en todos los pedidos durante una semana

**Solución:**
1. Tab "Métodos" → Envío Estándar
2. Cambia "Envío Gratis desde" a **$0**
3. Guardar

### Escenario 2: Aumentar Costo por Temporada Alta

**Objetivo**: Aumentar costos 20% en diciembre

**Solución:**
1. Tab "Métodos"
2. Envío Estándar: $100 → $120
3. Envío Express: $250 → $300
4. Guardar

### Escenario 3: Solo Recoger en Tienda

**Objetivo**: Deshabilitar envíos temporalmente

**Solución:**
1. Tab "Métodos"
2. Desactiva "Envío Estándar" ✗
3. Desactiva "Envío Express" ✗
4. Deja activo "Recoger en tienda" ✓
5. Guardar

---

## 🔍 Estructura de Datos

### Tabla: `shipping_configuration`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | ID único |
| `config_key` | TEXT | Clave de configuración |
| `config_value` | JSONB | Valor en JSON |
| `description` | TEXT | Descripción |
| `updated_at` | TIMESTAMPTZ | Última actualización |
| `updated_by` | UUID | Usuario que actualizó |

### Config Keys:

- `shipping_methods` - Métodos disponibles
- `shipping_zones` - Zonas geográficas
- `shipping_general` - Configuración global
- `shipping_restrictions` - Límites y restricciones
- `shipping_notifications` - Alertas y notificaciones

---

## 🐛 Solución de Problemas

### Problema: "Error al cargar configuración"

**Causa**: La tabla no existe o no tiene datos.

**Solución:**
1. Ejecuta la migración SQL en Supabase
2. Verifica que la tabla `shipping_configuration` existe
3. Reinicia el servidor

---

### Problema: Los cambios no se guardan

**Causa**: Permisos de RLS o service_role_key faltante.

**Solución:**
1. Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté en `.env.local`
2. Revisa que las policies de RLS estén habilitadas
3. Mira la consola del navegador (F12) para errores

---

### Problema: No aparece la sección "Envíos"

**Causa**: No se ejecutó la migración o hay error en el código.

**Solución:**
1. Verifica que la migración se ejecutó correctamente
2. Reinicia el servidor de desarrollo
3. Limpia caché del navegador (Ctrl + Shift + R)

---

## 📊 Cómo se Usa en el Checkout

Los costos de envío configurados aquí se aplicarán automáticamente en el checkout:

1. **Cliente selecciona método de envío**
2. **Sistema busca zona según el estado**
3. **Calcula**: `Costo Base × Multiplicador de Zona`
4. **Aplica envío gratis** si cumple el umbral
5. **Muestra costo final** al cliente

---

## 🚀 Próximas Mejoras (Opcionales)

- [ ] Cálculo de peso volumétrico
- [ ] Integración con APIs de paqueterías
- [ ] Códigos postales restringidos
- [ ] Horarios de corte personalizables
- [ ] Costos por rango de peso
- [ ] Cálculo de tiempo de entrega dinámico
- [ ] Integración con rastreo en tiempo real

---

## ✅ Checklist de Verificación

Antes de usar en producción:

- [ ] Migración SQL ejecutada en Supabase
- [ ] Tabla `shipping_configuration` existe
- [ ] `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`
- [ ] Servidor reiniciado después de la migración
- [ ] Costos de envío configurados correctamente
- [ ] Zonas de envío configuradas según tu operación
- [ ] Envío gratis configurado (si aplica)
- [ ] Notificaciones habilitadas (si aplica)
- [ ] Prueba de checkout con diferentes métodos
- [ ] Verificación de cálculos de costo

---

**Fecha de implementación:** 16 Febrero 2026  
**Versión:** 1.0

**¿Preguntas?** Revisa los logs en consola (F12) para debugging.
