-- ============================================
-- Crear Usuario Administrador
-- ============================================
-- Este script crea el usuario administrador en Supabase
-- Ejecuta este script en el SQL Editor de Supabase DESPUÉS de crear las tablas
-- ============================================

-- Nota: Primero necesitas crear el usuario desde el Dashboard de Supabase Auth
-- o usar la función de registro. Luego ejecuta este script para actualizar el perfil.

-- Opción 1: Si el usuario ya existe en auth.users, actualiza su perfil
UPDATE profiles
SET 
  role = 'admin',
  full_name = 'Alec Muza',
  email = 'alecmuza09@gmail.com'
WHERE email = 'alecmuza09@gmail.com';

-- Si el perfil no existe, créalo (necesitas el ID del usuario de auth.users)
-- Reemplaza 'USER_ID_AQUI' con el ID real del usuario de auth.users
-- Puedes obtenerlo ejecutando: SELECT id FROM auth.users WHERE email = 'alecmuza09@gmail.com';

-- INSERT INTO profiles (id, email, full_name, role)
-- SELECT id, email, 'Alec Muza', 'admin'
-- FROM auth.users
-- WHERE email = 'alecmuza09@gmail.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- ============================================
-- Verificar que el usuario fue creado correctamente
-- ============================================
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at
FROM profiles p
WHERE p.email = 'alecmuza09@gmail.com';


