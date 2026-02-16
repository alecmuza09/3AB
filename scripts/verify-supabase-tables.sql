-- Script para verificar que las tablas de pedidos existan correctamente
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar que la tabla orders existe
SELECT 
  'orders table' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public')
    THEN '✅ Existe'
    ELSE '❌ NO EXISTE - Ejecuta la migración 20260216_create_orders_tables.sql'
  END as status;

-- 2. Verificar que la tabla order_items existe
SELECT 
  'order_items table' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items' AND table_schema = 'public')
    THEN '✅ Existe'
    ELSE '❌ NO EXISTE - Ejecuta la migración 20260216_create_orders_tables.sql'
  END as status;

-- 3. Verificar columnas de la tabla orders
SELECT 
  'orders columns' as check_type,
  string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_name = 'orders' AND table_schema = 'public'
GROUP BY table_name;

-- 4. Verificar columnas de la tabla order_items
SELECT 
  'order_items columns' as check_type,
  string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_name = 'order_items' AND table_schema = 'public'
GROUP BY table_name;

-- 5. Contar pedidos existentes
SELECT 
  'orders count' as check_type,
  COUNT(*) as total_orders
FROM public.orders;

-- 6. Verificar RLS policies
SELECT 
  'RLS policies' as check_type,
  tablename,
  policyname,
  CASE 
    WHEN cmd = 'SELECT' THEN 'SELECT'
    WHEN cmd = 'INSERT' THEN 'INSERT'
    WHEN cmd = 'UPDATE' THEN 'UPDATE'
    WHEN cmd = 'DELETE' THEN 'DELETE'
    ELSE cmd
  END as operation
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;

-- 7. Verificar que user_id puede ser NULL
SELECT 
  'user_id nullable check' as check_type,
  column_name,
  is_nullable,
  CASE 
    WHEN is_nullable = 'YES' THEN '✅ Puede ser NULL (usuarios sin sesión)'
    ELSE '❌ No puede ser NULL'
  END as status
FROM information_schema.columns
WHERE table_name = 'orders' 
  AND column_name = 'user_id'
  AND table_schema = 'public';
