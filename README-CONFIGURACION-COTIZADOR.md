# 🧮 Configuración del Cotizador - 3A Branding

## 🎯 ¿Qué es esto?

Sistema para administrar los márgenes de ganancia y costos de extras del cotizador de personalización, permitiéndote ajustar precios sin tocar código.

---

## 🚀 Cómo Acceder

1. Ve al **Panel de Administración**: `/admin`
2. En el sidebar, haz clic en **"Configuración"**
3. Luego haz clic en **"Cotizador"**

---

## 💰 Márgenes de Ganancia

### ¿Qué son los márgenes?

Los márgenes definen cuánta ganancia obtienes sobre el costo base según el volumen del pedido.

**Fórmula:**
```
Precio Final = Costo Base / (1 - Margen%)
```

**Ejemplo con margen del 30%:**
- Costo base: $1,000
- Precio final: $1,000 / (1 - 0.30) = $1,428.57
- Ganancia: $428.57 (30% del precio final)

---

### 3 Niveles de Márgenes

#### 🔵 Margen Bajo (Pedidos Pequeños)

**Configuración:**
- **Hasta**: Número máximo de unidades (por defecto: 200)
- **Margen**: Porcentaje de ganancia (por defecto: 30%)

**Uso típico:**
- Pedidos pequeños tienen costos fijos altos
- Mayor margen compensa menor volumen
- Ejemplo: 1-200 unidades = 30% margen

---

#### 🟡 Margen Medio

**Configuración:**
- **Hasta**: Número máximo de unidades (por defecto: 1,000)
- **Margen**: Porcentaje de ganancia (por defecto: 25%)

**Uso típico:**
- Pedidos medianos más eficientes
- Margen moderado
- Ejemplo: 201-1,000 unidades = 25% margen

---

#### 🟢 Margen Alto (Pedidos Grandes)

**Configuración:**
- **Desde**: Automático (threshold medio + 1)
- **Margen**: Porcentaje de ganancia (por defecto: 20%)

**Uso típico:**
- Alto volumen = mejor eficiencia
- Menor margen pero mayor venta total
- Ejemplo: 1,001+ unidades = 20% margen

---

## 📦 Costos de Extras

Servicios adicionales que se pueden agregar a las cotizaciones:

### 1. Placa de Tampografía

**Costo por defecto:** $280 MXN

**Se aplica en:**
- ✅ Tampografía / Serigrafía
- ✅ Vidrio / Metal / Rubber

**Descripción:**
- Costo único por pedido (una sola vez)
- Preparación de placa para impresión
- Se agrega al total si el cliente lo requiere

---

### 2. Ponchado de Bordado

**Costo por defecto:** $280 MXN

**Se aplica en:**
- ✅ Bordado

**Descripción:**
- Preparación del diseño para bordar
- Costo único por pedido
- Necesario para personalización de textiles

---

### 3. Tratamiento Especial

**Costo por defecto:** $150 MXN

**Se aplica en:**
- ✅ Cualquier servicio

**Descripción:**
- Tratamientos adicionales
- Acabados especiales
- Personalización extra

---

## 🔧 Cómo Modificar la Configuración

### Cambiar Márgenes

1. Ve a **Configuración → Cotizador**
2. Encuentra el nivel de margen a modificar
3. Campos editables:
   - **Hasta (unidades)**: Límite superior del rango
   - **Margen (%)**: Porcentaje de ganancia
4. Haz clic en **"Guardar Cambios"**

**Ejemplo:**
- Quieres más ganancia en pedidos pequeños
- Cambia "Margen Bajo" de 30% a 35%
- Guardar ✅

---

### Cambiar Costos de Extras

1. Ve a **Configuración → Cotizador**
2. Scroll hasta **"Costos de Extras"**
3. Edita el costo en MXN de cada extra
4. Haz clic en **"Guardar Cambios"**

**Ejemplo:**
- Tu proveedor subió precio de placas
- Cambia "Placa de Tampografía" de $280 a $350
- Guardar ✅

---

## 📊 Preview de Márgenes

Al final de la página hay un **preview visual** que muestra:

- 🔵 Azul: Margen bajo (1-200 unidades = 30%)
- 🟡 Ámbar: Margen medio (201-1000 unidades = 25%)
- 🟢 Verde: Margen alto (1001+ unidades = 20%)

**Ejemplo de cálculo en vivo:**
- Costo base: $1,000
- Margen aplicado: 30%
- Precio final: $1,428.57
- Ganancia: $428.57

Este preview **se actualiza automáticamente** al cambiar los valores.

---

## 💡 Casos de Uso Comunes

### Caso 1: Aumentar Ganancia en Volumen Alto

**Objetivo:** Ganar más en pedidos grandes

**Solución:**
1. Margen Alto → Cambia de 20% a 22%
2. Guardar
3. Ahora pedidos de 1001+ unidades tendrán 22% margen

---

### Caso 2: Ajustar por Inflación

**Objetivo:** Compensar aumento de costos

**Solución:**
1. Aumenta los 3 márgenes en 2-3%
2. O aumenta solo los extras
3. Guardar

---

### Caso 3: Promoción para Alto Volumen

**Objetivo:** Incentivar pedidos grandes

**Solución:**
1. Margen Alto → Reduce de 20% a 15%
2. Margen Medio → Mantén en 25%
3. Guardar
4. Pedidos grandes ahora más competitivos

---

### Caso 4: Actualizar Costo de Proveedor

**Objetivo:** Proveedor cambió precio de ponchado

**Solución:**
1. Extras → Ponchado de Bordado
2. Cambia de $280 a $320
3. Guardar
4. Cotizaciones reflejarán nuevo costo

---

## 🔍 Estructura de Datos

### Configuración guardada:

```json
{
  "margins": {
    "low": {
      "threshold": 200,
      "percentage": 30
    },
    "medium": {
      "threshold": 1000,
      "percentage": 25
    },
    "high": {
      "threshold": 1001,
      "percentage": 20
    }
  },
  "extras": {
    "placa": 280,
    "ponchado": 280,
    "tratamiento": 150
  }
}
```

**Almacenamiento:**
- Tabla: `site_content`
- page_slug: `"settings"`
- section_key: `"cotizador_config"`
- value: JSON string

---

## 🧪 Cómo Probar los Cambios

### 1. Modificar Configuración

- Ve a Admin → Configuración → Cotizador
- Cambia un margen o extra
- Guardar

### 2. Probar en el Cotizador Público

- Ve a la página de cotización: `/cotizador`
- Ingresa cantidad y servicio
- Verifica que el precio refleje tus cambios

### 3. Comparar Antes/Después

**Antes del cambio:**
- 100 unidades con 30% margen = $X

**Después del cambio:**
- 100 unidades con 35% margen = $Y

---

## 🐛 Solución de Problemas

### Problema: "Error al cargar configuración"

**Causa:** Tabla site_content no existe o no hay conexión

**Solución:**
1. Verifica que Supabase esté corriendo
2. Tabla `site_content` debe existir
3. Si no existe, usar valores por defecto

---

### Problema: "Error al guardar configuración"

**Causa:** No tienes permisos de admin

**Solución:**
1. Verifica que tu usuario tenga role = "admin"
2. En Supabase → Table Editor → profiles
3. Busca tu usuario y cambia role a "admin"

---

### Problema: Los cambios no se reflejan en el cotizador

**Causa:** Cache del navegador

**Solución:**
1. Recarga la página del cotizador (Ctrl + Shift + R)
2. O espera unos segundos (el contexto recarga automáticamente)

---

## 📈 Estrategias de Precios

### Estrategia Agresiva (Más Competitivo)

```
Bajo: 25%
Medio: 20%
Alto: 15%
```

**Ventaja:** Precios más bajos, más competitivo  
**Desventaja:** Menor ganancia por unidad

---

### Estrategia Conservadora (Más Ganancia)

```
Bajo: 35%
Medio: 30%
Alto: 25%
```

**Ventaja:** Mayor ganancia por unidad  
**Desventaja:** Precios más altos, posible menor conversión

---

### Estrategia Balanceada (Por defecto)

```
Bajo: 30%
Medio: 25%
Alto: 20%
```

**Ventaja:** Balance entre ganancia y competitividad  
**Mejor para:** Mayoría de casos

---

## 🎯 Mejores Prácticas

### ✅ Hacer:

- **Revisar márgenes mensualmente** según costos
- **Ajustar por temporada** (alta/baja)
- **Mantener márgenes progresivos** (bajo > medio > alto)
- **Documentar cambios** importantes
- **Probar en cotizador** después de modificar

### ❌ Evitar:

- Márgenes negativos o cero
- Márgenes muy altos (>50%) - poco competitivo
- Cambiar sin revisar impacto
- Thresholds que se solapen
- Costos de extras irrealistas

---

## 🔄 Impacto de los Cambios

**Los cambios afectan:**
- ✅ Cotizador público (`/cotizador`)
- ✅ Cálculos de precio automáticos
- ✅ Todos los servicios (tampografía, laser, bordado, etc.)

**Los cambios NO afectan:**
- ❌ Pedidos ya confirmados
- ❌ Cotizaciones enviadas anteriormente
- ❌ Productos con precios fijos en catálogo

---

## 📊 Monitorear Resultados

### Métricas a seguir:

1. **Tasa de conversión** de cotizaciones
   - ¿Más cotizaciones se convierten en pedidos?
   
2. **Margen promedio real**
   - ¿Qué margen se aplica más frecuentemente?

3. **Ticket promedio**
   - ¿Aumentó o disminuyó con los nuevos márgenes?

4. **Competitividad**
   - ¿Cómo se comparan tus precios con competencia?

---

## 🔐 Seguridad

- ✅ Solo usuarios con `role: "admin"` pueden modificar
- ✅ Requiere token de autenticación
- ✅ Validación en backend
- ✅ Valores default si falla carga

---

## ✅ Checklist

Antes de cambiar márgenes en producción:

- [ ] Revisar costos actuales de proveedores
- [ ] Calcular margen mínimo viable
- [ ] Comparar con competencia
- [ ] Probar en cotizador de prueba
- [ ] Verificar cálculos con ejemplos reales
- [ ] Documentar el cambio (fecha y razón)
- [ ] Monitorear conversión después del cambio
- [ ] Ajustar si es necesario

---

**Fecha de implementación:** 16 Febrero 2026  
**Versión:** 1.0

**Tip:** Empieza con márgenes conservadores y ajusta según demanda y competencia.
