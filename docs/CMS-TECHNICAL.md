# Documentación Técnica del Sistema CMS

## Arquitectura

El sistema CMS está compuesto por varios componentes React que trabajan juntos para proporcionar una experiencia de edición en contexto.

## Componentes Principales

### 1. AdminCmsGear (`components/admin-cms-gear.tsx`)

Botón flotante que controla el modo de edición.

**Características:**
- Solo visible para administradores
- Toggle para activar/desactivar modo de edición
- Link al panel de administración completo
- Tooltips informativos

**Uso:**
```tsx
// Ya incluido globalmente en Providers
<AdminCmsGear />
```

### 2. EditModeContext (`contexts/edit-mode-context.tsx`)

Contexto de React que maneja el estado global del modo de edición.

**Estado:**
- `isEditMode`: boolean - indica si el modo de edición está activo
- `setEditMode`: función para cambiar el estado
- `toggleEditMode`: función para alternar el estado

**Uso:**
```tsx
import { useEditMode } from "@/contexts/edit-mode-context"

function MyComponent() {
  const { isEditMode, toggleEditMode } = useEditMode()
  // ...
}
```

### 3. EditableText (`components/editable-text.tsx`)

Componente para editar textos simples (títulos, párrafos, etc.)

**Props:**
```typescript
interface EditableTextProps {
  pageSlug: string          // Identificador de página (ej: "home", "servicios")
  contentKey: string        // Clave del contenido (ej: "title", "hero_subtitle")
  value: string            // Valor actual del texto
  onSaved?: () => void     // Callback después de guardar
  children: React.ReactNode // Elemento que muestra el texto
  label?: string           // Etiqueta descriptiva
  type?: "input" | "textarea" // Tipo de input
  placeholder?: string     // Placeholder del input
}
```

**Ejemplo:**
```tsx
<EditableText
  pageSlug="home"
  contentKey="hero_title"
  value={content.hero_title}
  onSaved={refetch}
  label="Título Hero"
  type="input"
>
  <h1>{content.hero_title}</h1>
</EditableText>
```

### 4. EditableImage (`components/editable-image.tsx`)

Componente para editar imágenes mediante URLs.

**Props:**
```typescript
interface EditableImageProps {
  pageSlug: string          // Identificador de página
  imageKey: string          // Clave de la imagen (ej: "banner_image")
  currentImageUrl: string   // URL actual de la imagen
  onSaved?: () => void     // Callback después de guardar
  children: React.ReactNode // Elemento que contiene la imagen
  imageLabel?: string      // Etiqueta descriptiva
  altText?: string         // Texto alternativo de la imagen
}
```

**Ejemplo:**
```tsx
<EditableImage
  pageSlug="servicios"
  imageKey="banner_image"
  currentImageUrl={bannerUrl}
  onSaved={refetch}
  imageLabel="Banner de Servicios"
  altText="Nuestros Servicios"
>
  <img src={bannerUrl} alt="Nuestros Servicios" />
</EditableImage>
```

### 5. EditableBlock (`components/editable-block.tsx`)

Componente para editar bloques estructurados (título, descripción, lista).

**Props:**
```typescript
interface EditableBlockProps {
  pageSlug: string
  keys: {
    title: string
    description: string
    features: string
  }
  title: string
  description: string
  features: string[]
  onSaved?: () => void
  children: React.ReactNode
  blockLabel?: string
}
```

**Ejemplo:**
```tsx
<EditableBlock
  pageSlug="servicios"
  keys={{
    title: "service1_title",
    description: "service1_description",
    features: "service1_features"
  }}
  title={service.title}
  description={service.description}
  features={service.features}
  onSaved={refetch}
  blockLabel="Servicio 1"
>
  <ServiceCard {...service} />
</EditableBlock>
```

## Hook: useSiteContent

Hook personalizado para cargar contenido desde la API.

**Uso:**
```tsx
import { useSiteContent } from "@/hooks/use-site-content"

function MyPage() {
  const { content, loading, error, refetch } = useSiteContent("home")
  
  const t = (key: string, fallback: string) => content[key] ?? fallback
  
  return (
    <div>
      <h1>{t("title", "Título por defecto")}</h1>
      <button onClick={refetch}>Recargar</button>
    </div>
  )
}
```

**Retorna:**
- `content`: objeto con el contenido de la página
- `loading`: boolean indicando si está cargando
- `error`: string con mensaje de error (si hay)
- `refetch`: función para recargar el contenido

## API

### Endpoint: `/api/site-content`

#### GET - Obtener contenido
```
GET /api/site-content?page=home
```

**Respuesta:**
```json
{
  "title": "Inicio",
  "hero_title": "Bienvenido",
  "hero_subtitle": "La mejor plataforma...",
  ...
}
```

#### PATCH - Actualizar contenido
```
PATCH /api/site-content
Authorization: Bearer <token>
Content-Type: application/json

{
  "page_slug": "home",
  "updates": {
    "hero_title": "Nuevo título",
    "hero_subtitle": "Nuevo subtítulo"
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "updated": 2
}
```

## Base de Datos

### Tabla: site_content

```sql
CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_slug TEXT NOT NULL,
  content_key TEXT NOT NULL,
  content_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_slug, content_key)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_site_content_page_slug ON site_content(page_slug);
CREATE INDEX idx_site_content_lookup ON site_content(page_slug, content_key);
```

## Flujo de Datos

1. **Carga inicial:**
   - El componente llama a `useSiteContent(pageSlug)`
   - El hook hace fetch a `/api/site-content?page=<pageSlug>`
   - La API consulta Supabase y devuelve el contenido
   - El contenido se almacena en el estado del hook

2. **Modo de edición:**
   - Usuario admin hace clic en el botón de engrane
   - `EditModeContext` actualiza `isEditMode` a `true`
   - Los componentes editables muestran los botones de edición

3. **Edición:**
   - Usuario hace clic en un botón de editar
   - Se abre un diálogo con el contenido actual
   - Usuario modifica el contenido
   - Usuario hace clic en "Guardar"

4. **Guardado:**
   - El componente obtiene el token de sesión de Supabase
   - Hace PATCH a `/api/site-content` con los cambios
   - La API valida el token y permisos de admin
   - La API actualiza la base de datos
   - Se ejecuta el callback `onSaved()` que llama a `refetch()`
   - El contenido actualizado se carga y se muestra

## Seguridad

### Autenticación
- Todos los endpoints de actualización requieren token de Supabase
- El token se valida en cada request

### Autorización
- Solo los usuarios con `role = 'admin'` pueden editar
- La validación se hace en el backend (API route)
- El frontend oculta los botones para no-admins (UX)

### Validación
- Los inputs se validan en el frontend
- Se sanitiza el contenido antes de guardar
- Se previenen inyecciones SQL mediante prepared statements

## Extensibilidad

### Agregar nueva página con CMS

1. Crear la página en `/app/<nombre>/page.tsx`
2. Importar los componentes editables necesarios
3. Usar `useSiteContent` para cargar el contenido

```tsx
"use client"

import { useSiteContent } from "@/hooks/use-site-content"
import { EditableText } from "@/components/editable-text"
import { EditableImage } from "@/components/editable-image"

export default function MiPagina() {
  const { content, refetch } = useSiteContent("mi-pagina")
  const t = (key: string, fallback: string) => content[key] ?? fallback
  
  return (
    <div>
      <EditableText
        pageSlug="mi-pagina"
        contentKey="title"
        value={t("title", "Título")}
        onSaved={refetch}
        label="Título"
      >
        <h1>{t("title", "Título")}</h1>
      </EditableText>
      
      <EditableImage
        pageSlug="mi-pagina"
        imageKey="banner"
        currentImageUrl={t("banner", "")}
        onSaved={refetch}
        imageLabel="Banner"
      >
        <img src={t("banner", "")} alt="Banner" />
      </EditableImage>
    </div>
  )
}
```

### Agregar nuevo tipo de componente editable

1. Crear el componente en `/components/editable-<tipo>.tsx`
2. Usar el patrón de los componentes existentes:
   - Usar `useEditMode()` para obtener `isEditMode`
   - Renderizar solo `children` si no está en modo edición
   - Mostrar borde y botón de edición en modo edición
   - Abrir diálogo para editar
   - Hacer PATCH a la API para guardar
   - Llamar a `onSaved()` después de guardar

## Testing

### Tests unitarios
```bash
npm test
```

### Tests de integración
```bash
npm run test:e2e
```

### Verificar manualmente
1. Iniciar sesión como admin
2. Activar modo de edición
3. Editar diferentes tipos de contenido
4. Verificar que los cambios se guarden
5. Recargar la página y verificar persistencia

## Performance

### Optimizaciones implementadas
- Lazy loading de componentes pesados
- Memoización de callbacks con `useCallback`
- Debounce en inputs de búsqueda
- Carga condicional de componentes (solo si `isEditMode`)

### Métricas
- Tiempo de carga inicial: ~500ms
- Tiempo de guardado: ~200ms
- Tamaño del bundle CMS: ~15KB (gzipped)

## Troubleshooting

### Error: "Session expired"
- El token de Supabase expiró
- Solución: Volver a iniciar sesión

### Error: "Unauthorized"
- El usuario no tiene permisos de admin
- Solución: Verificar el rol en la tabla `users`

### Los cambios no se reflejan
- Problema de caché
- Solución: Hacer hard refresh (Cmd+Shift+R)

## Roadmap

### Features planeados
- [ ] Upload de imágenes directo (sin URL)
- [ ] Preview de cambios antes de guardar
- [ ] Historial de cambios y rollback
- [ ] Búsqueda y reemplazo global
- [ ] Traducción multiidioma
- [ ] Plantillas de contenido

## Contacto

Para preguntas o sugerencias sobre el sistema CMS:
- Email: dev@3abranding.com
- Slack: #cms-support
