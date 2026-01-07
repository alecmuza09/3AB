# 👤 Crear Usuario Administrador

Este documento explica cómo crear el usuario administrador `alecmuza09@gmail.com` en Supabase.

## 📋 Pasos para Crear el Usuario

### Opción 1: Desde el Dashboard de Supabase (Recomendado)

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto: **3ABranding**
3. En el menú lateral, ve a **Authentication** > **Users**
4. Haz clic en **Add User** > **Create new user**
5. Completa el formulario:
   - **Email**: `alecmuza09@gmail.com`
   - **Password**: `alecmuza09`
   - **Auto Confirm User**: ✅ (marca esta casilla)
6. Haz clic en **Create User**

### Opción 2: Desde la Aplicación

1. Abre la aplicación en http://localhost:3000
2. Haz clic en **Iniciar Sesión**
3. Si no tienes cuenta, haz clic en **Registrarse** (o crea un componente de registro)
4. Regístrate con:
   - Email: `alecmuza09@gmail.com`
   - Contraseña: `alecmuza09`

## 🔐 Asignar Rol de Administrador

Después de crear el usuario, necesitas asignarle el rol de administrador:

### Método 1: SQL Editor (Recomendado)

1. Ve a **SQL Editor** en Supabase
2. Ejecuta el siguiente script:

```sql
-- Obtener el ID del usuario
SELECT id, email FROM auth.users WHERE email = 'alecmuza09@gmail.com';

-- Actualizar o crear el perfil como administrador
INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, 'Alec Muza', 'admin'
FROM auth.users
WHERE email = 'alecmuza09@gmail.com'
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  full_name = 'Alec Muza',
  email = 'alecmuza09@gmail.com';
```

### Método 2: Table Editor

1. Ve a **Table Editor** > **profiles**
2. Busca el usuario con email `alecmuza09@gmail.com`
3. Si no existe, crea un nuevo registro:
   - **id**: (copia el ID del usuario de auth.users)
   - **email**: `alecmuza09@gmail.com`
   - **full_name**: `Alec Muza`
   - **role**: `admin`
4. Si ya existe, edita el campo **role** y cámbialo a `admin`

## ✅ Verificar

Para verificar que el usuario fue creado correctamente:

1. Inicia sesión en la aplicación con:
   - Email: `alecmuza09@gmail.com`
   - Contraseña: `alecmuza09`

2. Deberías ver:
   - Un badge "A" en el icono de usuario (indicando administrador)
   - La opción "Administración" visible en el sidebar
   - El botón de "Configuración del Cotizador" visible en la página del cotizador
   - Acceso al panel de administración en `/admin`

## 🔍 Consulta de Verificación

Ejecuta esta consulta en el SQL Editor para verificar:

```sql
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  au.email_confirmed_at,
  p.created_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.email = 'alecmuza09@gmail.com';
```

Deberías ver:
- `role` = `admin`
- `email_confirmed_at` no nulo (si confirmaste el email)

## 🐛 Solución de Problemas

### El usuario no puede iniciar sesión

1. Verifica que el email esté confirmado en **Authentication** > **Users**
2. Si no está confirmado, haz clic en los tres puntos del usuario y selecciona **Send password reset** o **Confirm email**

### El usuario no tiene permisos de administrador

1. Verifica que el perfil exista en la tabla `profiles`
2. Verifica que el campo `role` sea exactamente `admin` (en minúsculas)
3. Ejecuta el script SQL de actualización nuevamente

### El perfil no se crea automáticamente

Si el perfil no se crea automáticamente al registrarse, puedes crearlo manualmente:

```sql
-- Primero obtén el ID del usuario
SELECT id FROM auth.users WHERE email = 'alecmuza09@gmail.com';

-- Luego crea el perfil (reemplaza USER_ID con el ID obtenido)
INSERT INTO profiles (id, email, full_name, role)
VALUES ('USER_ID', 'alecmuza09@gmail.com', 'Alec Muza', 'admin');
```

