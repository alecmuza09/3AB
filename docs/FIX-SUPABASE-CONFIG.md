# 🔧 SOLUCIÓN: CMS No Guarda - Configuración de Supabase Incorrecta

## 🚨 Problema Identificado

El sistema CMS no guarda porque la configuración de Supabase está incorrecta en `.env.local`.

### ❌ Configuración Actual (INCORRECTA):

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_Ejz-MN2iwQwN5qARcvqnMQ_SMTH76ad"
```

Este NO es el anon key correcto. El anon key de Supabase debe ser un **JWT token** que empiece con `eyJ...`.

---

## ✅ Solución: Obtener las Credenciales Correctas

### Paso 1: Ve a Supabase Dashboard

1. Abre tu navegador
2. Ve a: https://supabase.com/dashboard
3. Inicia sesión con tu cuenta
4. Selecciona tu proyecto: **ecamhibpenoruquwftqe**

### Paso 2: Copia las Credenciales Correctas

1. En el dashboard, ve a **Settings** (⚙️ en el menú lateral izquierdo)
2. Click en **API** en el submenú
3. Verás una pantalla con tus API credentials

### Paso 3: Copia los Valores Correctos

Busca y copia estos dos valores:

#### **Project URL**
```
https://ecamhibpenoruquwftqe.supabase.co
```

#### **anon public** (bajo "Project API keys")
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```
⚠️ Este debe ser un texto MUY LARGO (varios cientos de caracteres) que empiece con `eyJ`

### Paso 4: Actualizar .env.local

Abre el archivo `.env.local` en tu editor y actualiza estas dos líneas:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://ecamhibpenoruquwftqe.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi..."
```

**IMPORTANTE**: Reemplaza el valor completo de `NEXT_PUBLIC_SUPABASE_ANON_KEY` con el token JWT correcto (el que copiaste).

### Paso 5: Reiniciar el Servidor

```bash
# Detener el servidor (Ctrl+C en la terminal donde corre)
# O si está en background:
pkill -f "next dev"

# Iniciar de nuevo
npm run dev
```

### Paso 6: Probar el CMS

1. Ve a http://localhost:3000
2. Inicia sesión como admin
3. Activa el modo de edición (engrane)
4. Edita algo y guarda
5. Deberías ver: **"✅ Cambios guardados exitosamente"**

---

## 🔍 Verificación de las Credenciales

### Cómo Saber si el Anon Key es Correcto

El **anon public key** correcto de Supabase:
- ✅ Empieza con: `eyJ`
- ✅ Es MUY largo (300-500 caracteres)
- ✅ Contiene puntos (.) que separan las partes del JWT
- ✅ Solo contiene caracteres alfanuméricos, guiones y puntos

### Lo que NO es el Anon Key:

- ❌ `sb_publishable_...` (esto es un publishable key de Stripe, no Supabase)
- ❌ Cualquier string corto (menos de 100 caracteres)
- ❌ Credenciales de otros servicios

---

## 🧪 Probar la Conexión

Una vez configurado correctamente, prueba la conexión:

### En DevTools Console (F12):

```javascript
// Verificar que las variables están configuradas
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Anon Key (primeros 20 chars):', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20))

// Si ambas están configuradas, probar la conexión
fetch('/api/site-content?page=home')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Conexión exitosa. Keys cargadas:', Object.keys(data).length)
    console.log('Ejemplo:', data)
  })
  .catch(e => console.error('❌ Error:', e))
```

---

## 📋 Checklist de Verificación

Marca cada paso cuando lo completes:

- [ ] Abrí Supabase Dashboard
- [ ] Fui a Settings > API
- [ ] Copié el Project URL correcto
- [ ] Copié el anon public key correcto (empieza con `eyJ`)
- [ ] Actualicé `.env.local` con los valores correctos
- [ ] Reinicié el servidor (`npm run dev`)
- [ ] Verifiqué que el servidor inició sin errores
- [ ] Inicié sesión como admin
- [ ] Activé el modo de edición
- [ ] Probé guardar un cambio
- [ ] Vi la alerta "✅ Cambios guardados exitosamente"
- [ ] Recar gué la página y el cambio persistió

---

## 🎯 Resultado Esperado

Una vez corregida la configuración:

1. **Al abrir DevTools > Console**, NO deberías ver errores de Supabase
2. **Al activar el modo de edición**, deberías ver los bordes editables
3. **Al guardar**, deberías ver en la consola:
   ```
   💾 Guardando cambios: {pageSlug: "home", contentKey: "...", value: "..."}
   📥 Respuesta del servidor: {success: true, updated: 1}
   ✅ Guardado exitoso
   ```
4. **Alerta visual**: "✅ Cambios guardados exitosamente"
5. **El contenido se actualiza** inmediatamente en la página
6. **Después de recargar** (F5), el cambio persiste

---

## 🆘 Si Sigue Sin Funcionar

Si después de corregir las credenciales sigue sin funcionar:

### 1. Verifica que tengas una cuenta admin

```sql
-- En Supabase SQL Editor, ejecuta:
SELECT id, email, role FROM profiles WHERE email = 'tu-email@ejemplo.com';

-- Si el role no es 'admin', actualiza:
UPDATE profiles SET role = 'admin' WHERE email = 'tu-email@ejemplo.com';
```

### 2. Verifica que la tabla site_content exista

```sql
-- En Supabase SQL Editor:
SELECT * FROM site_content LIMIT 5;
```

Si no existe, ejecuta la migración:
```bash
# Desde la raíz del proyecto:
psql $DATABASE_URL < supabase/migrations/20250209_site_content.sql
```

### 3. Verifica las políticas RLS

```sql
-- En Supabase SQL Editor:
SELECT * FROM pg_policies WHERE tablename = 'site_content';
```

Deberías ver dos políticas:
- "Anyone can view site content"
- "Admins can manage site content"

Si no existen, vuelve a ejecutar la migración.

---

## 📞 Soporte

Si después de seguir todos estos pasos el problema persiste:

1. Copia el output de DevTools > Console cuando intentas guardar
2. Copia el error completo (si lo hay)
3. Toma screenshots de:
   - Tu archivo `.env.local` (OCULTA los valores sensibles)
   - Las credenciales en Supabase Dashboard
   - El error en la consola
4. Contacta al equipo de desarrollo con esta información

---

## 🎉 Una Vez Resuelto

Cuando el sistema funcione correctamente:

1. **Actualiza también la configuración en Netlify**:
   - Ve a Site settings > Environment variables
   - Usa las MISMAS credenciales correctas de Supabase
   - Haz un nuevo deploy

2. **Documenta las credenciales** en un lugar seguro (password manager)

3. **Prueba en producción** después del deploy

¡El sistema CMS funcionará perfectamente! 🚀
