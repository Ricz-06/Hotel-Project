# README: Rutas + Funciones (backend)

Este documento sirve como “tabla de mapa” para entender qué endpoint llama qué función y qué valida.

---

## Middleware

- `requireAuth`
  - Archivo: `backend/middleware/authMiddleware.js`
  - Requiere: `req.session.user`
  - Respuesta si falla: `401 { error: 'No autorizado' }`

- `requireRole('ADMIN' | 'USER')`
  - Archivo: `backend/middleware/authMiddleware.js`
  - Requiere: `req.session.user.role` dentro del set permitido
  - Respuestas:
    - No sesión: `401`
    - Rol no permitido: `403 { error: 'Acceso denegado' }`

---

## Endpoints (backend/index.js)

Base: `http://127.0.0.1:3000`

### Raíz
- `GET /`
  - Función: inline en `backend/index.js`
  - Responde `{ mensaje, estado, fecha }`

### Auth
- `POST /registrar`
  - Controlador: `controllers/authController.registrar`
- `POST /login`
  - Controlador: `controllers/authController.login`
- `GET /db-users`
  - Controlador: `controllers/authController.verUsuarios`

- `GET /me` (requiere auth)
  - Middleware: `requireAuth`
  - Devuelve `{ user: req.session.user }`

- `POST /logout`
  - Inline en `backend/index.js`
  - Destruye sesión y limpia cookie.

---

### Solicitudes
- `GET /mis-solicitudes` (requiere auth)
  - Middleware: `requireAuth`
  - Busca `prisma.solicitud.findMany({ where: { correo: req.session.user.correo } })`

- `GET /solicitudes` (ADMIN)
  - Middleware: `requireAdmin`
  - Controlador: `solicitudesController.obtenerSolicitudes`

- `POST /solicitudes`
  - Controlador: `solicitudesController.crearSolicitud`

- `PUT /solicitudes/aprobar/:id` (ADMIN)
  - Middleware: `requireAdmin`
  - Controlador: `solicitudesController.aprobarSolicitud`
  - Regla:
    - Busca solicitud
    - Busca habitación `Libre` del `tipo_habitacion`
    - Crea cliente con tipo mapeado (VIP/Deluxe/Normal)
    - Marca habitación como `ocupada` + `clienteId`
    - Borra solicitud

- `PUT /solicitudes/rechazar/:id` (ADMIN)
  - Controlador: `solicitudesController.rechazarSolicitud`
  - Regla: borra solicitud

---

### Clientes (ADMIN)
- `GET /clientes` (ADMIN)
  - `clientesController.obtenerClientes`
- `POST /clientes` (ADMIN)
  - `clientesController.crearCliente`
- `PUT /clientes/actualizar` (ADMIN)
  - `clientesController.actualizarCliente`
- `POST /clientes/eliminar` (ADMIN)
  - `clientesController.eliminarCliente`
  - Regla:
    - `updateMany` habitaciones con `clienteId = id` => `clienteId: null`, `estado: 'Libre'`
    - luego `prisma.cliente.delete`

---

### Habitaciones
- `GET /habitaciones`
  - Controlador: `habitacionesController.obtenerHabitaciones`
  - Nota: en `backend/index.js` NO usa requireAdmin.

- `POST /habitaciones` (ADMIN)
  - Controlador: `habitacionesController.crearHabitacion`
  - Regla: máximo 50 habitaciones.
  - `servicios`:
    - si no se mandan, usa `SERVICIOS_POR_TIPO[tipo]`

- `PUT /habitaciones/ocupar` (ADMIN)
  - Controlador: `habitacionesController.ocuparHabitacion`
  - Regla:
    - VIP => habitación VIP
    - Normal => no puede usar VIP

- `PUT /habitaciones/liberar` (ADMIN)
  - Controlador: `habitacionesController.liberarHabitacion`

- `POST /habitaciones/eliminar` (ADMIN)
  - Controlador: `habitacionesController.eliminarHabitacion`

---

### Facturas
- `GET /facturas`
  - Controlador: `facturasController.obtenerFacturas`

- `POST /facturas`
  - Controlador: `facturasController.crearFactura`

- `GET /mis-facturas` (requiere auth)
  - Middleware: `requireAuth`
  - Controlador: `facturasController.obtenerMisFacturas`
  - Filtro: `correo` guardado en sesión.

---

### Reset (ADMIN)
- `POST /reset` (ADMIN)
  - Borra:
    - `factura`, `solicitud`, `habitacion`, `cliente`


