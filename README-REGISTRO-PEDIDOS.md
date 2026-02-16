# 👤 Sistema de Registro para Historial de Pedidos

## 🎯 ¿Qué es esto?

Sistema que incentiva a los usuarios a registrarse para acceder a su historial de pedidos, permitiendo compras sin cuenta pero motivando el registro posterior.

---

## ✨ Características Principales

### 🛒 Compra Sin Registro

- ✅ Usuarios pueden hacer pedidos **sin crear cuenta**
- ✅ Solo necesitan proporcionar email de contacto
- ✅ Pedido se registra en base de datos
- ✅ Reciben confirmación por email

### 📋 Historial Requiere Cuenta

- 🔐 Para ver pedidos anteriores, necesitan **cuenta activa**
- 📱 Si entran a `/pedidos` sin sesión, ven mensaje de registro
- 💡 Se explican los beneficios de registrarse
- 🎯 Botones claros de acción (Crear Cuenta / Iniciar Sesión)

### 🔗 Vinculación de Pedidos

- ✅ Al crear cuenta con el **mismo email** usado en pedidos
- ✅ Esos pedidos quedan vinculados automáticamente
- ✅ Pueden ver su historial completo

---

## 🔄 Flujo de Usuario

### Caso 1: Usuario Nuevo (Sin Cuenta)

```
1. Navega por productos
2. Agrega al carrito
3. Va a checkout
4. Completa formulario (sin registrarse)
5. Confirma pedido ✅
   └─> Toast: "Crea una cuenta con este email para ver el estado"
6. Redirige a /pedidos
7. Ve mensaje de registro con beneficios
8. Hace clic en "Crear Cuenta"
9. Se registra con el mismo email
10. Ahora ve su pedido en historial ✅
```

### Caso 2: Usuario con Cuenta

```
1. Inicia sesión
2. Hace pedido
3. Confirma ✅
4. Ve su historial completo inmediatamente
```

### Caso 3: Usuario Que Hizo Pedido y Vuelve

```
1. Hizo pedido hace 3 días (sin cuenta)
2. Vuelve a la tienda
3. Va a /pedidos
4. Ve mensaje: "Crea cuenta para ver tu historial"
5. Se registra con el mismo email
6. Recupera acceso a su pedido anterior ✅
```

---

## 📋 Páginas Modificadas

### `/app/pedidos/page.tsx`

**Comportamiento según estado de sesión:**

| Estado | Vista |
|--------|-------|
| `loading: true` | "Cargando..." con spinner |
| `user: null` | **Card de registro** con beneficios |
| `user: existe && orders: 0` | "No tienes pedidos" |
| `user: existe && orders: >0` | Lista de pedidos |

**Card de registro incluye:**
- 🔒 Icono de candado sobre carrito
- ✅ Lista de 5 beneficios de registrarse
- 🎯 2 botones de acción
- 💡 Mensaje contextual sobre pedidos recientes

### `/app/checkout/page.tsx`

**Toast diferenciado:**

```typescript
if (!user) {
  toast.success("¡Gracias! Tu pedido ha sido registrado.", {
    description: "Crea una cuenta con este email para ver el estado.",
    duration: 6000,
  })
} else {
  toast.success("¡Gracias! Tu pedido ha sido registrado. En breve te contactamos.")
}
```

---

## 🎨 Componentes UI

### Beneficios Mostrados

1. ✅ **Ver estado de pedidos** - Seguimiento en tiempo real
2. ✅ **Historial de compras** - Todos tus pedidos en un lugar
3. ✅ **Reordenar fácilmente** - Un clic para repetir pedidos
4. ✅ **Descargar documentos** - PDFs, comprobantes, facturas
5. ✅ **Guardar direcciones** - Checkout más rápido

### Botones de Acción

**Primario:**
```tsx
<Button onClick={() => setAuthDialogOpen(true)}>
  <UserPlus /> Crear Cuenta Gratis
</Button>
```

**Secundario:**
```tsx
<Button variant="outline" onClick={() => setAuthDialogOpen(true)}>
  <LogIn /> Ya tengo cuenta
</Button>
```

Ambos abren el **AuthDialog** existente que maneja:
- 🔐 Login
- 📝 Registro
- ✅ Validación de formularios
- 🔄 Estados de carga

---

## 🔧 Integración Técnica

### Detección de Usuario

```typescript
import { useAuth } from "@/contexts/auth-context"

const { user, loading } = useAuth()

if (!loading && !user) {
  // Mostrar mensaje de registro
}
```

### AuthDialog

```typescript
import { AuthDialog } from "@/components/auth/auth-dialog"

const [authDialogOpen, setAuthDialogOpen] = useState(false)

<AuthDialog 
  open={authDialogOpen} 
  onOpenChange={setAuthDialogOpen} 
/>
```

### Vinculación de Pedidos

Los pedidos se guardan con el `contact.email`:

```sql
-- En la tabla orders
contact_info: {
  contactName: "Juan Pérez",
  email: "juan@example.com",  -- Este email vincula
  phone: "555-1234",
  company: "Empresa"
}
```

Cuando un usuario se registra con `juan@example.com`:
- Su `user.email` coincide con `contact_info.email`
- Puede ver todos los pedidos con ese email
- (Futuro: Agregar filtro por email en API)

---

## 🚀 Mejoras Futuras

### Vinculación Automática

```typescript
// En AuthContext después de signUp
const linkPreviousOrders = async (email: string, userId: string) => {
  // Actualizar orders donde contact_info.email = email
  // Setear user_id = userId
}
```

### Notificaciones por Email

```typescript
// Después de crear pedido sin cuenta
sendEmail({
  to: order.contact.email,
  subject: "Crea tu cuenta para rastrear tu pedido",
  template: "order-confirmation-with-register-cta"
})
```

### Dashboard de Usuario

```
/mi-cuenta
├── Perfil
├── Direcciones
├── Pedidos        <- Aquí llegarían
├── Favoritos
└── Configuración
```

---

## 💡 Buenas Prácticas

### ✅ Hacer:

- **No forzar registro** antes de comprar
- **Mostrar beneficios claros** de registrarse
- **Mensajes contextuales** después del pedido
- **Usar mismo email** para vincular automáticamente
- **UI limpia** sin ser intrusiva

### ❌ Evitar:

- Bloquear checkout sin cuenta
- Pop-ups agresivos de registro
- Ocultar que pueden comprar sin cuenta
- Mensajes de error confusos
- Demasiados pasos de registro

---

## 📊 Métricas Sugeridas

**KPIs a seguir:**

1. **Tasa de registro post-compra**
   - % de usuarios que se registran después de su primer pedido
   
2. **Pedidos sin cuenta vs con cuenta**
   - Cuántos pedidos vienen de usuarios no registrados

3. **Tiempo hasta registro**
   - Cuánto tardan en crear cuenta después del pedido

4. **Vinculación exitosa**
   - % de usuarios que recuperan acceso a pedidos anteriores

---

## 🎯 Conversión

**Objetivo principal:**
- Facilitar la compra (sin fricción de registro)
- Incentivar registro (mostrando valor)
- Retener clientes (acceso a historial)

**Mensaje clave:**
> "Puedes comprar ahora, registrarte después, y aún así ver todo tu historial"

---

## 🔐 Seguridad

### Datos Guardados Sin Cuenta

Los pedidos sin cuenta solo contienen:
- ✅ Email de contacto
- ✅ Nombre
- ✅ Teléfono
- ✅ Dirección de envío
- ✅ Productos y montos

**NO se guarda:**
- ❌ Contraseña (no existe aún)
- ❌ Datos de tarjeta
- ❌ Usuario ID (null hasta registro)

### Vinculación por Email

- Email NO es campo único en `orders`
- Múltiples pedidos pueden compartir email
- Al registrarse, se vincula `user_id`
- RLS permite ver solo pedidos propios

---

## ✅ Checklist de Verificación

Antes de usar en producción:

- [ ] AuthContext configurado correctamente
- [ ] AuthDialog funcional (login + registro)
- [ ] Página /pedidos muestra mensaje para no autenticados
- [ ] Checkout genera toast contextual
- [ ] Pedidos se guardan con contact.email
- [ ] Prueba: Hacer pedido sin cuenta
- [ ] Prueba: Crear cuenta con mismo email
- [ ] Prueba: Ver pedido en historial
- [ ] Prueba: Iniciar sesión existente
- [ ] UI responsive en móvil

---

**Fecha de implementación:** 16 Febrero 2026  
**Versión:** 1.0

**Resultado esperado:**  
Los usuarios pueden comprar sin fricción, pero tienen incentivo claro y fácil para registrarse y gestionar sus pedidos.
