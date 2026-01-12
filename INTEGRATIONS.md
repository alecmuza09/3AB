# 🔌 Guía de Integraciones - 3A Branding

Esta guía te ayudará a configurar todas las integraciones necesarias para que la plataforma funcione completamente.

## 📋 Índice

- [Requisitos Previos](#requisitos-previos)
- [Configuración Básica](#configuración-básica)
- [Integraciones Requeridas](#integraciones-requeridas)
- [Integraciones Opcionales](#integraciones-opcionales)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🛠️ Requisitos Previos

1. Node.js 18+ instalado
2. Cuenta en cada servicio que desees integrar
3. Acceso al panel de administración de 3A Branding

## ⚙️ Configuración Básica

1. **Copia el archivo de ejemplo:**
   ```bash
   cp env.example .env.local
   ```

2. **Completa las variables de entorno** en `.env.local` con tus credenciales

3. **Reinicia el servidor de desarrollo:**
   ```bash
   pnpm dev
   ```

---

## 🔴 Integraciones Requeridas

### 1. 📦 YoloEnvio (Gestión de Envíos)

**¿Por qué es necesario?** Para gestionar y rastrear todos los envíos de productos.

**Pasos:**

1. Regístrate en [https://yoloenvio.com/](https://yoloenvio.com/)
2. Obtén tus credenciales API desde el dashboard
3. Agrega las variables a `.env.local`:
   ```env
   YOLOENVIO_API_KEY=tu-api-key
   YOLOENVIO_API_SECRET=tu-api-secret
   YOLOENVIO_WEBHOOK_SECRET=tu-webhook-secret
   YOLOENVIO_MODE=sandbox  # cambiar a 'production' para producción
   ```

**Documentación:** [https://docs.yoloenvio.com/](https://docs.yoloenvio.com/)

---

### 2. 💳 Mercado Pago (Pagos México)

**¿Por qué es necesario?** Principal método de pago para clientes mexicanos.

**Pasos:**

1. Regístrate en [https://www.mercadopago.com.mx/](https://www.mercadopago.com.mx/)
2. Ve a Desarrolladores > Credenciales
3. Copia tus credenciales de prueba y producción
4. Agrega a `.env.local`:
   ```env
   NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-...
   MERCADOPAGO_ACCESS_TOKEN=TEST-...
   MERCADOPAGO_WEBHOOK_SECRET=tu-webhook-secret
   ```

**Documentación:** [https://www.mercadopago.com.mx/developers](https://www.mercadopago.com.mx/developers)

---

### 3. 📧 Resend (Emails)

**¿Por qué es necesario?** Para enviar confirmaciones de pedido, cotizaciones, etc.

**Pasos:**

1. Regístrate en [https://resend.com/](https://resend.com/)
2. Crea una API Key
3. Verifica tu dominio (opcional pero recomendado)
4. Agrega a `.env.local`:
   ```env
   RESEND_API_KEY=re_...
   EMAIL_FROM=ventas@3abranding.com
   ```

**Documentación:** [https://resend.com/docs](https://resend.com/docs)

---

### 4. 🖼️ Cloudinary (Almacenamiento de Imágenes)

**¿Por qué es necesario?** Para subir y optimizar imágenes de productos.

**Pasos:**

1. Regístrate en [https://cloudinary.com/](https://cloudinary.com/)
2. Obtén tus credenciales del dashboard
3. Agrega a `.env.local`:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud-name
   CLOUDINARY_API_KEY=tu-api-key
   CLOUDINARY_API_SECRET=tu-api-secret
   ```

**Documentación:** [https://cloudinary.com/documentation](https://cloudinary.com/documentation)

---

### 5. 🧾 Facturapi (Facturación Electrónica SAT)

**¿Por qué es necesario?** Para generar facturas electrónicas válidas en México.

**Pasos:**

1. Regístrate en [https://www.facturapi.io/](https://www.facturapi.io/)
2. Completa tus datos fiscales
3. Obtén tus API Keys
4. Agrega a `.env.local`:
   ```env
   FACTURAPI_SECRET_KEY=sk_test_...
   FACTURAPI_PUBLIC_KEY=pk_test_...
   ```

**Documentación:** [https://www.facturapi.io/docs](https://www.facturapi.io/docs)

---

## 🟡 Integraciones Opcionales

### 6. 💎 Stripe (Pagos Internacionales)

**¿Cuándo usar?** Si tienes clientes internacionales o necesitas pagos con tarjeta.

**Pasos:**

1. Regístrate en [https://stripe.com/](https://stripe.com/)
2. Obtén tus claves API
3. Configura webhooks
4. Agrega a `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

### 7. 💵 PayPal (Pagos Alternativos)

**Pasos:**

1. Regístrate en [https://developer.paypal.com/](https://developer.paypal.com/)
2. Crea una app
3. Agrega a `.env.local`:
   ```env
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=tu-client-id
   PAYPAL_CLIENT_SECRET=tu-client-secret
   PAYPAL_MODE=sandbox
   ```

---

### 8. 💬 WhatsApp Business API

**¿Cuándo usar?** Para notificaciones automáticas por WhatsApp.

**Pasos:**

1. Regístrate en Meta Business Suite
2. Configura WhatsApp Business API
3. Agrega a `.env.local`:
   ```env
   WHATSAPP_PHONE_NUMBER=+525512345678
   WHATSAPP_BUSINESS_API_KEY=tu-api-key
   ```

---

### 9. 📊 Google Analytics

**Pasos:**

1. Crea una propiedad en [https://analytics.google.com/](https://analytics.google.com/)
2. Obtén tu Measurement ID
3. Agrega a `.env.local`:
   ```env
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

---

## 🧪 Testing

### Modo Sandbox/Test

Todas las integraciones tienen modos de prueba:

- **YoloEnvio:** `YOLOENVIO_MODE=sandbox`
- **Mercado Pago:** Usa credenciales `TEST-...`
- **Stripe:** Usa claves `pk_test_...` y `sk_test_...`
- **PayPal:** `PAYPAL_MODE=sandbox`

### Verificar Estado de Integraciones

1. Ve al panel de administración
2. Navega a la pestaña "Integraciones"
3. Revisa el estado de cada integración (verde = activa, amarillo = requerida pero inactiva)

---

## 🚨 Troubleshooting

### Problema: "Integración no activa"

**Solución:**
1. Verifica que las variables de entorno estén en `.env.local`
2. Reinicia el servidor de desarrollo
3. Revisa los logs en la consola

### Problema: "Error de autenticación"

**Solución:**
1. Verifica que las credenciales sean correctas
2. Asegúrate de estar usando el modo correcto (sandbox/production)
3. Revisa que las claves no tengan espacios al inicio/final

### Problema: "Webhooks no funcionan"

**Solución:**
1. En desarrollo, usa ngrok o similar para exponer tu localhost
2. Configura los webhooks en cada plataforma apuntando a tu dominio
3. Verifica que los secrets de webhook coincidan

---

## 📞 Soporte

Si necesitas ayuda adicional:

- **Email:** soporte@3abranding.com
- **Documentación:** Revisa la carpeta `/docs` del proyecto
- **Issues:** Crea un issue en el repositorio

---

## 📝 Checklist de Producción

Antes de ir a producción, asegúrate de:

- [ ] Cambiar todas las credenciales a modo producción
- [ ] Configurar webhooks en cada plataforma
- [ ] Verificar que todos los servicios requeridos estén activos
- [ ] Probar un flujo completo: pedido → pago → envío → factura
- [ ] Configurar monitoreo y alertas
- [ ] Backup de variables de entorno en lugar seguro
- [ ] Configurar límites de rate limiting
- [ ] Revisar configuración de CORS y seguridad

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0.0









