# 📋 Instrucciones para Crear las Tablas en Supabase

## 🚀 Método Recomendado: Dashboard de Supabase

### Paso 1: Acceder al SQL Editor

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto: **3ABranding** (ID: ecamhibpenoruquwftqe)
3. En el menú lateral, haz clic en **SQL Editor**
4. Haz clic en **New Query**

### Paso 2: Ejecutar el Schema

1. Abre el archivo `supabase/schema.sql` en tu editor
2. Copia **TODO** el contenido del archivo
3. Pega el contenido en el SQL Editor de Supabase
4. Haz clic en **Run** o presiona `Ctrl+Enter` (o `Cmd+Enter` en Mac)
5. Espera a que se complete la ejecución (debería tomar unos segundos)

### Paso 3: Ejecutar las Políticas RLS

1. Abre el archivo `supabase/rls-policies.sql` en tu editor
2. Copia **TODO** el contenido del archivo
3. Crea una nueva query en el SQL Editor
4. Pega el contenido
5. Haz clic en **Run**

### Paso 4: Verificar

1. Ve a **Table Editor** en el menú lateral
2. Deberías ver todas las tablas creadas:
   - profiles
   - categories
   - products
   - product_variations
   - product_images
   - addresses
   - cart_items
   - orders
   - order_items
   - quotations
   - quotation_items
   - reviews
   - customizations

## 🔧 Método Alternativo: Línea de Comandos

Si prefieres usar la línea de comandos:

### Requisitos

- PostgreSQL client (`psql`) instalado
- La variable `DATABASE_URL` configurada en tu `.env.local`

### Ejecutar

```bash
# Desde la raíz del proyecto
cd "/Users/alecmuza/Downloads/3A Branding"

# Ejecutar el script de migración
./supabase/migrate.sh
```

O manualmente:

```bash
# Conecta a la base de datos
psql "postgresql://postgres:[TU_PASSWORD]@db.ecamhibpenoruquwftqe.supabase.co:5432/postgres"

# Ejecuta los scripts
\i supabase/schema.sql
\i supabase/rls-policies.sql
```

## ⚠️ Notas Importantes

1. **Ejecuta primero `schema.sql`** antes de `rls-policies.sql`
2. Si ves errores sobre "relation already exists", algunas tablas ya existen. Puedes:
   - Omitir esas tablas
   - O eliminar las tablas existentes primero (¡cuidado con los datos!)
3. Las políticas RLS están diseñadas para proteger tus datos automáticamente
4. Los datos iniciales (categorías) se insertarán automáticamente

## 🐛 Solución de Problemas

### Error: "permission denied"
- Asegúrate de estar usando las credenciales correctas
- Verifica que tengas permisos de administrador en el proyecto

### Error: "relation already exists"
- Algunas tablas ya existen. Esto está bien, simplemente omite esos errores
- Si quieres recrear todo, primero elimina las tablas existentes

### Las tablas no aparecen
- Refresca la página del Table Editor
- Verifica que los scripts se ejecutaron sin errores críticos

## ✅ Verificación Final

Después de ejecutar los scripts, verifica:

1. ✅ Todas las tablas están creadas
2. ✅ Los índices están creados (puedes verlos en la pestaña "Indexes")
3. ✅ Las políticas RLS están activas (puedes verlas en la pestaña "Policies")
4. ✅ Las categorías iniciales están insertadas

## 📚 Próximos Pasos

Una vez que las tablas estén creadas:

1. Configura el almacenamiento de archivos en Supabase (Storage) para imágenes
2. Crea algunos productos de prueba
3. Prueba la conexión desde tu aplicación Next.js
4. Configura la autenticación si aún no lo has hecho

## 🆘 ¿Necesitas Ayuda?

Si encuentras problemas:

1. Revisa los logs en el SQL Editor de Supabase
2. Verifica que todas las variables de entorno estén configuradas
3. Consulta la documentación de Supabase: https://supabase.com/docs


