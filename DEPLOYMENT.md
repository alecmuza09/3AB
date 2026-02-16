# Guía de Deployment en Netlify

## 🚀 Pasos para Deploy

### 1. Preparar el Repositorio

Asegúrate de que el código esté en GitHub:

```bash
git add -A
git commit -m "Preparar para deploy en Netlify"
git push origin main
```

### 2. Conectar con Netlify

1. Ve a [Netlify](https://app.netlify.com/)
2. Haz clic en "Add new site" > "Import an existing project"
3. Selecciona GitHub y autoriza el acceso
4. Selecciona el repositorio `3AB`
5. Configura el build:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: 20

### 3. Configurar Variables de Entorno

**MUY IMPORTANTE**: Configura las variables de entorno en Netlify:

1. Ve a: **Site settings** > **Environment variables**
2. Haz clic en **"Add a variable"**
3. Agrega las siguientes variables **MÍNIMAS REQUERIDAS**:

#### Variables Esenciales (Obligatorias)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXTAUTH_URL=https://tu-sitio.netlify.app
NEXTAUTH_SECRET=genera-un-secret-aleatorio
```

**Cómo generar NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

O usa este generador online: https://generate-secret.vercel.app/32

#### Variables Opcionales (según funcionalidades)

Si usas pagos:
```bash
STRIPE_SECRET_KEY=sk_xxx
MERCADOPAGO_ACCESS_TOKEN=xxx
```

Si usas email:
```bash
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@3abranding.com
```

Para ver la lista completa, revisa `.env.example`

### 4. Deploy Inicial

1. Haz clic en **"Deploy site"**
2. Netlify comenzará el build
3. Espera a que termine (puede tardar 2-5 minutos)

### 5. Verificar el Deploy

Una vez completado:

1. Ve a la URL que Netlify te asignó (ej: `https://tu-sitio-123456.netlify.app`)
2. Verifica que el sitio cargue correctamente
3. Prueba el login (para admin CMS)

### 6. Configurar Dominio Personalizado (Opcional)

1. Ve a **Site settings** > **Domain management**
2. Haz clic en **"Add custom domain"**
3. Sigue las instrucciones para configurar tu dominio

## 🐛 Solución de Problemas

### Error: "Build failed with exit code 1"

**Causa**: Faltan variables de entorno

**Solución**:
1. Ve a **Site settings** > **Environment variables**
2. Verifica que al menos tengas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
3. Haz clic en **"Trigger deploy"** > **"Deploy site"**

### Error: "Dynamic server usage"

**Causa**: Rutas dinámicas que usan `request.url`

**Solución**: Es un warning normal, no afecta el build. Se puede ignorar.

### Error: "Module not found"

**Causa**: Dependencia faltante

**Solución**:
1. Verifica que el `package.json` tenga todas las dependencias
2. Elimina `node_modules` y `package-lock.json`
3. Ejecuta `npm install`
4. Haz commit y push

### El CMS no guarda cambios

**Causa**: Variables de Supabase incorrectas o permisos faltantes

**Solución**:
1. Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctas
2. Verifica en Supabase Dashboard que:
   - La tabla `site_content` exista
   - Las políticas RLS estén configuradas
   - Tu usuario tenga rol `admin` en la tabla `profiles`

### Timeout en el Build

**Causa**: Build muy lento o dependencias grandes

**Solución**:
1. Actualiza a un plan de Netlify con más tiempo de build
2. Optimiza las dependencias en `package.json`
3. Usa caché de Netlify (habilitado por defecto)

## 📝 Checklist Pre-Deploy

Antes de hacer deploy, verifica:

- [ ] El build local funciona: `npm run build`
- [ ] No hay errores de TypeScript: `npm run lint`
- [ ] Las variables de entorno están en `.env.local` (para local)
- [ ] El código está en GitHub
- [ ] Has creado las migraciones de Supabase necesarias
- [ ] Tienes las credenciales de Supabase a mano

## 🔄 Deploys Automáticos

Una vez configurado, Netlify hará deploy automático cada vez que hagas push a `main`:

```bash
git add -A
git commit -m "Nuevos cambios"
git push origin main
```

Netlify detectará el push y comenzará un nuevo deploy automáticamente.

## 📊 Monitoreo

Puedes ver el estado de tus deploys en:

1. Dashboard de Netlify > **Deploys**
2. Ver logs de build
3. Ver logs de funciones (si usas Netlify Functions)

## 🔒 Seguridad

**IMPORTANTE**: NUNCA hagas commit de `.env.local` al repositorio

El archivo `.gitignore` ya incluye:
```
.env.local
.env.development.local
.env.production.local
```

Siempre configura variables sensibles en Netlify UI, nunca en el código.

## 📚 Recursos

- [Netlify Docs - Next.js](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase + Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## ✅ Verificación Post-Deploy

Una vez deployado, verifica:

1. **Página de inicio** carga correctamente
2. **Login** funciona
3. **CMS** (botón de engrane) aparece para admins
4. **Edición de contenido** guarda correctamente
5. **Imágenes** cargan
6. **API routes** responden

Si todo funciona, ¡felicidades! 🎉 Tu sitio está en producción.
