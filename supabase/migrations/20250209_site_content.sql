-- ============================================
-- CMS: Contenido editable del sitio (textos, imágenes)
-- ============================================
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'html')),
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_slug, section_key)
);

CREATE INDEX IF NOT EXISTS idx_site_content_page ON site_content(page_slug);

-- Permitir lectura pública para que el front muestre el contenido
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site content"
  ON site_content FOR SELECT
  USING (true);

-- Solo admins pueden insertar/actualizar (vía service role o API con verificación)
CREATE POLICY "Admins can manage site content"
  ON site_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

COMMENT ON TABLE site_content IS 'Contenido editable del sitio (CMS): textos e imágenes por página y sección';
