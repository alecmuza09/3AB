'use client';

/**
 * Componentes para mostrar información de productos por caja
 */

import React from 'react';
import type { BoxProduct } from '@/lib/types/box-product';
import { BoxProductCalculator } from '@/lib/box-product-calculator';

interface ProductTechnicalInfoProps {
  product: BoxProduct;
}

/**
 * Muestra toda la información técnica disponible de un producto
 * Solo muestra secciones con datos, oculta las vacías
 */
export function ProductTechnicalInfo({ product }: ProductTechnicalInfoProps) {
  const unitWeight = BoxProductCalculator.calculateUnitWeight(product);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Información Técnica</h2>
      
      {/* Información de empaque */}
      <section className="rounded-lg border p-4">
        <h3 className="mb-3 text-lg font-semibold">Empaque y Presentación</h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Peso por caja</dt>
            <dd className="mt-1 text-base">{product.box_info.weight_kg} kg</dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Unidades por caja</dt>
            <dd className="mt-1 text-base">{product.box_info.pieces_per_box} piezas</dd>
          </div>
          
          {unitWeight && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Peso unitario</dt>
              <dd className="mt-1 text-base">{unitWeight.toFixed(3)} kg</dd>
            </div>
          )}
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Dimensiones de caja</dt>
            <dd className="mt-1 text-base">
              {product.box_info.dimensions.length_cm} ×{' '}
              {product.box_info.dimensions.width_cm} ×{' '}
              {product.box_info.dimensions.height_cm} cm
            </dd>
          </div>
        </dl>
      </section>
      
      {/* Materiales */}
      {product.technical_info.materials && product.technical_info.materials.length > 0 && (
        <section className="rounded-lg border p-4">
          <h3 className="mb-3 text-lg font-semibold">Materiales</h3>
          <ul className="list-inside list-disc space-y-1">
            {product.technical_info.materials.map((material, idx) => (
              <li key={idx} className="text-base">
                {material}
              </li>
            ))}
          </ul>
        </section>
      )}
      
      {/* Especificaciones técnicas */}
      {product.technical_info.specifications && 
       Object.keys(product.technical_info.specifications).length > 0 && (
        <section className="rounded-lg border p-4">
          <h3 className="mb-3 text-lg font-semibold">Especificaciones</h3>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.entries(product.technical_info.specifications).map(([key, value]) => (
              <div key={key}>
                <dt className="text-sm font-medium text-muted-foreground">{key}</dt>
                <dd className="mt-1 text-base">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      
      {/* Descripción del fabricante */}
      {product.technical_info.manufacturer_description && (
        <section className="rounded-lg border p-4">
          <h3 className="mb-3 text-lg font-semibold">Descripción del Fabricante</h3>
          <p className="text-base leading-relaxed">
            {product.technical_info.manufacturer_description}
          </p>
        </section>
      )}
      
      {/* Certificaciones */}
      {product.technical_info.certifications && 
       product.technical_info.certifications.length > 0 && (
        <section className="rounded-lg border p-4">
          <h3 className="mb-3 text-lg font-semibold">Certificaciones</h3>
          <ul className="list-inside list-disc space-y-1">
            {product.technical_info.certifications.map((cert, idx) => (
              <li key={idx} className="text-base">
                {cert}
              </li>
            ))}
          </ul>
        </section>
      )}
      
      {/* Datos adicionales */}
      {product.technical_info.additional_data && 
       Object.keys(product.technical_info.additional_data).length > 0 && (
        <section className="rounded-lg border p-4">
          <h3 className="mb-3 text-lg font-semibold">Información Adicional</h3>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.entries(product.technical_info.additional_data).map(([key, value]) => (
              <div key={key}>
                <dt className="text-sm font-medium text-muted-foreground">{key}</dt>
                <dd className="mt-1 text-base">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      
      {/* Alertas de validación */}
      {product.requires_manual_review && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900">
                Requiere Revisión Manual
              </h4>
              {product.validation_errors && product.validation_errors.length > 0 && (
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-800">
                  {product.validation_errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface OrderCalculatorProps {
  product: BoxProduct;
  initialQuantity?: number;
  onQuantityChange?: (quantity: number) => void;
}

/**
 * Calculadora interactiva de pedidos
 * Muestra en tiempo real los cálculos de peso, cajas y volumen
 */
export function OrderCalculator({ 
  product, 
  initialQuantity = 1,
  onQuantityChange 
}: OrderCalculatorProps) {
  const [quantity, setQuantity] = React.useState(initialQuantity);
  
  const handleQuantityChange = (newQuantity: number) => {
    const validQuantity = Math.max(1, newQuantity);
    setQuantity(validQuantity);
    onQuantityChange?.(validQuantity);
  };
  
  const orderInfo = BoxProductCalculator.calculateOrderInfo(product, quantity);
  const boxBreakdown = BoxProductCalculator.getBoxBreakdown(
    quantity, 
    product.box_info.pieces_per_box
  );
  
  if (!orderInfo) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex gap-3">
          <span className="text-xl">❌</span>
          <div>
            <h4 className="font-semibold text-red-900">Error de Cálculo</h4>
            <p className="mt-1 text-sm text-red-800">
              No se puede calcular el pedido. El producto requiere revisión manual.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="quantity" className="block text-sm font-medium">
          Cantidad de unidades
        </label>
        <input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-base"
        />
      </div>
      
      <div className="rounded-lg border bg-card p-4">
        <h4 className="mb-3 font-semibold">Cálculos del Pedido</h4>
        
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm text-muted-foreground">Peso total:</dt>
            <dd className="font-medium">{orderInfo.total_weight_kg.toFixed(2)} kg</dd>
          </div>
          
          <div className="flex justify-between">
            <dt className="text-sm text-muted-foreground">Cajas necesarias:</dt>
            <dd className="font-medium">
              {orderInfo.boxes_needed}
              {orderInfo.is_complete_boxes && (
                <span className="ml-2 text-sm text-green-600">✓ Completas</span>
              )}
            </dd>
          </div>
          
          {!orderInfo.is_complete_boxes && (
            <div className="flex justify-between text-sm">
              <dt className="text-muted-foreground">Desglose:</dt>
              <dd>
                {boxBreakdown.completeBoxes} {boxBreakdown.completeBoxes === 1 ? 'caja' : 'cajas'} +{' '}
                {boxBreakdown.loosePieces} {boxBreakdown.loosePieces === 1 ? 'pieza' : 'piezas'}
              </dd>
            </div>
          )}
          
          <div className="flex justify-between">
            <dt className="text-sm text-muted-foreground">Volumen total:</dt>
            <dd className="font-medium">{orderInfo.volume_m3.toFixed(4)} m³</dd>
          </div>
        </dl>
        
        {!orderInfo.is_complete_boxes && (
          <div className="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-900">
            <span className="mr-2">ℹ️</span>
            Este pedido incluye una caja parcial
          </div>
        )}
      </div>
    </div>
  );
}
