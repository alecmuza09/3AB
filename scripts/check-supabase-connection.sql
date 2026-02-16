-- ============================================
-- VERIFICACIÓN COMPLETA DE SUPABASE
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================

-- 1️⃣ ¿Existen las tablas?
SELECT 
  '1. VERIFICAR TABLAS' as paso,
  table_name,
  CASE 
    WHEN table_name IN ('orders', 'order_items') THEN '✅ EXISTE'
    ELSE '❓ Otra tabla'
  END as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('orders', 'order_items')
ORDER BY table_name;

-- Si este query NO devuelve 2 filas (orders y order_items), 
-- entonces las tablas NO se crearon correctamente.

-- ============================================

-- 2️⃣ ¿Cuántas columnas tienen las tablas?
SELECT 
  '2. COLUMNAS DE ORDERS' as paso,
  COUNT(*) as total_columnas,
  CASE 
    WHEN COUNT(*) >= 15 THEN '✅ Todas las columnas'
    ELSE '❌ FALTAN columnas'
  END as estado
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND table_schema = 'public';

-- Debe mostrar: total_columnas >= 15

-- ============================================

-- 3️⃣ ¿La columna user_id puede ser NULL?
SELECT 
  '3. USER_ID NULLABLE' as paso,
  column_name,
  is_nullable,
  CASE 
    WHEN is_nullable = 'YES' THEN '✅ Puede ser NULL (correcto)'
    ELSE '❌ NO puede ser NULL (ERROR)'
  END as estado
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'user_id'
  AND table_schema = 'public';

-- Debe mostrar: is_nullable = 'YES'

-- ============================================

-- 4️⃣ ¿Están habilitadas las RLS policies?
SELECT 
  '4. RLS POLICIES' as paso,
  tablename,
  COUNT(*) as total_policies,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✅ Policies configuradas'
    ELSE '⚠️ Faltan policies'
  END as estado
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('orders', 'order_items')
GROUP BY tablename
ORDER BY tablename;

-- Debe mostrar 2 filas (orders con 2+ policies, order_items con 2+ policies)

-- ============================================

-- 5️⃣ ¿Puedo insertar un pedido de prueba?
-- Este INSERT debe funcionar:

INSERT INTO public.orders (
  order_number,
  status,
  total,
  subtotal,
  tax,
  shipping_cost,
  payment_method,
  contact_info,
  user_id
) VALUES (
  'TEST-' || NOW()::text,
  'pending',
  100.00,
  80.00,
  12.80,
  7.20,
  'test',
  '{"name": "Test User", "email": "test@test.com"}'::jsonb,
  NULL  -- Usuario sin sesión
)
RETURNING 
  '5. TEST INSERT' as paso,
  order_number,
  '✅ INSERT funcionó' as estado;

-- Si este INSERT falla, copia el error exacto.

-- ============================================

-- 6️⃣ ¿Cuántos pedidos hay en total?
SELECT 
  '6. TOTAL PEDIDOS' as paso,
  COUNT(*) as total_pedidos,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Hay pedidos'
    ELSE '⚠️ No hay pedidos aún'
  END as estado
FROM public.orders;

-- ============================================
-- RESULTADO ESPERADO:
-- Si todos los pasos muestran ✅, las tablas están OK
-- Si alguno muestra ❌, copia ese error específico
-- ============================================
