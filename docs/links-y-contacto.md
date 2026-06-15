# Links Externos, Contacto y Datos de la Plataforma

---

## Teléfonos / WhatsApp

| Número | Formato internacional | Dónde se usa |
|---|---|---|
| **55 6791 9161** | +52 55 6791 9161 | Botón flotante WhatsApp (todo el sitio), footer, página de contacto, CTA section |
| 55 4567 8901 | +52 55 4567 8901 | ⚠️ Placeholder en detalle de producto — debe unificarse |
| 55 1234 5678 | +52 1 55 1234 5678 | ⚠️ Placeholder en carrito — debe unificarse |

> **Número oficial:** `+52 55 6791 9161`
> Los otros dos son placeholders que deben corregirse para apuntar al número oficial.

---

## Correos Electrónicos

| Email | Propósito |
|---|---|
| `ad@3abranding.com` | Contacto general (footer, página contacto, CTA) |
| `andrea@3abranding.com` | Notificaciones internas de admin (pedidos, cotizaciones) |
| `factura@3abranding.com` | Facturación y comprobantes de pago |
| `ventas@3abranding.com` | Email remitente de correos salientes (Resend) |
| `noreply@3abranding.com` | Fallback remitente si no hay variable de entorno |
| `operaciones@3abranding.com` | Operaciones (OPS_EMAIL en env) |
| `contacto@3abranding.com` | Mostrado en PDF de cotizaciones |

---

## Redes Sociales

| Red | URL |
|---|---|
| Instagram | https://www.instagram.com/3a_branding/ |
| LinkedIn | https://www.linkedin.com/company/3abranding/ |

---

## Sitio Web

| Concepto | URL |
|---|---|
| Sitio principal | https://www.3abranding.com |
| Panel admin | https://www.3abranding.com/admin |
| Subdominio catálogos | https://catalago.3abranding.com |

---

## Catálogos PDF

Todos alojados en `catalago.3abranding.com`:

| Catálogo | URL completa |
|---|---|
| Chamarras | https://catalago.3abranding.com/wp-content/uploads/2025/07/3A-Chamarras-compressed.pdf |
| Uniformes | https://catalago.3abranding.com/wp-content/uploads/2025/07/3A-Uniformes-compressed.pdf |
| Book Stands | https://catalago.3abranding.com/wp-content/uploads/2025/07/3A_Book-Stands-compressed.pdf |
| Seguridad | https://catalago.3abranding.com/wp-content/uploads/2025/07/3ABranding_catalogo_seguridad_compressed-compressed.pdf |
| Mobiliario Renra | https://catalago.3abranding.com/wp-content/uploads/2025/07/3A-Mobiliario-Renra-compressed.pdf |
| Promocionales 1 | https://catalago.3abranding.com/wp-content/uploads/2025/07/3A-Promocionales-1-compressed.pdf |
| Promocionales 2 | https://catalago.3abranding.com/wp-content/uploads/2025/07/3A-Promocionales-2.pdf-compressed.pdf |
| Promocionales 3 | https://catalago.3abranding.com/wp-content/uploads/2025/07/3A-Promocionales-3-compressed.pdf |
| Promocionales 4 | https://catalago.3abranding.com/wp-content/uploads/2025/07/3A-Promocionales-4-compressed.pdf |
| Reconocimientos | https://catalago.3abranding.com/wp-content/uploads/2025/08/3A-Reconocimientos.pdf |

---

## Imágenes externas (Vercel Blob)

| Imagen | URL |
|---|---|
| Banner home 1920×1080 | https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3A_banners_1920x1080_home-oToT7svMrE6AfsQVeTiTbgZ0cs0LNK.png |
| Banner artículos promocionales | https://hebbkx1anhila5yf.public.blob.vercel-storage.com/banner_articulos_promocionales-8RM2KZLQ6ERPhdMS8A7lI9HuNv5nEK.jpg |

---

## Variables de entorno relacionadas

```env
NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER=+525567919161
NEXT_PUBLIC_SITE_URL=https://3abranding.com
EMAIL_FROM=ventas@3abranding.com
ADMIN_EMAIL=factura@3abranding.com
OPS_EMAIL=operaciones@3abranding.com
```

---

## Pendientes / Inconsistencias detectadas

- [ ] Unificar número de WhatsApp en `app/carrito/page.tsx` (línea 178) al oficial `+52 55 6791 9161`
- [ ] Unificar número de WhatsApp en `app/productos/[id]/page.tsx` (línea 1088) al oficial `+52 55 6791 9161`
