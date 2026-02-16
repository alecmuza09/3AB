/**
 * Tipos para productos que se compran por caja pero se venden por unidad
 */

export interface BoxInfo {
  /** Peso total de la caja en kilogramos */
  weight_kg: number;
  /** Número de piezas/unidades por caja */
  pieces_per_box: number;
  /** Dimensiones de la caja en centímetros */
  dimensions: {
    length_cm: number;
    width_cm: number;
    height_cm: number;
  };
  /** Precio opcional por caja completa */
  price_per_box?: number;
}

export interface TechnicalInfo {
  /** Lista de materiales del producto */
  materials?: string[];
  /** Especificaciones técnicas en formato clave-valor */
  specifications?: Record<string, any>;
  /** Descripción proporcionada por el fabricante */
  manufacturer_description?: string;
  /** URL a la hoja de datos técnicos */
  datasheet_url?: string;
  /** Certificaciones del producto */
  certifications?: string[];
  /** Datos técnicos adicionales */
  additional_data?: Record<string, any>;
}

export interface BoxProduct {
  id: string;
  name: string;
  sku: string;
  
  /** Información del proveedor (por caja) */
  box_info: BoxInfo;
  
  /** Información técnica del producto */
  technical_info: TechnicalInfo;
  
  /** Peso unitario calculado automáticamente */
  unit_weight_kg?: number;
  
  /** Control de calidad de datos */
  is_valid: boolean;
  /** Indica si requiere revisión manual por datos faltantes */
  requires_manual_review: boolean;
  /** Lista de errores de validación */
  validation_errors?: string[];
  
  /** Metadata */
  created_at: Date;
  updated_at: Date;
  supplier_id: string;
}

export interface OrderItemCalculation {
  /** Peso unitario del producto */
  unit_weight_kg: number;
  /** Peso total para la cantidad solicitada */
  total_weight_kg: number;
  /** Número de cajas necesarias */
  boxes_needed: number;
  /** Indica si son cajas completas (múltiplo exacto) */
  is_complete_boxes: boolean;
  /** Volumen total en metros cúbicos */
  volume_m3: number;
}

export interface OrderItem {
  product_id: string;
  /** Cantidad de unidades solicitadas */
  quantity: number;
  /** Cálculos automáticos para el pedido */
  calculated: OrderItemCalculation;
  /** Precio por unidad */
  price_per_unit: number;
  /** Precio total del ítem */
  total_price: number;
}

export interface ShippingInfo {
  method: 'standard' | 'express' | 'freight';
  estimated_cost: number;
  dimensions_summary: {
    total_boxes: number;
    box_configurations: Array<{
      product_id: string;
      boxes: number;
      dimensions: {
        length_cm: number;
        width_cm: number;
        height_cm: number;
      };
    }>;
  };
}

export interface Order {
  id: string;
  items: OrderItem[];
  
  /** Totales del pedido */
  totals: {
    total_weight_kg: number;
    total_boxes: number;
    total_volume_m3: number;
  };
  
  /** Información de envío */
  shipping: ShippingInfo;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
