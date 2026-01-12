-- Agregar campo image_url a la tabla products si no existe
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Crear índice para mejorar las consultas
CREATE INDEX IF NOT EXISTS idx_products_image_url ON products(image_url) WHERE image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
