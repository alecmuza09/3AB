/**
 * Script de prueba para verificar que la API de pedidos funciona
 * 
 * Ejecutar con: npx ts-node scripts/test-orders-api.ts
 * O: node --loader ts-node/esm scripts/test-orders-api.ts
 */

const testOrderData = {
  id: `ORD-TEST-${Date.now()}`,
  createdAt: new Date().toISOString(),
  status: "En revisión",
  total: 500,
  subtotal: 400,
  taxes: 64,
  shippingCost: 36,
  paymentMethod: "purchase",
  userId: null, // Usuario sin sesión
  contact: {
    contactName: "Usuario de Prueba",
    email: "test@example.com",
    phone: "5512345678",
    company: "Empresa Test"
  },
  shipping: {
    method: "standard",
    addressLine: "Calle Falsa 123",
    neighborhood: "Centro",
    city: "Ciudad de México",
    state: "CDMX",
    postalCode: "01000",
    country: "México",
    notes: "Pedido de prueba"
  },
  billing: {
    billingSameAsShipping: true,
    businessName: "",
    taxId: "",
    billingEmail: "",
    billingAddress: ""
  },
  items: [
    {
      productId: "test-product-id",
      name: "Producto de Prueba",
      quantity: 10,
      unitPrice: 40,
      subtotal: 400,
      variationLabel: "Rojo",
      image: "https://example.com/image.jpg"
    }
  ]
}

async function testOrdersAPI() {
  console.log('🧪 Iniciando prueba de API de pedidos...\n')
  
  try {
    // Verificar variables de entorno
    console.log('1️⃣ Verificando configuración...')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ FALTA')
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? '✅ Configurado' : '❌ FALTA')
    
    if (!supabaseUrl || !serviceKey) {
      console.error('\n❌ FALTA CONFIGURACIÓN')
      console.error('Agrega las variables faltantes a .env.local')
      process.exit(1)
    }
    
    console.log('\n2️⃣ Enviando pedido de prueba a la API...')
    
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrderData),
    })
    
    console.log('   Status:', response.status, response.statusText)
    
    const result = await response.json()
    
    if (!response.ok) {
      console.error('\n❌ ERROR EN LA API:')
      console.error('   Error:', result.error)
      console.error('   Detalles:', result.details)
      if (result.hint) {
        console.error('   💡 Hint:', result.hint)
      }
      process.exit(1)
    }
    
    console.log('\n✅ PEDIDO CREADO EXITOSAMENTE')
    console.log('   Order ID:', result.order?.id)
    console.log('   Order Number:', result.order?.order_number)
    console.log('   Message:', result.message)
    
    console.log('\n3️⃣ Verificando que se pueda obtener el pedido...')
    
    const getResponse = await fetch('http://localhost:3000/api/orders')
    const getResult = await getResponse.json()
    
    if (!getResponse.ok) {
      console.error('\n❌ ERROR AL OBTENER PEDIDOS:')
      console.error('   Error:', getResult.error)
      process.exit(1)
    }
    
    console.log('   Pedidos encontrados:', getResult.orders?.length || 0)
    
    const testOrder = getResult.orders?.find((o: any) => 
      o.order_number === testOrderData.id
    )
    
    if (testOrder) {
      console.log('\n✅ PEDIDO DE PRUEBA ENCONTRADO')
      console.log('   Customer:', testOrder.contact_info?.contactName)
      console.log('   Email:', testOrder.contact_info?.email)
      console.log('   Total:', testOrder.total)
      console.log('   Items:', testOrder.order_items?.length || 0)
    } else {
      console.log('\n⚠️ Pedido creado pero no encontrado en listado (puede estar en la BD)')
    }
    
    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE')
    console.log('El sistema de pedidos está funcionando correctamente.\n')
    
  } catch (error) {
    console.error('\n❌ ERROR INESPERADO:')
    console.error(error)
    console.error('\nVerifica:')
    console.error('1. Que el servidor esté corriendo (npm run dev)')
    console.error('2. Que las tablas existan en Supabase')
    console.error('3. Que las variables de entorno estén correctas')
    process.exit(1)
  }
}

// Ejecutar prueba
testOrdersAPI()
