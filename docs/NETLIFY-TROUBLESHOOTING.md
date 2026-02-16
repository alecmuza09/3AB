# Solución de Problemas de Deploy en Netlify

## 🚨 Error: "Build failed with exit code 1 or 2"

Este es el error más común en Netlify. Aquí está cómo resolverlo:

### Paso 1: Verificar Variables de Entorno

El error más frecuente es por **variables de entorno faltantes**.

#### En Netlify Dashboard:

1. Ve a tu sitio en Netlify
2. Click en **Site settings** (configuración del sitio)
3. Click en **Environment variables** en el menú lateral
4. Verifica que tengas estas variables **MÍNIMAS**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXTAUTH_URL=https://tu-sitio.netlify.app
NEXTAUTH_SECRET=un-string-aleatorio-muy-largo-y-seguro
```

#### Cómo obtener las variables de Supabase:

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** > **API**
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Cómo generar NEXTAUTH_SECRET:

Ejecuta en tu terminal:
```bash
openssl rand -base64 32
```

O usa este generador: https://generate-secret.vercel.app/32

---

### Paso 2: Verificar el Build Localmente

Antes de hacer deploy a Netlify, **siempre** verifica que el build funcione localmente:

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env.local con tus variables (copia de .env.example)
cp .env.example .env.local

# 3. Editar .env.local con tus valores reales

# 4. Ejecutar el build
npm run build
```

Si el build falla localmente, verás el error específico. **No hagas deploy hasta que el build local funcione.**

---

### Paso 3: Ver los Logs Completos de Netlify

Para ver el error exacto:

1. Ve a tu sitio en Netlify
2. Click en **Deploys** en el menú superior
3. Click en el deploy fallido (el que tiene ❌)
4. Busca la sección **Deploy log**
5. Haz scroll hasta encontrar el error real (usualmente después de "Failed during stage 'building site'")

Los errores comunes incluyen:

#### Error: "Module not found: Can't resolve '@/...' "

**Causa**: Falta una dependencia o import incorrecto

**Solución**:
```bash
# Verifica que el módulo exista
ls -la components/nombre-del-modulo.tsx

# Si falta, instálalo:
npm install nombre-del-paquete

# Haz commit y push
git add package.json package-lock.json
git commit -m "fix: Agregar dependencia faltante"
git push
```

#### Error: "Type error: Cannot find name/module/type..."

**Causa**: Error de TypeScript

**Solución**:
```bash
# Ejecutar el linter
npm run lint

# Revisar errores de TypeScript
npx tsc --noEmit

# Corregir los errores mostrados
# Commit y push
```

#### Error: "Error: Invalid environment variable: NEXT_PUBLIC_..."

**Causa**: Variable de entorno requerida pero no configurada

**Solución**: Agregar la variable en Netlify (ver Paso 1)

---

### Paso 4: Verificar la Configuración de Netlify

#### netlify.toml

Asegúrate de que el archivo `netlify.toml` en la raíz del proyecto tenga:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
```

#### Build Settings en Netlify UI

Ve a **Site settings** > **Build & deploy** > **Build settings**:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 20 (configurado en netlify.toml)

---

## 🔧 Problemas Específicos del CMS

### El botón de guardar no funciona

#### Síntoma: Al hacer clic en "Guardar", no pasa nada o aparece un error

**Diagnóstico paso a paso:**

1. **Abrir DevTools** (F12 o Cmd+Option+I)
2. **Ir a la pestaña Console**
3. **Activar modo de edición** (click en el engrane)
4. **Intentar guardar** un cambio
5. **Ver los logs** en la consola

#### Logs esperados (cuando funciona):

```
💾 Guardando cambios: {pageSlug: "home", contentKey: "hero_title", value: "..."}
📥 Respuesta del servidor: {success: true, updated: 1}
✅ Guardado exitoso
```

#### Si ves error 401 "No autorizado":

**Causa**: Tu sesión expiró o no estás autenticado

**Solución**:
1. Cierra sesión
2. Vuelve a iniciar sesión
3. Intenta guardar de nuevo

#### Si ves error 403 "Se requieren permisos de administrador":

**Causa**: Tu usuario no tiene rol de admin

**Solución**:
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Table Editor** > **profiles**
4. Busca tu usuario (por email)
5. Edita la columna `role` y pon: `admin`
6. Guarda
7. Cierra sesión en la app
8. Vuelve a iniciar sesión
9. Intenta guardar de nuevo

#### Si ves error 400 "Página no definida en el schema":

**Causa**: La página no está en `site-content-schema.ts`

**Solución**:
- Solo las páginas: home, servicios, catalogos, nosotros, contacto están soportadas
- Si estás en otra página, no funcionará
- Para agregar una nueva página, edita `lib/site-content-schema.ts`

#### Si ves error de red o timeout:

**Causa**: Problema de conexión

**Solución**:
1. Verifica tu conexión a internet
2. Verifica que Supabase esté funcionando: https://status.supabase.com/
3. Intenta de nuevo en unos segundos

---

### Los cambios no persisten después de recargar

#### Síntoma: Guardas un cambio, ves la confirmación, pero al recargar la página vuelve al valor anterior

**Diagnóstico:**

1. **Abrir DevTools** > **Network**
2. **Filtrar por**: `site-content`
3. **Hacer un cambio y guardar**
4. **Ver la petición PATCH**:
   - Click en la petición
   - Ve a **Preview** o **Response**
   - Deberías ver: `{success: true, updated: 1}`

5. **Verificar en Supabase**:
   - Ve a Supabase Dashboard
   - **Table Editor** > **site_content**
   - Busca tu registro (filtra por `page_slug` = "home" o la página que editaste)
   - Verifica que el campo `value` tenga tu cambio
   - Verifica que `updated_at` tenga una fecha reciente

**Si la petición fue exitosa pero no aparece en la BD:**

**Causa**: Problema con las políticas RLS de Supabase

**Solución**:
```sql
-- Verifica las políticas en Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'site_content';

-- Si no existen, ejecútalas desde:
-- supabase/migrations/20250209_site_content.sql
```

**Si el dato está en la BD pero no se muestra en la página:**

**Causa**: Caché del navegador o problema en el GET

**Solución**:
1. Haz **hard refresh**: Cmd+Shift+R (Mac) o Ctrl+Shift+R (Windows)
2. Si persiste, limpia el caché del navegador
3. Si aún persiste, revisa la consola por errores en el GET

---

## 🔍 Debugging Avanzado

### Verificar que Supabase esté conectado

Ejecuta en DevTools Console:

```javascript
fetch('/api/site-content?page=home')
  .then(r => r.json())
  .then(data => console.log('Contenido de home:', data))
```

Deberías ver un objeto con todas las keys de la página home.

### Verificar autenticación

```javascript
// En una página del sitio, abre DevTools Console
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  'TU_SUPABASE_URL',
  'TU_ANON_KEY'
)
supabase.auth.getSession().then(d => console.log('Sesión:', d))
```

Deberías ver tu sesión activa con un `access_token`.

### Verificar permisos de admin

```javascript
fetch('/api/admin/users', {
  headers: {
    'Authorization': 'Bearer TU_TOKEN_AQUI'
  }
})
.then(r => r.json())
.then(data => console.log('Admin check:', data))
```

Si eres admin, debería funcionar. Si no, error 403.

---

## 📋 Checklist de Verificación

Antes de reportar un bug, verifica:

- [ ] El build local funciona: `npm run build`
- [ ] Las variables de entorno están configuradas en Netlify
- [ ] La tabla `site_content` existe en Supabase
- [ ] Las políticas RLS están configuradas
- [ ] Tu usuario tiene rol `admin` en la tabla `profiles`
- [ ] Estás autenticado en la aplicación
- [ ] El navegador no está bloqueando requests (revisar Console)
- [ ] Supabase está operativo: https://status.supabase.com/

---

## 🆘 Soluciones Rápidas

### Reset completo del CMS

Si todo falla, intenta este reset:

```sql
-- En Supabase SQL Editor, ejecuta:

-- 1. Borrar todo el contenido actual
TRUNCATE site_content;

-- 2. Verificar políticas
DROP POLICY IF EXISTS "Anyone can view site content" ON site_content;
DROP POLICY IF EXISTS "Admins can manage site content" ON site_content;

-- 3. Recrear políticas
CREATE POLICY "Anyone can view site content"
  ON site_content FOR SELECT
  USING (true);

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

-- 4. Verificar tu rol de admin
SELECT id, email, role FROM profiles WHERE email = 'tu-email@ejemplo.com';

-- 5. Si no eres admin, actualizar:
UPDATE profiles SET role = 'admin' WHERE email = 'tu-email@ejemplo.com';
```

### Limpiar caché de Netlify

1. Ve a **Site settings** > **Build & deploy** > **Post processing**
2. Click en **Clear build cache**
3. Haz un nuevo deploy: **Deploys** > **Trigger deploy** > **Deploy site**

---

## 📞 Soporte

Si después de seguir todos estos pasos el problema persiste:

1. **Copia los logs completos** del deploy de Netlify
2. **Copia los errores** de la consola del navegador (DevTools)
3. **Documenta los pasos** que seguiste
4. Contacta al equipo de desarrollo con:
   - Logs de Netlify
   - Screenshots de los errores
   - Variables de entorno configuradas (SIN los valores, solo los nombres)
   - Navegador y versión

---

## ✅ Verificación Final

Una vez resuelto, verifica:

1. El sitio carga en Netlify ✅
2. Puedes iniciar sesión ✅
3. Ves el botón de engrane (si eres admin) ✅
4. Puedes activar modo de edición ✅
5. Puedes guardar cambios ✅
6. Los cambios persisten después de recargar ✅

Si todos los checks están verdes, ¡el deploy está funcionando correctamente! 🎉
