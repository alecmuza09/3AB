# Guía de Prueba del Sistema CMS

## ✅ Verificación de Funcionalidad

Sigue estos pasos para verificar que el sistema CMS funcione correctamente:

### 1. Requisitos Previos

Antes de comenzar, asegúrate de:

- [ ] Tener una cuenta con rol de **administrador** en Supabase
- [ ] Haber iniciado sesión en la aplicación
- [ ] Estar en un navegador web moderno (Chrome, Firefox, Safari, Edge)

### 2. Verificar que aparezca el botón de engrane

1. Navega a cualquiera de estas páginas:
   - `/` (Inicio)
   - `/servicios`
   - `/catalogos`
   - `/nosotros`
   - `/contacto`

2. Busca el **botón de engrane flotante** (⚙️) en la esquina inferior derecha
   - Si NO aparece, verifica que hayas iniciado sesión como administrador

### 3. Activar el Modo de Edición

1. Haz clic en el **botón de engrane** (⚙️)
2. El botón debe cambiar de color rojo a **verde** ✅
3. El ícono debe cambiar de engrane a **lápiz** ✏️

### 4. Verificar Elementos Editables en Página de Inicio

Una vez activado el modo de edición, verifica los siguientes elementos:

#### Hero Section
- [ ] **Imagen Hero**: Borde azul punteado al pasar el mouse
- [ ] **Badge**: Borde morado punteado
- [ ] **Título línea 1**: Borde morado punteado
- [ ] **Título línea 2** (en rojo): Borde morado punteado
- [ ] **Subtítulo**: Borde morado punteado

#### How It Works Section
- [ ] **Badge**: Borde morado punteado
- [ ] **Título**: Borde morado punteado
- [ ] **Subtítulo**: Borde morado punteado

#### AI Assistant Section
- [ ] **Badge**: Borde morado punteado
- [ ] **Título línea 1**: Borde morado punteado
- [ ] **Título línea 2** (en rojo): Borde morado punteado
- [ ] **Subtítulo**: Borde morado punteado
- [ ] **Texto del botón**: Borde morado punteado

#### Categories Section
- [ ] **Badge**: Borde morado punteado
- [ ] **Título**: Borde morado punteado
- [ ] **Texto del enlace**: Borde morado punteado

#### About Us Section
- [ ] **Badge**: Borde morado punteado
- [ ] **Título**: Borde morado punteado
- [ ] **Subtítulo**: Borde morado punteado

### 5. Probar Edición de Texto

1. Pasa el mouse sobre cualquier **texto con borde morado**
2. Debe aparecer un **botón morado con lápiz** en la esquina
3. Haz clic en el botón morado
4. Se debe abrir un **diálogo** con el contenido actual
5. Modifica el texto (ej: agrega "PRUEBA" al final)
6. Haz clic en **"Guardar"**
7. El diálogo debe cerrarse
8. El texto debe actualizarse **inmediatamente** en la página
9. Recarga la página (F5)
10. Verifica que el cambio **persista** después de recargar

### 6. Probar Edición de Imágenes

1. Pasa el mouse sobre la **imagen hero** (borde azul)
2. Debe aparecer un **botón azul con ícono de imagen**
3. Haz clic en el botón azul
4. Se debe abrir un diálogo con:
   - Campo para la URL de la imagen
   - Vista previa de la imagen actual
5. Ingresa una nueva URL de imagen (prueba con):
   ```
   https://images.unsplash.com/photo-1557821552-17105176677c?w=800
   ```
6. Verifica que aparezca la **vista previa** de la nueva imagen
7. Haz clic en **"Guardar"**
8. El diálogo debe cerrarse
9. La imagen debe actualizarse **inmediatamente**
10. Recarga la página (F5)
11. Verifica que el cambio **persista**

### 7. Probar Edición de Bloques (Servicios)

1. Ve a la página `/servicios`
2. Activa el modo de edición
3. Pasa el mouse sobre cualquier **tarjeta de servicio** (borde rojo)
4. Debe aparecer un **botón rojo "Editar bloque"**
5. Haz clic en el botón
6. Se debe abrir un diálogo con:
   - Campo para el título
   - Campo para la descripción
   - Campo para la lista (un ítem por línea)
7. Modifica cualquier campo
8. Haz clic en **"Guardar"**
9. El contenido debe actualizarse inmediatamente
10. Recarga la página
11. Verifica que persista

### 8. Verificar Guardado en Base de Datos

Para verificar técnicamente que los datos se guardan:

#### Opción A: Usar Supabase Dashboard

1. Ve a tu proyecto en Supabase (https://supabase.com)
2. Navega a **Table Editor** > **site_content**
3. Busca los registros con `page_slug = 'home'` (o la página que editaste)
4. Verifica que el campo `value` contenga el texto que modificaste
5. Verifica que el campo `updated_at` tenga la fecha/hora reciente

#### Opción B: Inspeccionar Network en DevTools

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Activa el modo de edición
4. Edita algún elemento
5. Haz clic en "Guardar"
6. En Network, busca una petición a `/api/site-content`
7. Verifica que:
   - Método: `PATCH`
   - Status: `200 OK`
   - Response body: `{"success": true, "updated": 1}` (o el número de campos actualizados)

### 9. Probar en Diferentes Páginas

Repite las pruebas anteriores en cada página:

- [ ] **Inicio** (`/`)
- [ ] **Servicios** (`/servicios`)
- [ ] **Catálogos** (`/catalogos`)
- [ ] **Nosotros** (`/nosotros`)
- [ ] **Contacto** (`/contacto`)

### 10. Verificar Seguridad

#### Prueba 1: Usuario No Admin

1. Cierra sesión
2. Inicia sesión con una cuenta **sin permisos de admin**
3. Ve a la página de inicio
4. Verifica que el **botón de engrane NO aparezca** ✅
5. Verifica que no haya bordes editables

#### Prueba 2: Sin Sesión

1. Cierra sesión completamente
2. Ve a la página de inicio como **usuario anónimo**
3. Verifica que el **botón de engrane NO aparezca** ✅
4. Verifica que el contenido se muestre correctamente

#### Prueba 3: Intento de Edición sin Auth (Técnica)

1. Abre DevTools (F12) > Console
2. Ejecuta el siguiente código:
   ```javascript
   fetch('/api/site-content', {
     method: 'PATCH',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       page_slug: 'home',
       updates: { hero_title_line1: 'HACK INTENTO' }
     })
   }).then(r => r.json()).then(console.log)
   ```
3. Debes recibir: `{"error": "No autorizado"}` con status 401 ✅

## 🐛 Solución de Problemas

### Problema: El botón de engrane no aparece

**Solución:**
1. Verifica que hayas iniciado sesión
2. Ve a Supabase Dashboard > Authentication > Users
3. Busca tu usuario
4. Ve a Table Editor > profiles
5. Verifica que tu usuario tenga `role = 'admin'`
6. Si no lo tiene, actualízalo manualmente:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = 'TU_USER_ID';
   ```

### Problema: Al hacer clic en "Guardar" aparece un error

**Posibles causas:**

1. **"Sesión expirada"**
   - Cierra sesión y vuelve a iniciar sesión

2. **"No autorizado"**
   - Verifica que tu usuario tenga rol de admin (ver arriba)

3. **Error de red**
   - Verifica tu conexión a internet
   - Abre DevTools > Console para ver errores detallados
   - Abre DevTools > Network para ver la petición fallida

### Problema: Los cambios no persisten después de recargar

**Diagnóstico:**

1. Abre DevTools > Network
2. Filtra por `/api/site-content`
3. Haz un cambio y guarda
4. Verifica la respuesta de la petición PATCH:
   - Si es 200 OK: El problema está en el cache o en la carga
   - Si es error: Lee el mensaje de error

**Solución:**
- Haz hard refresh (Cmd+Shift+R en Mac, Ctrl+Shift+R en Windows)
- Limpia el cache del navegador
- Verifica en Supabase que el dato se guardó

### Problema: La vista previa de imagen no funciona

**Posibles causas:**

1. **URL incorrecta**
   - Verifica que la URL sea válida
   - Prueba abrirla en una pestaña nueva

2. **CORS bloqueado**
   - Algunos servidores bloquean las imágenes por CORS
   - Usa servicios como Unsplash, Imgur, Cloudinary que permiten hotlinking

3. **Imagen muy grande**
   - Si la imagen es muy pesada, puede tardar en cargar
   - Espera unos segundos

## ✅ Checklist Final

Antes de dar por terminada la prueba, verifica:

- [ ] El botón de engrane aparece para admins
- [ ] El modo de edición se activa/desactiva correctamente
- [ ] Todos los elementos editables tienen el borde correcto
- [ ] Los diálogos de edición se abren correctamente
- [ ] Los cambios se guardan en la base de datos
- [ ] Los cambios persisten después de recargar
- [ ] Los usuarios no-admin NO ven el botón
- [ ] Los intentos de edición sin auth son rechazados
- [ ] Las 5 páginas principales funcionan correctamente

## 📊 Reporte de Resultados

Usa esta plantilla para reportar los resultados:

```
## Prueba del Sistema CMS

**Fecha:** [FECHA]
**Navegador:** [Chrome/Firefox/Safari/Edge + versión]
**Usuario probador:** [NOMBRE]

### Resultados

- Botón de engrane: ✅ / ❌
- Modo de edición: ✅ / ❌
- Edición de textos: ✅ / ❌
- Edición de imágenes: ✅ / ❌
- Edición de bloques: ✅ / ❌
- Guardado en BD: ✅ / ❌
- Persistencia: ✅ / ❌
- Seguridad: ✅ / ❌

### Páginas probadas

- Inicio: ✅ / ❌
- Servicios: ✅ / ❌
- Catálogos: ✅ / ❌
- Nosotros: ✅ / ❌
- Contacto: ✅ / ❌

### Problemas encontrados

[Lista de problemas, si los hay]

### Comentarios adicionales

[Comentarios opcionales]
```

## 🎉 ¡Listo!

Si todos los checks están en verde ✅, el sistema CMS está funcionando perfectamente.

¡Felicidades! Ahora puedes editar el contenido de tu sitio de forma visual y sencilla.
