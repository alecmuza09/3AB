# 👥 Gestión de Usuarios - 3A Branding

## 🎯 ¿Qué es esto?

Sistema para administrar todos los usuarios registrados en la plataforma, permitiéndote ver su información y cambiar sus roles y permisos.

---

## 🚀 Cómo Acceder

1. Ve al **Panel de Administración**: `/admin`
2. En el sidebar, haz clic en **"Configuración"**
3. Luego haz clic en **"Usuarios"**

---

## 📊 Estadísticas Generales

Al entrar a la sección, verás 3 cards con estadísticas en tiempo real:

### 🔵 Total de Usuarios
- Muestra el **número total** de usuarios registrados
- Incluye todos los roles (admin, staff, clientes)
- Se actualiza al cargar o modificar usuarios

### 🟡 Administradores
- Cantidad de usuarios con rol **"admin"**
- Tienen acceso completo al panel
- Pueden modificar configuraciones y otros usuarios

### 🟢 Clientes
- Cantidad de usuarios con rol **"customer"**
- Solo pueden realizar pedidos
- Ven su historial y perfil

---

## 📋 Tabla de Usuarios

La tabla muestra toda la información de cada usuario:

### Columnas Disponibles

1. **Usuario**
   - Avatar circular con inicial del nombre
   - Nombre completo (o "Sin nombre")
   - ID corto (primeros 8 caracteres)

2. **Email**
   - Dirección de correo electrónico
   - Mostrado como texto plano

3. **Rol**
   - Badge visual con color según rol:
     - 👑 **Admin** (rojo): Acceso completo
     - ⚙️ **Staff** (azul): Acceso limitado
     - 👤 **Cliente** (verde): Solo pedidos

4. **Empresa**
   - Nombre de la empresa (si está registrada)
   - Muestra "-" si no hay empresa

5. **Teléfono**
   - Número de teléfono del usuario
   - Muestra "-" si no hay teléfono

6. **Registro**
   - Fecha de creación de la cuenta
   - Formato: "16 feb 2026"
   - En español mexicano

7. **Acciones**
   - Botón **"Editar"** para modificar usuario

---

## 🔧 Editar Usuario

Al hacer clic en **"Editar"**, se abre un dialog con:

### Información Completa

**Card de Información:**
- Avatar con inicial
- Nombre completo
- Email
- Empresa
- Teléfono
- RFC/Tax ID
- Fecha de registro

---

### Cambiar Rol del Usuario

Sección con 3 opciones de rol:

#### 👤 Cliente
**Permisos:**
- ✅ Realizar pedidos
- ✅ Ver historial de pedidos
- ✅ Editar su perfil
- ❌ Acceso al panel de administración
- ❌ Ver otros usuarios
- ❌ Modificar configuraciones

**Cuándo usar:**
- Usuarios finales que compran productos
- Clientes frecuentes
- Usuarios estándar de la tienda

---

#### ⚙️ Staff
**Permisos:**
- ✅ Realizar pedidos
- ✅ Ver historial de pedidos
- ✅ Acceso limitado al panel admin
- ✅ Ver inventario (posiblemente)
- ❌ Modificar configuraciones sensibles
- ❌ Cambiar roles de otros usuarios

**Cuándo usar:**
- Empleados de la empresa
- Personal de ventas
- Asistentes administrativos
- Personal de soporte

---

#### 👑 Administrador
**Permisos:**
- ✅ **Acceso completo** a todo el panel
- ✅ Modificar todos los usuarios
- ✅ Cambiar roles y permisos
- ✅ Configurar envíos, márgenes, etc.
- ✅ Ver todas las órdenes (incluso anónimas)
- ✅ Modificar productos, inventario
- ✅ Gestionar contenido del sitio

**Cuándo usar:**
- Dueños del negocio
- Gerentes generales
- IT/Desarrolladores
- Personal de confianza con responsabilidad total

---

### Preview de Cambio

Al seleccionar un rol nuevo, verás:

**Card azul con:**
- 🔔 Icono de alerta
- Título: "Cambio de Rol"
- Badge mostrando el rol seleccionado
- Texto: "← Rol seleccionado"

Esto te permite **confirmar visualmente** el cambio antes de guardarlo.

---

### Botones de Acción

- **Cancelar**: Cierra el dialog sin guardar
- **Guardar Cambios**: Aplica el nuevo rol al usuario

---

## 🔄 Flujo de Trabajo

### Promover Cliente a Admin

1. Ve a **Usuarios**
2. Busca al usuario en la tabla
3. Clic en **"Editar"**
4. Selecciona **👑 Administrador**
5. Verifica el preview
6. Clic en **"Guardar Cambios"**
7. Confirma el mensaje: "✅ Rol de usuario actualizado"
8. El usuario ahora tiene acceso admin

---

### Degradar Admin a Cliente

1. Ve a **Usuarios**
2. Encuentra al admin a degradar
3. Clic en **"Editar"**
4. Selecciona **👤 Cliente**
5. Verifica el preview
6. Clic en **"Guardar Cambios"**
7. Confirma el mensaje
8. El usuario pierde acceso admin

---

### Asignar Rol de Staff

1. Ve a **Usuarios**
2. Selecciona al usuario
3. Clic en **"Editar"**
4. Selecciona **⚙️ Staff**
5. Guardar cambios
6. Ahora tiene acceso limitado al admin

---

## 💡 Casos de Uso Reales

### Caso 1: Nuevo Empleado

**Situación:** Contrataste a alguien para ventas

**Solución:**
1. El empleado se registra como cliente
2. Tú lo buscas en Usuarios
3. Cambias su rol a **Staff**
4. Ahora puede acceder al panel para gestionar pedidos

---

### Caso 2: Cliente VIP

**Situación:** Cliente frecuente quiere ver inventario en tiempo real

**Opción 1 (Menos acceso):**
- Manténlo como **Cliente**
- Desarrolla una vista especial para clientes VIP

**Opción 2 (Más acceso):**
- Cámbialo a **Staff**
- Configura permisos específicos

---

### Caso 3: Despedir Admin

**Situación:** Un admin deja la empresa

**Solución:**
1. INMEDIATAMENTE cambia su rol a **Cliente**
2. Esto revoca su acceso al panel
3. Considera eliminar su cuenta si es necesario
4. Audita qué cambios hizo recientemente

---

### Caso 4: Auditoría de Permisos

**Situación:** Revisar quién tiene acceso admin

**Solución:**
1. Ve a Usuarios
2. Mira el card **🟡 Administradores**
3. Revisa la tabla, filtra visualmente por badge rojo
4. Verifica que cada admin debería tener ese acceso
5. Degrada a quienes ya no necesitan acceso

---

## 🔍 Estructura de Datos

### Tabla: `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  company_name TEXT,
  tax_id TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('customer', 'admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Roles Disponibles

```typescript
type UserRole = 'customer' | 'admin' | 'staff'
```

---

## 🧪 Cómo Probar

### 1. Ver Usuarios

- Ve a **Admin → Usuarios**
- Verifica que se muestren todos los usuarios
- Revisa que las estadísticas coincidan

### 2. Cambiar Rol

- Selecciona un usuario de prueba
- Cámbialo a otro rol
- Cierra sesión
- Inicia sesión con ese usuario
- Verifica que tenga los permisos correctos

### 3. Probar Staff

- Crea un usuario de prueba
- Asígnale rol **Staff**
- Inicia sesión con ese usuario
- Verifica acceso limitado al admin

---

## 🐛 Solución de Problemas

### Problema: "No hay usuarios registrados"

**Causa:** Tabla profiles vacía o error de conexión

**Solución:**
1. Verifica conexión a Supabase
2. Revisa que haya usuarios en `profiles`
3. Ejecuta en Supabase SQL:
   ```sql
   SELECT * FROM profiles;
   ```

---

### Problema: "Error al actualizar rol del usuario"

**Causa:** Permisos insuficientes o error de DB

**Solución:**
1. Verifica que TÚ seas admin
2. Revisa logs de consola
3. Verifica RLS policies en Supabase
4. Asegúrate que la tabla `profiles` sea editable

---

### Problema: Usuario no puede acceder después de cambio de rol

**Causa:** Cache del navegador o sesión antigua

**Solución:**
1. Usuario debe **cerrar sesión**
2. **Iniciar sesión nuevamente**
3. Esto recarga el perfil con el nuevo rol
4. Si persiste, limpia cache del navegador

---

### Problema: Los cambios no se guardan

**Causa:** Error en el update de Supabase

**Solución:**
1. Abre consola del navegador
2. Busca errores en rojo
3. Verifica políticas RLS:
   ```sql
   -- Debe existir esta política o similar
   CREATE POLICY "Admins can update users"
   ON profiles FOR UPDATE
   USING (auth.uid() IN (
     SELECT id FROM profiles WHERE role = 'admin'
   ));
   ```

---

## 🔐 Seguridad y Permisos

### Políticas RLS Recomendadas

```sql
-- Todos pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Admins pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Admins pueden actualizar cualquier perfil
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Usuarios pueden actualizar su propio perfil (excepto rol)
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

---

## ✅ Mejores Prácticas

### ✅ Hacer:

- **Limitar admins** al mínimo necesario
- **Auditar roles** mensualmente
- **Documentar** por qué alguien es admin
- **Revocar acceso** inmediatamente al despedir
- **Usar Staff** para empleados de confianza media
- **Mantener** al menos 2 admins (redundancia)

### ❌ Evitar:

- Dar admin a todos
- Dejar admins de ex-empleados
- Compartir cuentas admin
- Promover sin criterio
- Olvidar auditar permisos

---

## 📊 Auditoría de Roles

### Checklist Mensual

- [ ] Revisar lista de admins
- [ ] Confirmar que cada admin esté activo
- [ ] Verificar que no haya admins innecesarios
- [ ] Revisar roles de staff
- [ ] Documentar cambios de roles del mes
- [ ] Verificar que clientes no tengan acceso admin

---

## 🎯 KPIs a Monitorear

1. **Ratio Admin/Total**
   - Objetivo: < 10% son admins
   - Si es mayor, probablemente estás dando mucho acceso

2. **Ratio Staff/Total**
   - Depende del tamaño de tu equipo
   - Para equipo de 5: ~20-40%

3. **Clientes Activos**
   - Total de clientes que han hecho pedidos
   - Vs total de registrados

4. **Nuevos Registros/Mes**
   - Crecimiento de la base de usuarios
   - Indica salud del negocio

---

## 🔄 Impacto de los Cambios

**Los cambios de rol afectan:**
- ✅ Acceso al panel de administración
- ✅ Permisos de edición
- ✅ Visibilidad de secciones
- ✅ Capacidad de modificar configuraciones

**Los cambios de rol NO afectan:**
- ❌ Pedidos anteriores del usuario
- ❌ Información personal almacenada
- ❌ Historial de compras
- ❌ Carrito de compras actual

**Importante:**
- Los cambios toman efecto **al cerrar/abrir sesión**
- El usuario debe **recargar la página**
- No hay cambios retroactivos en pedidos

---

## 🚨 Acciones de Emergencia

### Si un admin malintencionado cambia roles

1. **Accede con tu cuenta super-admin**
2. **Degrada** al admin problemático a Cliente
3. **Revisa** qué cambios hizo (logs, auditoría)
4. **Restaura** roles correctos a usuarios afectados
5. **Cambia contraseñas** si es necesario
6. **Documenta** el incidente

---

### Si perdiste acceso admin

**Escenario:** El único admin perdió acceso

**Solución directa en Supabase:**

1. Ve a Supabase Dashboard
2. Abre **Table Editor** → `profiles`
3. Busca tu usuario por email
4. Edita la fila, cambia `role` a `'admin'`
5. Guarda y recarga sesión

**Query SQL:**
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'tu-email@ejemplo.com';
```

---

## 📈 Escalabilidad

### Para Equipos Pequeños (< 10 usuarios)

- Gestión manual en esta interfaz está bien
- No necesitas herramientas adicionales
- Audita cada 3 meses

---

### Para Equipos Medianos (10-50 usuarios)

- Considera crear categorías de Staff
- Documenta roles en hoja de cálculo
- Audita mensualmente
- Define políticas claras de permisos

---

### Para Equipos Grandes (50+ usuarios)

- Implementa sistema de permisos granulares
- Crea sub-roles (staff_ventas, staff_soporte, etc.)
- Audita semanalmente
- Considera herramientas de gestión de acceso

---

## 🔄 Roadmap Futuro

### Mejoras Planeadas

1. **Filtros en tabla**
   - Por rol
   - Por fecha de registro
   - Por empresa

2. **Búsqueda**
   - Por nombre
   - Por email
   - Por empresa

3. **Exportar CSV**
   - Lista completa de usuarios
   - Para análisis externo

4. **Logs de actividad**
   - Quién cambió qué rol
   - Cuándo se hicieron cambios
   - Auditoría completa

5. **Permisos granulares**
   - Más allá de admin/staff/customer
   - Permisos por sección
   - Control fino de acceso

---

## ✅ Checklist de Uso

Antes de cambiar roles en producción:

- [ ] Confirmar identidad del usuario
- [ ] Verificar necesidad del cambio de rol
- [ ] Documentar razón del cambio
- [ ] Comunicar al usuario el cambio
- [ ] Usuario debe cerrar/abrir sesión
- [ ] Verificar que el usuario tenga acceso correcto
- [ ] Documentar en registro interno

---

**Fecha de implementación:** 16 Febrero 2026  
**Versión:** 1.0

**Tip:** Mantén el número de admins bajo. A mayor cantidad de admins, mayor riesgo de seguridad.
