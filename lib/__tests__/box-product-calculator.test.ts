/**
 * Tests para el calculador de productos por caja
 */

import { describe, it, expect } from '@jest/globals';
import { BoxProductCalculator, ShippingCalculator } from '../box-product-calculator';
import type { BoxProduct } from '../types/box-product';

// Producto de prueba válido
const createValidProduct = (): BoxProduct => ({
  id: 'test_001',
  name: 'Producto Test',
  sku: 'TEST-001',
  box_info: {
    weight_kg: 20,
    pieces_per_box: 10,
    dimensions: {
      length_cm: 40,
      width_cm: 30,
      height_cm: 20
    }
  },
  technical_info: {},
  is_valid: true,
  requires_manual_review: false,
  created_at: new Date(),
  updated_at: new Date(),
  supplier_id: 'sup_001'
});

describe('BoxProductCalculator', () => {
  describe('validateProduct', () => {
    it('valida correctamente un producto válido', () => {
      const product = createValidProduct();
      const validation = BoxProductCalculator.validateProduct(product);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
    
    it('detecta peso de caja inválido', () => {
      const product = createValidProduct();
      product.box_info.weight_kg = 0;
      
      const validation = BoxProductCalculator.validateProduct(product);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Peso de caja inválido o faltante');
    });
    
    it('detecta piezas por caja inválidas', () => {
      const product = createValidProduct();
      product.box_info.pieces_per_box = -5;
      
      const validation = BoxProductCalculator.validateProduct(product);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Piezas por caja inválido o faltante');
    });
    
    it('detecta dimensiones inválidas', () => {
      const product = createValidProduct();
      product.box_info.dimensions.length_cm = 0;
      
      const validation = BoxProductCalculator.validateProduct(product);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Largo de caja inválido o faltante');
    });
  });
  
  describe('calculateUnitWeight', () => {
    it('calcula el peso unitario correctamente', () => {
      const product = createValidProduct();
      const unitWeight = BoxProductCalculator.calculateUnitWeight(product);
      
      expect(unitWeight).toBe(2); // 20kg / 10 piezas = 2kg
    });
    
    it('retorna null para producto inválido', () => {
      const product = createValidProduct();
      product.box_info.weight_kg = 0;
      
      const unitWeight = BoxProductCalculator.calculateUnitWeight(product);
      
      expect(unitWeight).toBeNull();
    });
  });
  
  describe('calculateOrderInfo', () => {
    it('calcula correctamente para cantidad exacta de cajas', () => {
      const product = createValidProduct();
      const orderInfo = BoxProductCalculator.calculateOrderInfo(product, 20);
      
      expect(orderInfo).not.toBeNull();
      expect(orderInfo!.unit_weight_kg).toBe(2);
      expect(orderInfo!.total_weight_kg).toBe(40); // 2kg × 20 unidades
      expect(orderInfo!.boxes_needed).toBe(2); // 20 unidades / 10 por caja
      expect(orderInfo!.is_complete_boxes).toBe(true);
    });
    
    it('calcula correctamente para cantidad no exacta', () => {
      const product = createValidProduct();
      const orderInfo = BoxProductCalculator.calculateOrderInfo(product, 25);
      
      expect(orderInfo).not.toBeNull();
      expect(orderInfo!.total_weight_kg).toBe(50); // 2kg × 25 unidades
      expect(orderInfo!.boxes_needed).toBe(3); // ceil(25 / 10)
      expect(orderInfo!.is_complete_boxes).toBe(false);
    });
    
    it('calcula volumen correctamente', () => {
      const product = createValidProduct();
      const orderInfo = BoxProductCalculator.calculateOrderInfo(product, 10);
      
      // Volumen caja = 40 × 30 × 20 = 24,000 cm³ = 0.024 m³
      expect(orderInfo).not.toBeNull();
      expect(orderInfo!.volume_m3).toBe(0.024);
    });
    
    it('lanza error para cantidad inválida', () => {
      const product = createValidProduct();
      
      expect(() => {
        BoxProductCalculator.calculateOrderInfo(product, 0);
      }).toThrow('La cantidad debe ser mayor a 0');
    });
    
    it('retorna null para producto inválido', () => {
      const product = createValidProduct();
      product.box_info.weight_kg = 0;
      
      const orderInfo = BoxProductCalculator.calculateOrderInfo(product, 10);
      
      expect(orderInfo).toBeNull();
    });
  });
  
  describe('calculateBoxVolume', () => {
    it('calcula el volumen de la caja correctamente', () => {
      const product = createValidProduct();
      const volume = BoxProductCalculator.calculateBoxVolume(product);
      
      // 40 × 30 × 20 = 24,000 cm³ = 0.024 m³
      expect(volume).toBe(0.024);
    });
  });
  
  describe('isCompleteBoxes', () => {
    it('identifica múltiplos exactos', () => {
      expect(BoxProductCalculator.isCompleteBoxes(20, 10)).toBe(true);
      expect(BoxProductCalculator.isCompleteBoxes(30, 10)).toBe(true);
    });
    
    it('identifica no múltiplos', () => {
      expect(BoxProductCalculator.isCompleteBoxes(25, 10)).toBe(false);
      expect(BoxProductCalculator.isCompleteBoxes(13, 10)).toBe(false);
    });
  });
  
  describe('getBoxBreakdown', () => {
    it('calcula desglose correcto para cajas completas', () => {
      const breakdown = BoxProductCalculator.getBoxBreakdown(30, 10);
      
      expect(breakdown.completeBoxes).toBe(3);
      expect(breakdown.loosePieces).toBe(0);
    });
    
    it('calcula desglose correcto con piezas sueltas', () => {
      const breakdown = BoxProductCalculator.getBoxBreakdown(27, 10);
      
      expect(breakdown.completeBoxes).toBe(2);
      expect(breakdown.loosePieces).toBe(7);
    });
  });
});

describe('ShippingCalculator', () => {
  describe('calculateShippingCost', () => {
    it('usa peso real cuando es mayor que volumétrico', () => {
      // Peso real: 100kg
      // Volumen: 0.1 m³ → peso volumétrico: 20kg
      // Debe usar 100kg
      const cost = ShippingCalculator.calculateShippingCost(100, 0.1, 'standard');
      
      expect(cost).toBe(500); // 100kg × 5.0 = 500
    });
    
    it('usa peso volumétrico cuando es mayor que real', () => {
      // Peso real: 10kg
      // Volumen: 0.5 m³ → peso volumétrico: 100kg
      // Debe usar 100kg
      const cost = ShippingCalculator.calculateShippingCost(10, 0.5, 'standard');
      
      expect(cost).toBe(500); // 100kg × 5.0 = 500
    });
    
    it('aplica tarifas diferentes según método de envío', () => {
      const weight = 50;
      const volume = 0.1; // peso volumétrico: 20kg, se usa el real: 50kg
      
      const standardCost = ShippingCalculator.calculateShippingCost(weight, volume, 'standard');
      const expressCost = ShippingCalculator.calculateShippingCost(weight, volume, 'express');
      const freightCost = ShippingCalculator.calculateShippingCost(weight, volume, 'freight');
      
      expect(standardCost).toBe(250); // 50 × 5.0
      expect(expressCost).toBe(425); // 50 × 8.5
      expect(freightCost).toBe(160); // 50 × 3.2
    });
  });
  
  describe('calculateVolumetricWeight', () => {
    it('calcula peso volumétrico correctamente', () => {
      const volumetricWeight = ShippingCalculator.calculateVolumetricWeight(0.5);
      
      expect(volumetricWeight).toBe(100); // 0.5 m³ × 200 = 100kg
    });
  });
});
