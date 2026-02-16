/**
 * Calculadora de productos por caja
 * 
 * Este módulo maneja toda la lógica de cálculo para productos que se compran
 * por caja pero se venden por unidad individual.
 */

import type {
  BoxProduct,
  OrderItemCalculation,
  ValidationResult,
} from './types/box-product';

export class BoxProductCalculator {
  /**
   * Valida que un producto tenga los datos mínimos necesarios
   */
  static validateProduct(product: BoxProduct): ValidationResult {
    const errors: string[] = [];
    
    // Validar peso de caja
    if (!product.box_info.weight_kg || product.box_info.weight_kg <= 0) {
      errors.push('Peso de caja inválido o faltante');
    }
    
    // Validar piezas por caja
    if (!product.box_info.pieces_per_box || product.box_info.pieces_per_box <= 0) {
      errors.push('Piezas por caja inválido o faltante');
    }
    
    // Validar dimensiones
    const dims = product.box_info.dimensions;
    if (!dims.length_cm || dims.length_cm <= 0) {
      errors.push('Largo de caja inválido o faltante');
    }
    if (!dims.width_cm || dims.width_cm <= 0) {
      errors.push('Ancho de caja inválido o faltante');
    }
    if (!dims.height_cm || dims.height_cm <= 0) {
      errors.push('Alto de caja inválido o faltante');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Calcula el peso unitario del producto
   * 
   * @param product - Producto con información de caja
   * @returns Peso unitario en kg, o null si el producto no es válido
   */
  static calculateUnitWeight(product: BoxProduct): number | null {
    const validation = this.validateProduct(product);
    
    if (!validation.isValid) {
      console.error('Producto inválido:', validation.errors);
      return null;
    }
    
    return product.box_info.weight_kg / product.box_info.pieces_per_box;
  }
  
  /**
   * Calcula información completa de pedido para una cantidad específica
   * 
   * @param product - Producto con información de caja
   * @param quantity - Cantidad de unidades solicitadas
   * @returns Información calculada del pedido, o null si hay errores
   */
  static calculateOrderInfo(
    product: BoxProduct,
    quantity: number
  ): OrderItemCalculation | null {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }
    
    const unitWeight = this.calculateUnitWeight(product);
    
    if (unitWeight === null) {
      return null;
    }
    
    // Cálculos principales
    const totalWeight = unitWeight * quantity;
    const boxesNeeded = Math.ceil(quantity / product.box_info.pieces_per_box);
    const isCompleteBoxes = quantity % product.box_info.pieces_per_box === 0;
    
    // Calcular volumen en m³
    const boxVolumeM3 = (
      product.box_info.dimensions.length_cm *
      product.box_info.dimensions.width_cm *
      product.box_info.dimensions.height_cm
    ) / 1_000_000; // convertir cm³ a m³
    
    const volumeM3 = boxVolumeM3 * boxesNeeded;
    
    return {
      unit_weight_kg: unitWeight,
      total_weight_kg: totalWeight,
      boxes_needed: boxesNeeded,
      is_complete_boxes: isCompleteBoxes,
      volume_m3: volumeM3
    };
  }
  
  /**
   * Calcula el volumen de una caja en metros cúbicos
   */
  static calculateBoxVolume(product: BoxProduct): number {
    return (
      product.box_info.dimensions.length_cm *
      product.box_info.dimensions.width_cm *
      product.box_info.dimensions.height_cm
    ) / 1_000_000; // convertir cm³ a m³
  }
  
  /**
   * Prepara un producto para ser guardado en la base de datos
   * Calcula campos automáticos y valida información
   */
  static prepareProductForDB(rawProduct: Partial<BoxProduct>): BoxProduct {
    const validation = this.validateProduct(rawProduct as BoxProduct);
    
    const product: BoxProduct = {
      ...rawProduct,
      unit_weight_kg: this.calculateUnitWeight(rawProduct as BoxProduct) ?? undefined,
      is_valid: validation.isValid,
      requires_manual_review: !validation.isValid,
      validation_errors: validation.errors.length > 0 ? validation.errors : undefined,
      updated_at: new Date()
    } as BoxProduct;
    
    return product;
  }
  
  /**
   * Verifica si una cantidad es múltiplo exacto de piezas por caja
   */
  static isCompleteBoxes(quantity: number, piecesPerBox: number): boolean {
    return quantity % piecesPerBox === 0;
  }
  
  /**
   * Calcula cuántas cajas completas y piezas sueltas hay en una cantidad
   */
  static getBoxBreakdown(quantity: number, piecesPerBox: number): {
    completeBoxes: number;
    loosePieces: number;
  } {
    return {
      completeBoxes: Math.floor(quantity / piecesPerBox),
      loosePieces: quantity % piecesPerBox
    };
  }
}

/**
 * Calculadora de envío
 */
export class ShippingCalculator {
  /**
   * Calcula el costo de envío basado en peso real y peso volumétrico
   * 
   * Usa el concepto de "peso facturable" que es el mayor entre:
   * - Peso real
   * - Peso volumétrico (volumen × factor de conversión)
   */
  static calculateShippingCost(
    totalWeightKg: number,
    totalVolumeM3: number,
    method: 'standard' | 'express' | 'freight'
  ): number {
    // Peso volumétrico (kg) = volumen (m³) × 200
    // Este factor puede variar según la paquetería
    const volumetricWeightKg = totalVolumeM3 * 200;
    
    // Usar el mayor entre peso real y peso volumétrico
    const chargeableWeight = Math.max(totalWeightKg, volumetricWeightKg);
    
    // Tarifas base por kg (estos valores son ejemplos)
    const rates = {
      standard: 5.0,    // Envío estándar
      express: 8.5,     // Envío express
      freight: 3.2      // Carga/paquetería
    };
    
    return chargeableWeight * rates[method];
  }
  
  /**
   * Calcula el peso volumétrico en kilogramos
   */
  static calculateVolumetricWeight(volumeM3: number): number {
    return volumeM3 * 200; // Factor estándar de conversión
  }
}
