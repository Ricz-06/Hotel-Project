# Documentación del Proyecto Hotel Aurora

## 1. Descripción general

**Hotel Aurora** es una aplicación web para la gestión de un hotel.  
El proyecto combina:

- **Frontend público** para mostrar información del hotel.
- **Panel administrativo** para gestionar clientes, habitaciones y solicitudes.
- **Backend en Node.js + Express** para exponer la API.
- **Base de datos MySQL** para guardar la información.

La aplicación está pensada para simular el funcionamiento básico de un hotel:

1. Un cliente visita la web.
2. Envía una solicitud de reserva.
3. El administrador revisa la solicitud.
4. Si la aprueba, se crea el cliente y se asigna una habitación disponible.
5. Si la rechaza, la solicitud se elimina.

---

## 2. Objetivo del proyecto

El objetivo principal es demostrar un sistema de gestión hotelera con estas funciones:

- Mostrar una página de presentación del hotel.
- Permitir solicitudes de reserva desde el frontend.
- Administrar clientes y habitaciones desde un panel interno.
- Controlar habitaciones libres y ocupadas.
- Aplicar reglas de negocio para clientes **VIP** y **Normal**.

---

## 3. Tecnologías utilizadas

### Backend
- **Node.js**
- **Express**
- **MySQL**
- **mysql2**
- **CORS**

### Frontend
- **HTML**
- **CSS**
- **JavaScript**
- **Bootstrap 5**
- **Font Awesome**
- **Google Fonts**

### Base de datos
- **MySQL**
- Base de datos usada: `hotel_db`

> Nota: En el proyecto existe un archivo Prisma, pero la lógica principal visible está implementada con MySQL y `mysql2`.

---

## 4. Estructura del proyecto

### Carpeta `backend/`
Contiene toda la lógica del servidor.

- `server.js`  
  Archivo principal del backend. Inicializa Express, carga rutas y levanta el servidor.

- `db.js`  
  Conexión a MySQL.

- `controllers/`  
  Lógica de negocio de cada módulo:
  - `authController.js`
  - `clientesController.js`
  - `habitacionesController.js`
  - `solicitudesController.js`

- `Routes/`  
  Definición de endpoints:
  - `auth.js`
  - `clientes.js`
  - `habitaciones.js`
  - `solicitudes.js`

- `prisma/schema.prisma`  
  Archivo de configuración de Prisma, aunque no parece ser el motor principal usado en el proyecto.

### Carpeta `Frontend/`
Contiene la interfaz visual del proyecto.

- `index.html`  
  Página principal o landing page del hotel.

- `alojamiento.html`  
  Página de habitaciones.

- `restaurante.html`  
  Página informativa del restaurante.

- `reserva.html`  
  Formulario para enviar solicitudes de reserva.

- `login.html`  
  Pantalla de acceso al panel administrativo.

- `admin.html`  
  Panel de administración.

- `style.css`  
  Estilos del sitio público.

- `admin.css`  
  Estilos del panel administrativo.

- `script.js`  
  Comportamiento general del frontend.

- `app.js`  
  Lógica principal del panel administrativo.

- `reservas.js` y `verHabitaciones.js`  
  Archivos adicionales de apoyo para funciones de reserva y visualización.

### Carpeta `Documentacion/`
Aquí se guarda esta documentación del proyecto.

---

## 5. Funcionamiento general del sistema

El sistema está dividido en dos partes:

### 5.1 Parte pública
Permite mostrar:

- Página de inicio
- Sección de alojamiento
- Sección de restaurante
- Formulario de reserva

### 5.2 Parte administrativa
Permite:

- Crear clientes
- Ver clientes
- Cambiar tipo de cliente
- Eliminar clientes
- Crear habitaciones
- Ver habitaciones
- Ocupar o liberar habitaciones
- Aprobar o rechazar solicitudes
- Reiniciar el sistema

---

## 6. Backend

## 6.1 Conexión a la base de datos

El archivo `backend/db.js` crea la conexión con MySQL usando:

- `host: localhost`
- `user: root`
- `password: 1234`
- `database: hotel_db`

Si la conexión funciona, el servidor muestra un mensaje de éxito en consola.

---

## 6.2 Servidor principal

El archivo `backend/server.js` realiza estas tareas:

- Crea la app con Express.
- Activa `cors()`.
- Permite recibir JSON con `express.json()`.
- Carga las rutas de:
  - autenticación
  - clientes
  - habitaciones
  - solicitudes
- Define una ruta principal `GET /`.
- Define una ruta especial `POST /reset` para reiniciar el sistema.
- Escucha en el puerto `3000`.

---

## 7. Módulos del backend

## 7.1 Autenticación

Archivo: `backend/controllers/authController.js`

### Registro
`POST /auth/register`

Guarda un nuevo usuario en la tabla `usuarios`.

Recibe:
- `nombre`
- `correo`
- `password`

Si hay error, responde que el correo ya está registrado.

### Login
`POST /auth/login`

Busca un usuario por correo y contraseña.

Si los datos no coinciden:
- responde `Datos incorrectos`

Si coinciden:
- responde `Login correcto`
- devuelve el usuario encontrado

> Importante: este login compara texto plano y no usa hash de contraseñas.

---

## 7.2 Clientes

Archivo: `backend/controllers/clientesController.js`

### Obtener clientes
`GET /clientes`

Devuelve todos los registros de la tabla `clientes`.

### Crear cliente
`POST /clientes`

Recibe:
- `nombre`
- `tipo`

Crea un nuevo cliente.

### Eliminar cliente
`POST /clientes/eliminar`

Recibe:
- `id`

Elimina el cliente indicado.

### Actualizar cliente
`PUT /clientes/actualizar`

Recibe:
- `id`
- `tipo`

Cambia el tipo del cliente.

---

## 7.3 Habitaciones

Archivo: `backend/controllers/habitacionesController.js`

### Obtener habitaciones
`GET /habitaciones`

Devuelve todas las habitaciones y, si existe, el nombre del cliente asociado.

Usa un `LEFT JOIN` entre habitaciones y clientes.

### Crear habitación
`POST /habitaciones`

Recibe:
- `numero`
- `tipo`
- `estado`

Crea una habitación nueva.

### Ocupar habitación
`PUT /habitaciones/ocupar`

Recibe:
- `numero`
- `cliente_id`

Reglas de validación:

- Si el cliente es **VIP**, solo puede ocupar una habitación VIP.
- Si el cliente es **Normal**, no puede ocupar una habitación VIP.

Si todo es correcto:
- cambia el estado a `ocupada`
- asigna el `cliente_id`

### Liberar habitación
`PUT /habitaciones/liberar`

Recibe:
- `numero`

Cambia el estado a `Libre` y elimina el cliente asignado.

### Eliminar habitación
`POST /habitaciones/eliminar`

Recibe:
- `id`

Elimina la habitación indicada.

---

## 7.4 Solicitudes de reserva

Archivo: `backend/controllers/solicitudesController.js`

### Crear solicitud
`POST /solicitudes`

Recibe:
- `nombre`
- `correo`
- `telefono`
- `tipo_habitacion`

Guarda una solicitud de reserva.

### Obtener solicitudes
`GET /solicitudes`

Devuelve todas las solicitudes, ordenadas de la más reciente a la más antigua.

### Aprobar solicitud
`PUT /solicitudes/aprobar/:id`

Flujo de aprobación:

1. Busca la solicitud.
2. Crea un cliente en la tabla `clientes`.
3. Busca una habitación libre del tipo solicitado.
4. Asigna esa habitación al nuevo cliente.
5. Elimina la solicitud.

Si la habitación no existe libre, responde un error.

### Rechazar solicitud
`PUT /solicitudes/rechazar/:id`

Elimina la solicitud sin crear cliente ni asignar habitación.

---

## 8. Rutas disponibles

## Autenticación
- `POST /auth/register`
- `POST /auth/login`

## Clientes
- `GET /clientes`
- `POST /clientes`
- `POST /clientes/eliminar`
- `PUT /clientes/actualizar`

## Habitaciones
- `GET /habitaciones`
- `POST /habitaciones`
- `PUT /habitaciones/ocupar`
- `PUT /habitaciones/liberar`
- `POST /habitaciones/eliminar`

## Solicitudes
- `POST /solicitudes`
- `GET /solicitudes`
- `PUT /solicitudes/aprobar/:id`
- `PUT /solicitudes/rechazar/:id`

## Sistema
- `GET /`
- `POST /reset`

---

## 9. Frontend público

## 9.1 Página principal
Archivo: `Frontend/index.html`

Muestra:

- nombre del hotel
- sección hero
- beneficios de la habitación
- experiencia boutique
- testimonios
- íconos de servicios
- mapa
- botón de WhatsApp

## 9.2 Alojamiento
Archivo: `Frontend/alojamiento.html`

Muestra diferentes tipos de habitación:

- Sencilla
- Deluxe
- Suite VIP

Cada habitación tiene un botón que lleva al flujo de reserva.

## 9.3 Restaurante
Archivo: `Frontend/restaurante.html`

Presenta imágenes y contenido del restaurante gourmet del hotel.

## 9.4 Reserva
Archivo: `Frontend/reserva.html`

Contiene un formulario para enviar una solicitud al backend.

Al enviar:
- toma los datos del formulario
- hace `POST /solicitudes`
- muestra alerta de confirmación
- limpia el formulario

---

## 10. Panel administrativo

Archivo: `Frontend/admin.html`

El panel administrativo permite controlar el sistema completo.

### Secciones principales
- Estado del hotel
- Administración general
- Filtros de habitaciones
- Gestión de clientes
- Gestión de solicitudes
- Gestión de habitaciones

### Funciones del panel
Implementadas en `Frontend/app.js`:

#### Clientes
- `crearCliente()`
- `verClientes()`
- `cambiarTipo()`
- `eliminarCliente()`

#### Solicitudes
- `verSolicitudes()`
- `aprobarSolicitud()`
- `rechazarSolicitud()`

#### Habitaciones
- `crearHabitacion()`
- `verHabitaciones()`
- `filtrar()`
- `ocuparHabitacion()`
- `liberarHabitacion()`
- `eliminarHabitacion()`

#### Sistema
- `resetearSistema()`

---

## 11. Flujo de trabajo del sistema

### Flujo de reserva
1. El usuario entra a `reserva.html`.
2. Completa el formulario.
3. Se guarda la solicitud en la base de datos.
4. El administrador entra al panel.
5. Revisa la solicitud.
6. Decide aprobar o rechazar.

### Si se aprueba
1. Se crea el cliente.
2. Se busca una habitación libre.
3. Se asigna la habitación.
4. Se borra la solicitud.

### Si se rechaza
1. Se elimina la solicitud.
2. No se crea cliente.
3. No se asigna habitación.

---

## 12. Reglas de negocio importantes

- Un cliente **VIP** solo puede ocupar habitaciones VIP.
- Un cliente **Normal** no puede ocupar habitaciones VIP.
- Al aprobar una solicitud, el sistema intenta asignar automáticamente una habitación libre del tipo requerido.
- Si no hay habitaciones disponibles, la solicitud no puede completarse correctamente.

---

## 13. Base de datos usada

La lógica del proyecto trabaja con estas tablas:

- `usuarios`
- `clientes`
- `habitaciones`
- `solicitudes`

### Relaciones principales
- Una habitación puede estar asociada a un cliente mediante `cliente_id`.
- Una solicitud aprobada se convierte en un cliente y una habitación ocupada.

---

## 14. Cómo ejecutar el proyecto

### 14.1 Requisitos previos
- Tener instalado Node.js
- Tener MySQL corriendo
- Tener creada la base de datos `hotel_db`

### 14.2 Ejecutar backend
1. Ir a la carpeta `backend/`
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar el servidor:
   ```bash
   node server.js
   ```

El backend debería quedar disponible en:
```bash
http://localhost:3000
```

### 14.3 Usar el frontend
Abrir los archivos HTML de la carpeta `Frontend/` en el navegador, por ejemplo:

- `index.html`
- `reserva.html`
- `admin.html`

---

## 15. Puntos fuertes del proyecto

- Tiene una estructura clara entre frontend y backend.
- Permite gestión real de clientes y habitaciones.
- Incluye flujo de reservas con aprobación administrativa.
- Usa reglas de negocio para VIP y Normal.
- Tiene una interfaz visual atractiva para el público.
- Incluye panel de administración funcional.

---

## 16. Observaciones técnicas

- El proyecto tiene archivos duplicados dentro de `archivos duplicados/`, pero la versión principal y organizada está en `Frontend/` y `backend/`.
- Algunas funciones del frontend usan nombres de campos que deben coincidir con la base de datos.
- El login del panel está implementado de forma simple y solo valida `admin / 1234`.
- Prisma aparece en el proyecto, pero la implementación activa visible está basada en MySQL con `mysql2`.

---

## 17. Conclusión

Este proyecto representa un sistema hotelero completo a nivel académico o demostrativo.  
Permite mostrar cómo funciona la administración de un hotel desde una interfaz web conectada a una base de datos, combinando:

- presentación del negocio,
- reservas,
- administración interna,
- control de habitaciones,
- y gestión de solicitudes.

Es una buena base para una exposición porque permite explicar tanto la parte visual como la lógica del backend y la base de datos.
