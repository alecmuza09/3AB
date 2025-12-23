-- ============================================
-- 3A BRANDING - POLÍTICAS RLS (Row Level Security)
-- ============================================
-- Este archivo contiene las políticas de seguridad para proteger los datos
-- Ejecuta este script DESPUÉS de crear las tablas
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Los administradores pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- CATEGORIES
-- ============================================

-- Todos pueden ver categorías activas
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Solo administradores pueden modificar categorías
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- PRODUCTS
-- ============================================

-- Todos pueden ver productos activos
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Solo administradores pueden modificar productos
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- PRODUCT_VARIATIONS
-- ============================================

-- Todos pueden ver variaciones de productos activos
CREATE POLICY "Anyone can view active variations"
  ON product_variations FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_variations.product_id AND is_active = true
    )
  );

-- Solo administradores pueden modificar variaciones
CREATE POLICY "Admins can manage variations"
  ON product_variations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- PRODUCT_IMAGES
-- ============================================

-- Todos pueden ver imágenes de productos activos
CREATE POLICY "Anyone can view product images"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_images.product_id AND is_active = true
    )
  );

-- Solo administradores pueden modificar imágenes
CREATE POLICY "Admins can manage product images"
  ON product_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- ADDRESSES
-- ============================================

-- Los usuarios pueden ver sus propias direcciones
CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden insertar sus propias direcciones
CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias direcciones
CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propias direcciones
CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CART_ITEMS
-- ============================================

-- Los usuarios pueden ver sus propios items del carrito
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden insertar sus propios items del carrito
CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios items del carrito
CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propios items del carrito
CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ORDERS
-- ============================================

-- Los usuarios pueden ver sus propios pedidos
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden crear pedidos para sí mismos
CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios pedidos (solo ciertos campos)
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Los administradores pueden ver todos los pedidos
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Los administradores pueden actualizar todos los pedidos
CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- ORDER_ITEMS
-- ============================================

-- Los usuarios pueden ver items de sus propios pedidos
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

-- Los usuarios pueden insertar items en sus propios pedidos
CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

-- Los administradores pueden ver todos los items de pedidos
CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- QUOTATIONS
-- ============================================

-- Los usuarios pueden ver sus propias cotizaciones
CREATE POLICY "Users can view own quotations"
  ON quotations FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden crear cotizaciones para sí mismos
CREATE POLICY "Users can create own quotations"
  ON quotations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias cotizaciones
CREATE POLICY "Users can update own quotations"
  ON quotations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Los administradores pueden ver todas las cotizaciones
CREATE POLICY "Admins can view all quotations"
  ON quotations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Los administradores pueden actualizar todas las cotizaciones
CREATE POLICY "Admins can update all quotations"
  ON quotations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- QUOTATION_ITEMS
-- ============================================

-- Los usuarios pueden ver items de sus propias cotizaciones
CREATE POLICY "Users can view own quotation items"
  ON quotation_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE id = quotation_items.quotation_id AND user_id = auth.uid()
    )
  );

-- Los usuarios pueden insertar items en sus propias cotizaciones
CREATE POLICY "Users can insert own quotation items"
  ON quotation_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE id = quotation_items.quotation_id AND user_id = auth.uid()
    )
  );

-- Los administradores pueden ver todos los items de cotizaciones
CREATE POLICY "Admins can view all quotation items"
  ON quotation_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- REVIEWS
-- ============================================

-- Todos pueden ver reseñas aprobadas
CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

-- Los usuarios pueden ver sus propias reseñas (incluso si no están aprobadas)
CREATE POLICY "Users can view own reviews"
  ON reviews FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden crear reseñas
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias reseñas
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Los administradores pueden ver todas las reseñas
CREATE POLICY "Admins can view all reviews"
  ON reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Los administradores pueden aprobar/rechazar reseñas
CREATE POLICY "Admins can approve reviews"
  ON reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- CUSTOMIZATIONS
-- ============================================

-- Los usuarios pueden ver sus propias personalizaciones
CREATE POLICY "Users can view own customizations"
  ON customizations FOR SELECT
  USING (auth.uid() = user_id OR is_template = true);

-- Los usuarios pueden crear personalizaciones
CREATE POLICY "Users can create customizations"
  ON customizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias personalizaciones
CREATE POLICY "Users can update own customizations"
  ON customizations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propias personalizaciones
CREATE POLICY "Users can delete own customizations"
  ON customizations FOR DELETE
  USING (auth.uid() = user_id);

-- Los administradores pueden ver todas las personalizaciones
CREATE POLICY "Admins can view all customizations"
  ON customizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
