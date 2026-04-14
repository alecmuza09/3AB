-- ============================================
-- Migración: tabla customizations + ajuste quotation_items
-- Fecha: 2026-04-14
-- ============================================

-- ============================================
-- TABLA: customizations
-- Almacena propuestas de personalización de productos
-- ============================================
CREATE TABLE IF NOT EXISTS customizations (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  variation_id    UUID REFERENCES product_variations(id) ON DELETE SET NULL,
  customization_data JSONB NOT NULL DEFAULT '{}',
  preview_image_url  TEXT,
  is_template     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customizations_user_id_idx ON customizations (user_id);
CREATE INDEX IF NOT EXISTS customizations_product_id_idx ON customizations (product_id);

-- RLS: cada usuario solo ve sus propias propuestas
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customizations"
  ON customizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customizations"
  ON customizations FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own customizations"
  ON customizations FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypasses RLS (ya está cubierto por el cliente service role)

-- ============================================
-- AJUSTE: quotation_items.product_id a nullable
-- Permite guardar ítems de cotización B2B sin FK obligatoria
-- ============================================
ALTER TABLE IF EXISTS quotation_items
  ALTER COLUMN product_id DROP NOT NULL;

-- ============================================
-- TABLA: quotations (si no existe aún)
-- ============================================
CREATE TABLE IF NOT EXISTS quotations (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_number  TEXT NOT NULL UNIQUE,
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','sent','accepted','rejected','expired','under_review')),
  valid_until       DATE,
  subtotal          NUMERIC(10,2) NOT NULL DEFAULT 0,
  taxes             NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_cost     NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  total             NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'MXN',
  contact_info      JSONB DEFAULT '{}',
  shipping_address  TEXT,
  notes             TEXT,
  admin_notes       TEXT,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quotations_user_id_idx ON quotations (user_id);
CREATE INDEX IF NOT EXISTS quotations_status_idx  ON quotations (status);

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quotations"
  ON quotations FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- TABLA: quotation_items (si no existe aún)
-- ============================================
CREATE TABLE IF NOT EXISTS quotation_items (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id    UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,  -- nullable para ítems libres
  variation_id    UUID REFERENCES product_variations(id) ON DELETE SET NULL,
  product_name    TEXT,
  quantity        INTEGER NOT NULL DEFAULT 1,
  unit_price      NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0,
  customization   TEXT,
  image_url       TEXT,
  customization_data JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quotation_items_quotation_id_idx ON quotation_items (quotation_id);

-- ============================================
-- Bucket de Storage para imágenes de personalización
-- (ejecutar solo si el bucket no existe — requiere permisos de Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('customizations', 'customizations', true)
-- ON CONFLICT DO NOTHING;
-- ============================================
