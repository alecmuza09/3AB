/**
 * Script de prueba para verificar el guardado del CMS
 * Ejecutar con: npx ts-node scripts/test-cms-save.ts
 */

// Simula un guardado del CMS
async function testCMSSave() {
  console.log("🧪 Iniciando prueba del sistema de guardado CMS...\n")
  
  // 1. Verificar variables de entorno
  console.log("1️⃣ Verificando variables de entorno...")
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ ERROR: Faltan variables de entorno de Supabase")
    console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Configurada" : "❌ Falta")
    console.error("   NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅ Configurada" : "❌ Falta")
    process.exit(1)
  }
  
  console.log("✅ Variables de entorno configuradas\n")
  
  // 2. Verificar endpoint GET
  console.log("2️⃣ Probando endpoint GET /api/site-content...")
  try {
    const getRes = await fetch("http://localhost:3000/api/site-content?page=home")
    const getData = await getRes.json()
    
    if (!getRes.ok) {
      console.error("❌ Error en GET:", getData)
      process.exit(1)
    }
    
    console.log("✅ GET funciona correctamente")
    console.log("   Contenido cargado:", Object.keys(getData).length, "keys")
    console.log("   Ejemplo de keys:", Object.keys(getData).slice(0, 5).join(", "), "...\n")
  } catch (e) {
    console.error("❌ Error al hacer GET:", e)
    console.error("   ¿El servidor está corriendo en http://localhost:3000?")
    process.exit(1)
  }
  
  // 3. Instrucciones para probar PATCH manualmente
  console.log("3️⃣ Para probar el endpoint PATCH (guardado):\n")
  console.log("   a) Inicia sesión como admin en http://localhost:3000")
  console.log("   b) Abre DevTools (F12) > Console")
  console.log("   c) Ejecuta este código:\n")
  console.log(`
   // Obtener el token de sesión
   const { createClient } = require('@supabase/supabase-js')
   const supabase = createClient(
     '${supabaseUrl}',
     '${supabaseAnonKey}'
   )
   
   const session = await supabase.auth.getSession()
   const token = session.data.session?.access_token
   
   if (!token) {
     console.error('❌ No hay sesión activa. Inicia sesión primero.')
   } else {
     console.log('✅ Token obtenido:', token.substring(0, 20) + '...')
     
     // Intentar guardar
     const res = await fetch('/api/site-content', {
       method: 'PATCH',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': 'Bearer ' + token
       },
       body: JSON.stringify({
         page_slug: 'home',
         updates: {
           hero_title_line1: 'PRUEBA DE GUARDADO ' + new Date().toLocaleTimeString()
         }
       })
     })
     
     const data = await res.json()
     console.log('Respuesta:', data)
     
     if (res.ok) {
       console.log('✅ Guardado exitoso!')
     } else {
       console.error('❌ Error:', data.error)
     }
   }
  `)
  
  console.log("\n4️⃣ Verificar en Supabase:")
  console.log("   a) Ve a https://supabase.com/dashboard")
  console.log("   b) Selecciona tu proyecto")
  console.log("   c) Ve a Table Editor > site_content")
  console.log("   d) Busca registros con page_slug = 'home'")
  console.log("   e) Verifica que el campo 'value' tenga tu cambio\n")
  
  console.log("✅ Prueba completada. Sigue los pasos anteriores para probar el guardado manual.")
}

// Ejecutar la prueba
testCMSSave().catch(console.error)
