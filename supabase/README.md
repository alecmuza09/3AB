# 🗄️ Scripts de Base de Datos - Supabase

Este directorio contiene los scripts SQL necesarios para configurar la base de datos de 3A Branding.

## 📋 Archivos

- **`schema.sql`** - Esquema completo de la base de datos (tablas, índices, funciones, triggers)
- **`rls-policies.sql`** - Políticas de seguridad Row Level Security (RLS)

## 🚀 Cómo Ejecutar

### Opción 1: Desde el Dashboard de Supabase (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Crea una nueva consulta
4. Copia y pega el contenido de `schema.sql`
5. Ejecuta el script
6. Repite el proceso con `rls-policies.sql`

### Opción 2: Desde la línea de comandos

```bash
# Conecta a tu base de datos usando psql
psql "postgresql://postgres:[TU_PASSWORD]@db.ecamhibpenoruquwftqe.supabase.co:5432/postgres"

# Ejecuta los scripts
\i supabase/schema.sql
\i supabase/rls-policies.sql
```

## 📊 Estructura de Tablas

### Tablas Principales

1. **profiles** - Perfiles de usuario extendidos
2. **categories** - Categorías de productos
3. **products** - Catálogo de productos
4. **product_variations** - Variaciones de productos (tamaños, colores)
5. **product_images** - Imágenes de productos
6. **addresses** - Direcciones de envío/facturación
7. **cart_items** - Carrito de compras
8. **orders** - Pedidos/Órdenes
9. **order_items** - Items de pedidos
10. **quotations** - Cotizaciones
11. **quotation_items** - Items de cotizaciones
12. **reviews** - Reseñas/Testimonios
13. **customizations** - Personalizaciones guardadas

## 🔐 Seguridad (RLS)

Todas las tablas tienen Row Level Security (RLS) habilitado con políticas que:

- Permiten a los usuarios ver y modificar solo sus propios datos
- Permiten a los administradores ver y modificar todos los datos
- Permiten acceso público solo a datos que deben ser públicos (productos activos, categorías, etc.)

## ⚙️ Funciones Automáticas

### Triggers

- **`update_updated_at_column()`** - Actualiza automáticamente el campo `updated_at` cuando se modifica un registro

### Funciones de Utilidad

- **`generate_order_number()`** - Genera números de orden únicos (formato: ORD-YYYYMMDD-XXXX)
- **`generate_quotation_number()`** - Genera números de cotización únicos (formato: COT-YYYYMMDD-XXXX)
- **`update_product_rating()`** - Actualiza automáticamente el rating y review_count de productos cuando se agregan/modifican reseñas

## 📝 Notas Importantes

1. **Ejecuta primero `schema.sql`** antes de `rls-policies.sql`
2. Las políticas RLS están diseñadas para permitir acceso público a productos y categorías activas
3. Los usuarios solo pueden ver y modificar sus propios datos (carrito, pedidos, direcciones, etc.)
4. Los administradores tienen acceso completo a todas las tablas

## 🔄 Migraciones Futuras

Para futuras migraciones, crea nuevos archivos SQL numerados:

```
supabase/
  migrations/
    001_initial_schema.sql
    002_add_new_feature.sql
    003_update_products_table.sql
```

## 🐛 Troubleshooting

### Error: "relation already exists"
- Algunas tablas ya existen. Puedes usar `DROP TABLE IF EXISTS` antes de crear, o simplemente omitir las tablas que ya existen.

### Error: "permission denied"
- Asegúrate de estar usando el usuario correcto (postgres) o tener los permisos necesarios.

### RLS bloqueando consultas
- Verifica que las políticas RLS estén correctamente configuradas
- Los usuarios autenticados pueden necesitar tener un perfil creado en la tabla `profiles`

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Reference](https://supabase.com/docs/guides/database/tables)

