# Guía del Sistema CMS - 3A Branding

## Introducción

El sistema CMS (Content Management System) permite a los administradores editar contenido de las páginas de manera visual y sencilla, sin necesidad de modificar código.

## Páginas con CMS Habilitado

El sistema CMS está habilitado en las siguientes páginas:

- **Inicio** (`/`)
- **Servicios** (`/servicios`)
- **Catálogos** (`/catalogos`)
- **Nosotros** (`/nosotros`)
- **Contacto** (`/contacto`)

## Cómo Usar el CMS

### 1. Acceso Administrativo

Para usar el CMS, necesitas:
- Estar autenticado como **administrador** en el sistema
- Los usuarios regulares no verán las opciones de edición

### 2. Activar el Modo de Edición

1. Inicia sesión con una cuenta de administrador
2. Verás un **botón de engrane flotante** (⚙️) en la esquina inferior derecha
3. Haz clic en el engrane para **activar el modo de edición**
4. El botón se pondrá **verde** y mostrará un ícono de lápiz cuando esté activo

### 3. Editar Contenido

Una vez activado el modo de edición, verás botones de edición sobre los elementos editables:

#### Editar Textos (Botón Morado)
- Los textos editables mostrarán un **borde morado punteado** al pasar el mouse
- Aparecerá un **botón morado con lápiz** en la esquina
- Haz clic para abrir el diálogo de edición
- Modifica el texto y haz clic en "Guardar"

#### Editar Imágenes (Botón Azul)
- Las imágenes editables mostrarán un **borde azul punteado** al pasar el mouse
- Aparecerá un **botón azul con ícono de imagen** en la esquina
- Haz clic para abrir el diálogo de edición
- Ingresa la URL de la nueva imagen
- Verás una vista previa antes de guardar
- Haz clic en "Guardar"

#### Editar Bloques (Botón Rojo)
- Los bloques editables (con título, descripción y lista) mostrarán un **borde rojo punteado**
- Aparecerá un **botón rojo "Editar bloque"** en la esquina
- Haz clic para editar:
  - Título del bloque
  - Descripción
  - Lista de características (un ítem por línea)
- Haz clic en "Guardar"

### 4. Desactivar el Modo de Edición

1. Haz clic nuevamente en el **botón de engrane** flotante
2. El modo de edición se desactivará
3. Los botones de edición desaparecerán

### 5. Ir al CMS Completo

El botón flotante también incluye un **botón secundario** con ícono de enlace externo que te lleva al panel de administración completo donde puedes:
- Ver todas las páginas y su contenido
- Editar contenido en una interfaz de tabla
- Gestionar múltiples páginas a la vez

## Tipos de Componentes Editables

### 1. EditableText
- **Uso**: Textos simples como títulos, subtítulos, párrafos
- **Color**: Morado
- **Ubicaciones**:
  - Títulos de página
  - Subtítulos
  - Badges y etiquetas
  - Párrafos descriptivos

### 2. EditableImage
- **Uso**: Imágenes y banners
- **Color**: Azul
- **Ubicaciones**:
  - Banner principal de cada página
  - Imagen hero de la página de inicio
  - Imágenes decorativas

### 3. EditableBlock
- **Uso**: Bloques de contenido estructurado
- **Color**: Rojo
- **Ubicaciones**:
  - Tarjetas de servicios
  - Secciones con título, descripción y lista de características

## Consejos y Mejores Prácticas

### Para Imágenes
1. **Formato de URL**: Usa URLs completas (ej: `https://ejemplo.com/imagen.jpg`) o rutas relativas (ej: `/imagen.jpg`)
2. **Tamaño recomendado**: 
   - Banners: 1920x500px mínimo
   - Hero images: 600x500px mínimo
3. **Servicios de alojamiento recomendados**:
   - Imgur
   - Cloudinary
   - Tu propio servidor

### Para Textos
1. **Títulos**: Mantén títulos concisos (5-10 palabras)
2. **Subtítulos**: 15-25 palabras
3. **Descripciones**: 1-3 oraciones

### Para Bloques
1. **Listas**: Escribe un ítem por línea
2. **Características**: Mantén cada punto conciso
3. **Coherencia**: Mantén un estilo consistente en todos los bloques

## Solución de Problemas

### No veo el botón de engrane
- Verifica que hayas iniciado sesión
- Confirma que tu cuenta tenga permisos de administrador
- Recarga la página

### Los cambios no se guardan
- Verifica tu conexión a internet
- Asegúrate de que tu sesión no haya expirado
- Intenta cerrar sesión y volver a iniciar

### La imagen no se muestra
- Verifica que la URL sea correcta
- Confirma que la imagen sea accesible públicamente
- Prueba la URL en una nueva pestaña del navegador

### Error al guardar
- Revisa que todos los campos requeridos estén completos
- Verifica tu conexión a internet
- Contacta al soporte técnico si el problema persiste

## Estructura Técnica

### Base de Datos
El contenido se almacena en la tabla `site_content` de Supabase con la siguiente estructura:
- `page_slug`: Identificador de la página (ej: "home", "servicios")
- `content_key`: Clave del contenido (ej: "title", "hero_image")
- `content_value`: Valor del contenido
- `updated_at`: Fecha de última actualización

### API
- **Endpoint**: `/api/site-content`
- **Métodos**:
  - `GET`: Obtener contenido de una página
  - `PATCH`: Actualizar contenido
- **Autenticación**: Requiere token de Supabase

## Soporte

Si necesitas ayuda o tienes preguntas sobre el sistema CMS:
- Contacta al equipo de desarrollo
- Revisa la documentación técnica en `/docs`
- Consulta los archivos de ejemplo en `/components/editable-*`
