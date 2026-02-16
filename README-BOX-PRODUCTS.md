# Sistema de Productos por Caja

Este sistema maneja productos que se compran por caja completa del proveedor pero se venden por unidad individual en la tienda.

## 🎯 Características Principales

- **Cálculo automático** de peso unitario a partir del peso total de la caja
- **Conversión inteligente** de unidades a cajas necesarias
- **Cálculo de envío** usando peso real y peso volumétrico
- **Validación automática** de datos del proveedor
- **Información técnica completa** con visualización dinámica

## 📁 Estructura de Archivos

```
lib/
├── types/
│   └── box-product.ts          # Tipos TypeScript
├── box-product-calculator.ts    # Lógica de cálculo
└── __tests__/
    └── box-product-calculator.test.ts  # Tests unitarios

components/
└── box-product-info.tsx         # Componentes React
```

## 🔧 Uso Básico

### 1. Definir un Producto

```typescript
import type { BoxProduct } from '@/lib/types/box-product';

const product: BoxProduct = {
  id: 'tornillo-001',
  name: 'Tornillo Hexagonal M8',
  sku: 'TORN-M8-100',
  box_info: {
    weight_kg: 17,           // Peso total de la caja
    pieces_per_box: 20,      // 20 unidades por caja
    dimensions: {
      length_cm: 40,
      width_cm: 30,
      height_cm: 25
    }
  },
  technical_info: {
    materials: ['Acero inoxidable 304'],
    specifications: {
      'Diámetro': '8mm',
      'Largo': '100mm',
      'Resistencia': 'Grado 8.8'
    },
    manufacturer_description: 'Tornillo de alta resistencia...'
  },
  is_valid: true,
  requires_manual_review: false,
  created_at: new Date(),
  updated_at: new Date(),
  supplier_id: 'sup_001'
};
```

### 2. Calcular Información de Pedido

```typescript
import { BoxProductCalculator } from '@/lib/box-product-calculator';

// Calcular para 35 unidades
const orderInfo = BoxProductCalculator.calculateOrderInfo(product, 35);

console.log(orderInfo);
// {
//   unit_weight_kg: 0.85,        // 17kg / 20 piezas
//   total_weight_kg: 29.75,      // 0.85kg × 35 unidades
//   boxes_needed: 2,             // ceil(35 / 20)
//   is_complete_boxes: false,    // No es múltiplo exacto
//   volume_m3: 0.06              // Volumen de 2 cajas
// }
```

### 3. Validar Producto

```typescript
const validation = BoxProductCalculator.validateProduct(product);

if (!validation.isValid) {
  console.error('Errores:', validation.errors);
  // Marcar producto para revisión manual
}
```

### 4. Usar Componentes React

```tsx
import { ProductTechnicalInfo, OrderCalculator } from '@/components/box-product-info';

function ProductPage({ product }: { product: BoxProduct }) {
  return (
    <div>
      {/* Muestra toda la información técnica */}
      <ProductTechnicalInfo product={product} />
      
      {/* Calculadora interactiva */}
      <OrderCalculator 
        product={product}
        initialQuantity={1}
        onQuantityChange={(qty) => console.log('Nueva cantidad:', qty)}
      />
    </div>
  );
}
```

## 📐 Fórmulas

### Peso Unitario
```
peso_unitario = peso_caja / piezas_por_caja
```

### Peso Total del Pedido
```
peso_total = peso_unitario × cantidad_unidades
```

### Cajas Necesarias
```
cajas_necesarias = ⌈cantidad_unidades / piezas_por_caja⌉
```

### Volumen
```
volumen_caja = largo × ancho × alto (en cm³)
volumen_m3 = volumen_caja / 1,000,000
volumen_total = volumen_m3 × cajas_necesarias
```

### Cálculo de Envío
```
peso_volumétrico = volumen_m3 × 200
peso_facturable = max(peso_real, peso_volumétrico)
costo_envío = peso_facturable × tarifa_método
```

## 🗄️ Estructura de Base de Datos Recomendada

### PostgreSQL

```sql
CREATE TABLE box_products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  
  -- Box info
  weight_kg DECIMAL(10, 3) NOT NULL,
  pieces_per_box INTEGER NOT NULL,
  length_cm DECIMAL(10, 2) NOT NULL,
  width_cm DECIMAL(10, 2) NOT NULL,
  height_cm DECIMAL(10, 2) NOT NULL,
  
  -- Calculated fields
  unit_weight_kg DECIMAL(10, 3) GENERATED ALWAYS AS (weight_kg / pieces_per_box) STORED,
  box_volume_m3 DECIMAL(10, 6) GENERATED ALWAYS AS (length_cm * width_cm * height_cm / 1000000) STORED,
  
  -- Technical info (JSONB for flexibility)
  materials JSONB,
  specifications JSONB,
  manufacturer_description TEXT,
  additional_data JSONB,
  
  -- Validation
  is_valid BOOLEAN DEFAULT false,
  requires_manual_review BOOLEAN DEFAULT true,
  validation_errors JSONB,
  
  -- Metadata
  supplier_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_weight CHECK (weight_kg > 0),
  CONSTRAINT positive_pieces CHECK (pieces_per_box > 0),
  CONSTRAINT positive_dimensions CHECK (
    length_cm > 0 AND width_cm > 0 AND height_cm > 0
  )
);

-- Índices para optimización
CREATE INDEX idx_box_products_supplier ON box_products(supplier_id);
CREATE INDEX idx_box_products_valid ON box_products(is_valid, requires_manual_review);
CREATE INDEX idx_box_products_sku ON box_products(sku);
```

### Supabase (PostgreSQL)

El mismo esquema funciona en Supabase. Además puedes usar:

```sql
-- Row Level Security
ALTER TABLE box_products ENABLE ROW LEVEL SECURITY;

-- Policy para lectura pública de productos válidos
CREATE POLICY "Productos válidos son públicos"
  ON box_products FOR SELECT
  USING (is_valid = true AND requires_manual_review = false);
```

## ✅ Testing

Ejecutar tests:

```bash
npm test box-product-calculator
```

Los tests cubren:
- ✅ Validación de productos
- ✅ Cálculo de peso unitario
- ✅ Cálculo de información de pedido
- ✅ Detección de cajas completas vs parciales
- ✅ Cálculo de volumen
- ✅ Cálculo de envío

## 🚀 Escalabilidad

### Para miles de productos:

1. **Usa índices en la base de datos** (ver arriba)

2. **Implementa caché con Redis**:
```typescript
// Cachear productos frecuentemente consultados
const cacheKey = `product:${productId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

3. **Procesamiento por lotes**:
```typescript
// Importar 1000 productos a la vez
for (let i = 0; i < products.length; i += 100) {
  const batch = products.slice(i, i + 100);
  await batchInsertProducts(batch);
}
```

4. **Vista materializada para productos con cálculos**:
```sql
CREATE MATERIALIZED VIEW products_with_calculations AS
SELECT 
  *,
  weight_kg / pieces_per_box as unit_weight_kg,
  (length_cm * width_cm * height_cm) / 1000000 as box_volume_m3
FROM box_products
WHERE is_valid = true;

-- Refrescar cada hora
REFRESH MATERIALIZED VIEW CONCURRENTLY products_with_calculations;
```

## 🔄 Flujo de Importación

1. **Recibir datos del proveedor**
2. **Validar automáticamente** con `BoxProductCalculator.validateProduct()`
3. **Si válido**: Calcular campos automáticos y guardar
4. **Si inválido**: Marcar `requires_manual_review = true`
5. **Revisión manual** de productos marcados
6. **Revalidación** periódica de productos problemáticos

## 📊 Visualización en Frontend

Los componentes React incluyen:

- ✅ **Muestra solo información disponible** (oculta campos vacíos)
- ✅ **Validación visual** (alertas para productos con errores)
- ✅ **Calculadora en tiempo real** (actualiza al cambiar cantidad)
- ✅ **Desglose de cajas** (muestra cajas completas + piezas sueltas)
- ✅ **Responsive design** con Tailwind CSS

## 🛠️ Mantenimiento

### Validación periódica:
```typescript
// Ejecutar diariamente
async function validateAllProducts() {
  const invalidProducts = await db.getInvalidProducts();
  
  for (const product of invalidProducts) {
    const validation = BoxProductCalculator.validateProduct(product);
    
    if (validation.isValid) {
      // Producto ahora es válido, actualizar
      await db.updateProduct(product.id, {
        is_valid: true,
        requires_manual_review: false
      });
    }
  }
}
```

## 📝 Notas Importantes

- **Peso en kilogramos**, dimensiones en **centímetros**
- **Volumen calculado en metros cúbicos** (m³)
- **Peso volumétrico** usa factor de conversión 200 (estándar de paqueterías)
- **Redondeo hacia arriba** para cajas necesarias (no se pueden pedir fracciones de caja)
- **Información técnica flexible** con campos opcionales

## 🤝 Contribuir

Para agregar nuevas funcionalidades:

1. Actualizar tipos en `lib/types/box-product.ts`
2. Agregar lógica en `lib/box-product-calculator.ts`
3. Crear tests en `lib/__tests__/`
4. Actualizar componentes si es necesario
5. Actualizar esta documentación

---

**Autor**: Sistema de gestión de productos 3A Branding
**Versión**: 1.0.0
**Fecha**: Febrero 2026
