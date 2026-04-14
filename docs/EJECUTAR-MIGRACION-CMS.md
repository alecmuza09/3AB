# 🔧 SOLUCIÓN DEFINITIVA: Crear la Tabla site_content en Supabase

## 🚨 Problema Real

La tabla `site_content` **no existe** en tu base de datos de Supabase. Por eso el CMS no puede guardar nada.

Error en los logs:
```
Could not find the table 'public.site_content' in the schema cache
```

---

## ✅ Solución: Ejecutar la Migración en Supabase

### Opción 1: SQL Editor (MÁS FÁCIL) ⭐

1. **Ve a Supabase Dashboard**
   - Abre: https://supabase.com/dashboard
   - Selecciona tu proyecto: **ecamhibpenoruquwftqe**

2. **Abre el SQL Editor**
   - En el menú lateral izquierdo, busca **SQL Editor** (icono de base de datos)
   - Click en **SQL Editor**

3. **Crea una Nueva Query**
   - Click en **+ New query**
   - Se abrirá un editor SQL vacío

4. **Copia y Pega este SQL** (desde el archivo `supabase/migrations/20250209_site_content.sql`):

```sql
-- ============================================
-- CMS: Contenido editable del sitio (textos, imágenes)
-- ============================================
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'html')),
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_slug, section_key)
);

CREATE INDEX IF NOT EXISTS idx_site_content_page ON site_content(page_slug);

-- Permitir lectura pública para que el front muestre el contenido
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site content"
  ON site_content FOR SELECT
  USING (true);

-- Solo admins pueden insertar/actualizar (vía service role o API con verificación)
CREATE POLICY "Admins can manage site content"
  ON site_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

COMMENT ON TABLE site_content IS 'Contenido editable del sitio (CMS): textos e imágenes por página y sección';
```

5. **Ejecuta la Query**
   - Click en **Run** (o presiona `Ctrl+Enter` / `Cmd+Enter`)
   - Deberías ver: **"Success. No rows returned"**

6. **Verifica que la Tabla se Creó**
   - Ve a **Table Editor** en el menú lateral
   - Busca la tabla **site_content**
   - Deberías verla en la lista de tablas

---

### Opción 2: Usando Supabase CLI (Si tienes instalada la CLI)

```bash
# Desde la raíz de tu proyecto:
npx supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.ecamhibpenoruquwftqe.supabase.co:5432/postgres"

# O si tienes la CLI instalada:
supabase db push
```

---

## 🧪 Verificar que Funcionó

### 1. Recargar la Página

Después de crear la tabla, recarga tu sitio:
- Ve a http://localhost:3000
- Presiona `F5` o `Ctrl+R` / `Cmd+R`

### 2. Verificar en DevTools Console

Abre DevTools (`F12`) y verifica que **ya no aparecen** los errores:
```
site_content GET error: Could not find the table...
```

### 3. Probar el Guardado

1. Inicia sesión como admin (si no lo has hecho)
2. Activa el modo de edición (engrane ⚙️)
3. Edita cualquier texto
4. Click en **Guardar**
5. Deberías ver: **"✅ Cambios guardados exitosamente"**
6. Recarga la página (`F5`)
7. **El cambio debe persistir** ✅

---

## 📋 Checklist de Verificación

Marca cada paso:

- [ ] Abrí Supabase Dashboard
- [ ] Fui a SQL Editor
- [ ] Copié el SQL de la migración
- [ ] Ejecuté la query (Run)
- [ ] Vi "Success. No rows returned"
- [ ] Verifiqué en Table Editor que la tabla `site_content` existe
- [ ] Recarqué la página (F5)
- [ ] Ya no veo errores en DevTools Console
- [ ] Inicié sesión como admin
- [ ] Activé el modo de edición
- [ ] Edité un texto y guardé
- [ ] Vi "✅ Cambios guardados exitosamente"
- [ ] Recarqué la página y el cambio persistió

---

## 🔍 Verificar Políticas RLS

Después de crear la tabla, verifica que las políticas de seguridad estén activas:

### En SQL Editor, ejecuta:

```sql
-- Ver las políticas de la tabla site_content
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'site_content';
```

Deberías ver **2 políticas**:
1. `Anyone can view site content` (SELECT)
2. `Admins can manage site content` (ALL)

---

## ⚠️ IMPORTANTE: Crear Usuario Admin

Para que puedas guardar, necesitas tener un usuario con rol `admin` en la tabla `profiles`.

### Verificar si tienes rol admin:

```sql
SELECT id, email, role 
FROM profiles 
WHERE email = 'tu-email@ejemplo.com';
```

### Si no tienes rol admin, créalo o actualízalo:

```sql
-- Si el usuario NO existe, créalo:
INSERT INTO profiles (id, email, role)
VALUES (
  auth.uid(), -- Usar tu ID de usuario actual
  'tu-email@ejemplo.com',
  'admin'
);

-- Si el usuario existe pero no es admin, actualízalo:
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'tu-email@ejemplo.com';
```

**Nota**: Reemplaza `'tu-email@ejemplo.com'` con el email que usas para iniciar sesión.

---

## 🎯 Resultado Esperado

Una vez completados todos los pasos:

### ✅ En los Logs del Servidor (terminal):
```
✅ Ya NO deberías ver:
site_content GET error: Could not find the table...

✅ Deberías ver:
GET /api/site-content?page=home 200 in 50ms
PATCH /api/site-content 200 in 120ms
```

### ✅ En DevTools Console:
```javascript
💾 Guardando cambios: {pageSlug: "home", contentKey: "hero_title_line1", ...}
📥 Respuesta del servidor: {success: true, updated: 1}
✅ Guardado exitoso
```

### ✅ Comportamiento Visual:
1. Aparece alerta: **"✅ Cambios guardados exitosamente"**
2. El contenido se actualiza inmediatamente en la página
3. Después de recargar (F5), el cambio persiste
4. En Supabase Table Editor, puedes ver el registro en `site_content`

---

## 🆘 Si Sigue Sin Funcionar

### 1. Verifica que la tabla existe:

```sql
SELECT * FROM site_content LIMIT 5;
```

Si da error, la tabla no se creó correctamente.

### 2. Verifica que estás logueado como admin:

En DevTools Console:
```javascript
// Verificar sesión
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
const { data: { session } } = await supabase.auth.getSession()
console.log('Usuario:', session?.user?.email)

// Verificar rol
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', session?.user?.id)
  .single()
console.log('Rol:', profile?.role)
```

Deberías ver: `Rol: admin`

### 3. Reinicia el servidor:

```bash
# Detener
Ctrl+C

# Iniciar de nuevo
npm run dev
```

### 4. Borra el cache del navegador:

- Chrome/Edge: `Ctrl+Shift+Delete` (Windows) / `Cmd+Shift+Delete` (Mac)
- Selecciona "Cached images and files"
- Click "Clear data"
- Recarga la página (`F5`)

---

## 🚀 Una Vez Funcionando

Cuando todo funcione correctamente:

1. **Haz commit de tus cambios locales:**
   ```bash
   git add .
   git commit -m "fix: Ejecutar migración site_content en Supabase"
   git push origin main
   ```

2. **La tabla ya está en Supabase**, así que el deploy en Netlify funcionará automáticamente

3. **Prueba en producción** después del deploy

¡El CMS debería funcionar perfectamente ahora! 🎉
