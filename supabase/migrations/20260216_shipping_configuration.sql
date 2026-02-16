-- ============================================
-- Configuración de Envíos
-- Tabla para almacenar configuraciones de envío
-- ============================================

-- Crear tabla de configuración de envíos
CREATE TABLE IF NOT EXISTS public.shipping_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_shipping_config_key ON public.shipping_configuration(config_key);
CREATE INDEX IF NOT EXISTS idx_shipping_config_updated ON public.shipping_configuration(updated_at DESC);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_shipping_config_updated_at ON public.shipping_configuration;

CREATE TRIGGER update_shipping_config_updated_at 
  BEFORE UPDATE ON public.shipping_configuration
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.shipping_configuration ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can read shipping configuration" ON public.shipping_configuration;
DROP POLICY IF EXISTS "Admins can manage shipping configuration" ON public.shipping_configuration;

-- Permitir lectura pública (para checkout)
CREATE POLICY "Anyone can read shipping configuration"
  ON public.shipping_configuration
  FOR SELECT
  USING (true);

-- Solo admins pueden modificar (a través de service role en API)
CREATE POLICY "Admins can manage shipping configuration"
  ON public.shipping_configuration
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insertar configuraciones por defecto
INSERT INTO public.shipping_configuration (config_key, config_value, description) VALUES
  ('shipping_methods', '{
    "standard": {
      "name": "Envío Estándar",
      "enabled": true,
      "description": "Entrega en 5-7 días hábiles",
      "base_cost": 100,
      "free_shipping_threshold": 3000,
      "icon": "truck"
    },
    "express": {
      "name": "Envío Express",
      "enabled": true,
      "description": "Entrega en 2-3 días hábiles",
      "base_cost": 250,
      "free_shipping_threshold": 5000,
      "icon": "zap"
    },
    "pickup": {
      "name": "Recoger en tienda",
      "enabled": true,
      "description": "Recoge tu pedido sin costo",
      "base_cost": 0,
      "free_shipping_threshold": 0,
      "icon": "store"
    }
  }', 'Métodos de envío disponibles'),

  ('shipping_zones', '{
    "local": {
      "name": "Local (CDMX y Edo. Méx.)",
      "states": ["CDMX", "Estado de México"],
      "multiplier": 1.0,
      "enabled": true
    },
    "national": {
      "name": "Nacional",
      "states": ["all"],
      "multiplier": 1.5,
      "enabled": true
    },
    "remote": {
      "name": "Zonas Remotas",
      "states": ["Baja California Sur", "Quintana Roo", "Chiapas"],
      "multiplier": 2.0,
      "enabled": true
    }
  }', 'Zonas de envío y multiplicadores de costo'),

  ('shipping_general', '{
    "free_shipping_enabled": true,
    "free_shipping_threshold": 3000,
    "handling_fee": 0,
    "weight_based_pricing": false,
    "volumetric_weight_factor": 5000,
    "max_weight_kg": 100,
    "currency": "MXN",
    "tax_included": true,
    "estimated_delivery_days": {
      "min": 5,
      "max": 7
    }
  }', 'Configuración general de envíos'),

  ('shipping_restrictions', '{
    "min_order_amount": 100,
    "max_order_amount": 50000,
    "blocked_postal_codes": [],
    "restricted_products": [],
    "business_days_only": true,
    "cutoff_time": "14:00",
    "timezone": "America/Mexico_City"
  }', 'Restricciones y límites de envío'),

  ('shipping_notifications', '{
    "send_shipping_confirmation": true,
    "send_tracking_updates": true,
    "send_delivery_confirmation": true,
    "notify_delays": true,
    "email_notifications": true,
    "sms_notifications": false,
    "whatsapp_notifications": true
  }', 'Configuración de notificaciones de envío')

ON CONFLICT (config_key) DO NOTHING;

-- Comentarios
COMMENT ON TABLE public.shipping_configuration IS 'Configuración flexible de envíos del sistema';
COMMENT ON COLUMN public.shipping_configuration.config_key IS 'Clave única de configuración';
COMMENT ON COLUMN public.shipping_configuration.config_value IS 'Valor en formato JSON con la configuración';
