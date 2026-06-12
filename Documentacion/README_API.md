# Documentación del Backend (Hotel Project)

> Proyecto: **Hotel Transilvania**
> Backend Node/Express + Prisma + Postgres

---

## 1. Resumen de arquitectura

- **Express** expone una API REST.
- **Prisma** gestiona persistencia en Postgres.
- **Autenticación**: `express-session` (cookies de sesión).
- **Autorización por rol**: middleware `requireRole('ADMIN' | 'USER')`.

Puntos clave:
- La app principal está en `backend/index.js`.
- Rutas (y controladores) se encuentran en:
  - `backend/controllers/*`
  - `backend/Routes/*` (algunos routers existen, pero en `backend/index.js` muchas rutas están definidas directamente).
- Middlewares:
  - `backend/middleware/authMiddleware.js`

---

## 2. Modelos (Prisma)

Archivo: `backend/prisma/schema.prisma`

### Enums
- `Role`: `ADMIN`, `USER`
- `TipoCliente`: `Normal`, `Deluxe`, `VIP`
- `TipoHabitacion`: `Normal`, `Deluxe`, `VIP`
- `EstadoHabitacion`: `Libre`, `ocupada`
- `EstadoSolicitud`: `pendiente`, `aprobada`, `rechazada`

### Entidades
- `Usuario`
  - Campos: `id`, `nombre`, `correo` (único), `password` (hash), `role` (por defecto `USER`)
  - Mapeo: `@@map("usuarios")`
- `Cliente`
  - Campos: `id`, `nombre`, `tipo` (por defecto `Normal`)
  - Relación: `Habitacion[]`
  - Mapeo: `@@map("clientes")`
- `Habitacion`
  - Campos: `id`, `numero` (único), `tipo`, `estado`, `servicios` (string[]), `clienteId?`
  - Relación: `cliente` (opcional, `onDelete: SetNull`)
  - Mapeo: `@@map("habitaciones")`
- `Solicitud`
  - Campos: `id`, `nombre`, `correo`, `telefono`, `tipo_habitacion`, `estado` (por defecto `pendiente`), `creadoEn`
  - Mapeo: `@@map("solicitudes")`
- `Factura`
  - Campos: `id`, `cliente`, `correo`, `telefono`, `servicio`, `subtotal`, `iva`, `total`, `creadoEn`
  - Mapeo: `@@map("facturas")`

---

## 3. Seed / datos iniciales

Archivo: `backend/prisma/seed.js`

- Limpia tablas: `factura`, `solicitud`, `habitacion`, `cliente`, `usuario`.
- Crea un **ADMIN**:
  - `admin@hotel.com` / `1234`
- Crea **6 habitaciones** iniciales (101/102 Normal, 201/202 Deluxe, 301/302 VIP).

Ejecutar seed (ejemplo):
- `npm run seed`

---

## 4. Autenticación y Autorización

### Middleware: `backend/middleware/authMiddleware.js`

- `requireAuth`:
  - Verifica que exista `req.session.user`.
  - Si no existe: `401 { error: 'No autorizado' }`.

- `requireRole(roles)`: 
  - Internamente valida `req.session.user.role` contra roles permitidos.
  - Si no existe sesión: `401`.
  - Si el rol no está permitido: `403 { error: 'Acceso denegado' }`.

---

## 5. API REST (endpoints principales)

Base URL:
- `http://127.0.0.1:3000`

### 5.1 Salud / raíz
- `GET /`
  - Responde un JSON con mensaje de estado.

### 5.2 Auth
- `POST /registrar`
  - Controlador: `controllers/authController.registrar`
  - Registra usuario con password hasheada (bcrypt).
  - Devuelve: `{ success, mensaje, usuario, nombre_completo }`

- `POST /login`
  - Controlador: `controllers/authController.login`
  - Busca usuario por `correo` (o `usuario`) y compara password con bcrypt.
  - Guarda en sesión:
    - `req.session.user = { id, nombre, correo, role }`
  - Devuelve: `{ success, mensaje, usuario (sin password), nombre_completo }`

- `GET /db-users`
  - Controlador: `controllers/authController.verUsuarios`
  - Lista usuarios (incluye `role`).

- `GET /me`
  - Protegido: `requireAuth`
  - Responde: `{ user: req.session.user }`

- `POST /logout`
  - Cierra sesión destruyendo `req.session`.

### 5.3 Perfil / solicitudes del usuario
- `GET /mis-solicitudes`
  - Protegido: `requireAuth`
  - Usa `req.session.user.correo` como filtro.
  - Devuelve: `{ solicitudes }`

- `GET /mis-facturas`
  - Protegido: `requireAuth`
  - Filtro por `correo` en sesión.

### 5.4 Clientes (ADMIN)
- `GET /clientes`
  - Protegido: `requireAdmin` (ADMIN)
  - Controlador: `controllers/clientesController.obtenerClientes`

- `POST /clientes`
  - Protegido: `requireAdmin`
  - Crea cliente con `{ nombre, tipo }`.
  - Default de `tipo`: `Normal`.

- `PUT /clientes/actualizar`
  - Protegido: `requireAdmin`
  - Actualiza tipo por `id`.

- `POST /clientes/eliminar`
  - Protegido: `requireAdmin`
  - Libera habitaciones asociadas al cliente antes de borrar.

### 5.5 Habitaciones
- `GET /habitaciones`
  - NO protegido en `backend/index.js` (llama `obtenerHabitaciones` directamente).

- `POST /habitaciones`
  - Protegido: ADMIN (`requireAdmin`)
  - Límite: `MAX_HABITACIONES = 50`.
  - Crea habitación con servicios según `tipo`.

- `PUT /habitaciones/ocupar`
  - Protegido: ADMIN
  - Regla de negocio de compatibilidad:
    - VIP solo con VIP
    - Normal no puede usar VIP
  - Actualiza:
    - `estado: 'ocupada'`
    - `clienteId`

- `PUT /habitaciones/liberar`
  - Protegido: ADMIN
  - Deja `estado: 'Libre'` y `clienteId: null`.

- `POST /habitaciones/eliminar`
  - Protegido: ADMIN

### 5.6 Solicitudes
- `GET /solicitudes`
  - Protegido: ADMIN

- `POST /solicitudes`
  - Sin protección explícita en `backend/index.js` (usa `crearSolicitud` directo).

- `PUT /solicitudes/aprobar/:id`
  - Protegido: ADMIN
  - Flujo:
    1) Busca solicitud por `id`
    2) Busca habitación `Libre` del tipo solicitado
    3) Crea `Cliente` con tipo mapeado
    4) Marca habitación como `ocupada` y asigna `clienteId`
    5) Elimina la solicitud

- `PUT /solicitudes/rechazar/:id`
  - Protegido: ADMIN
  - Elimina solicitud.

### 5.7 Facturas
- `GET /facturas`
  - No protegido en `backend/index.js`.

- `POST /facturas`
  - No protegido en `backend/index.js`.

- `GET /mis-facturas`
  - Protegido: `requireAuth`

### 5.8 Reset (ADMIN)
- `POST /reset`
  - Protegido: ADMIN
  - Borra todas las tablas:
    - `factura`, `solicitud`, `habitacion`, `cliente`

---

## 6. Frontend (referencias rápidas)

En `Frontend/app.js` se observa cómo se consumen algunos endpoints:
- `fetch(URL + '/me', { credentials: 'include' })`
- `fetch(URL + '/clientes', ...)` etc.

> Nota: Aunque el frontend implementa guard de ADMIN, el backend también aplica permisos vía middleware en rutas protegidas.

---

## 7. Consideraciones / inconsistencias detectadas

- En `backend/index.js` hay rutas definidas directamente, y existen archivos en `backend/Routes/*` que en algunos casos no se usan.
- En el frontend el endpoint de registro/login puede estar usando `'/auth'` (dependiendo del archivo). En este repo, `backend/index.js` expone `'/login'` y `'/registrar'` directamente.
  - Esto puede provocar que el frontend necesite ajustar `AUTH_URL`.

---

## 8. Carpetas principales

- `backend/controllers/`: lógica de negocio por dominio (auth, clientes, habitaciones, solicitudes, facturas)
- `backend/middleware/`: validación de sesión y roles
- `backend/prisma/`: esquema, cliente y seed
- `backend/Routes/`: routers (algunos parecen ser alternativos al estilo de rutas definidas en `backend/index.js`)
- `Frontend/`: páginas y scripts del panel
- `Documentacion/`: documentación adicional (existe `Roles_y_Estructura.md`)

