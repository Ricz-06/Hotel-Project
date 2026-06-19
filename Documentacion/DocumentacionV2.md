# Documentación V2 — Hotel Transilvania

> Este documento describe los cambios recientes y aclara la arquitectura actual del proyecto.

---

## 1) Cambios principales detectados

### 1.1 Rutas de Express definidas directamente en `backend/index.js`
El backend define la mayoría de endpoints directamente en `backend/index.js` (incluyendo protección por roles en muchas rutas). Los archivos en `backend/Routes/*` se consideran rutas/routers alternativos o no usados por la versión principal del servidor.

### 1.2 Ajustes de CORS
Se agregó configuración de CORS con una lista `allowedOrigins`, permitiendo:
- `http://localhost:5500` a `http://localhost:5503`
- y lo mismo en `http://127.0.0.1:5500` a `http://127.0.0.1:5503`
Además, el backend permite `origin` vacío (por ejemplo desde herramientas tipo Postman).

### 1.3 Endpoints de Auth y sesión
En `backend/index.js` se expone:
- `POST /register` (controlador `controllers/authController.registrar`)
- `POST /login` (controlador `controllers/authController.login`)
- `GET /usuarios` (protegido por ADMIN)
- `GET /me` (requiere auth)
- `POST /logout` (AGREGADA; anteriormente faltaba y generaba 404)

**Importante:** el middleware actual de `backend/middleware/authMiddleware.js` usa **JWT en header `Authorization: Bearer <token>`**.

---

## 2) Autenticación y autorización (V2)

### 2.1 Middleware: `backend/middleware/authMiddleware.js`

#### `requireAuth`
- Lee `Authorization`.
- Verifica token JWT con `JWT_SECRET`.
- Si es válido: asigna `req.user = decoded`.
- Si no hay token: `401 { error: 'No autorizado' }`.
- Si el token es inválido/expirado: `401 { error: 'No autorizado' }`.

#### `requireRole(roles)`
- Igual que `requireAuth`, pero añade chequeo de rol.
- Permite solo si `decoded.role` está dentro de `roles`.
- Si falta token: `401`.
- Si el rol no está permitido: `403 { error: 'Acceso denegado' }`.

### 2.2 Rol usado
Los roles provienen del JWT (campo `role`). Los roles están alineados con Prisma:
- `ADMIN`
- `USER`

---

## 3) Endpoints y permisos (mapa actualizado)

> Base: `http://127.0.0.1:3000`

### 3.1 Raíz
- `GET /`
  - Responde JSON de estado (inline en `backend/index.js`).

### 3.2 Auth
- `POST /register`
- `POST /login`
- `GET /usuarios` → **ADMIN**
- `GET /me` → **AUTH**
- `POST /logout` → **AUTH**

### 3.3 Clientes (ADMIN)
- `GET /clientes` → ADMIN
- `POST /clientes` → ADMIN
- `POST /clientes/eliminar` → ADMIN
- `PUT /clientes/actualizar` → ADMIN

### 3.4 Habitaciones
- `GET /habitaciones`
  - No protegido (se llama directamente a `obtenerHabitaciones`).
- `POST /habitaciones` → ADMIN
  - Aplica límite `MAX_HABITACIONES = 50`.
- `PUT /habitaciones/ocupar` → ADMIN
  - Regla de compatibilidad:
    - VIP solo con VIP
    - Normal no puede usar VIP
- `PUT /habitaciones/liberar` → ADMIN
- `POST /habitaciones/eliminar` → ADMIN

### 3.5 Solicitudes / Reservas
- `POST /solicitudes`
  - Sin protección explícita en `backend/index.js`.
- `GET /solicitudes` → ADMIN
- `PUT /solicitudes/aprobar/:id` → ADMIN
  - Flujo (alto nivel):
    1) Busca solicitud por `id`
    2) Busca habitación `Libre` del tipo pedido
    3) Crea `Cliente` con `tipo` mapeado
    4) Marca habitación como `ocupada` y asigna `clienteId`
    5) Elimina la solicitud
- `PUT /solicitudes/rechazar/:id` → ADMIN
  - Elimina la solicitud.

#### Solicitudes del usuario
- `GET /mis-solicitudes` → AUTH
  - Usa `req.user.correo`.
  - Además carga habitaciones ocupadas asociadas a `req.user.nombre`.
  - Devuelve:
    - `solicitudes`
    - `habitacionesOcupadas`

### 3.6 Facturas
- `GET /facturas`
  - No protegido (en `backend/index.js`).
- `POST /facturas`
  - No protegido.
- `GET /mis-facturas` → AUTH

### 3.7 Reset total (ADMIN)
- `POST /reset` → ADMIN
  - Borra (deleteMany) las tablas:
    - `factura`
    - `solicitud`
    - `habitacion`
    - `cliente`

---

## 4) Nota de coherencia con la V1

En los documentos anteriores (p. ej. `Documentacion/README_API.md` y `Documentacion/README_Rutas_y_Funciones.md`) se describía un enfoque basado en `req.session.user`.

En esta V2, el middleware implementado usa **JWT** mediante header `Authorization`.

Si el frontend todavía está enviando cookies/sesión, deberá ajustarse para enviar el header `Authorization: Bearer <token>`.

---

## 5) Ejecutar / usar (referencia breve)

- Backend corre en: `http://127.0.0.1:3000`
- Frontend debe servirse con un origin permitido por la lista CORS.
- Credenciales iniciales (seed):
  - ADMIN: `admin@hotel.com`
  - Password: `1234`

---

## 6) Archivos relevantes
- `backend/index.js` (rutas y permisos actuales)
- `backend/middleware/authMiddleware.js` (JWT: `requireAuth` / `requireRole`)
- `backend/controllers/*` (lógica)
- `backend/prisma/schema.prisma` (roles y modelos)
- `Documentacion/DocumentacionV2.md` (este documento)

