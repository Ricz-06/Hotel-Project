const express = require('express');
const cors    = require('cors');
const prisma  = require('./prisma/client');

const {
    registrar,
    login,
    verUsuarios
} = require('./controllers/authController');

const {
    obtenerClientes,
    crearCliente,
    eliminarCliente,
    actualizarCliente
} = require('./controllers/clientesController');

const {
    obtenerHabitaciones,
    crearHabitacion,
    ocuparHabitacion,
    liberarHabitacion,
    eliminarHabitacion
} = require('./controllers/habitacionesController');

const {
    crearSolicitud,
    obtenerSolicitudes,
    aprobarSolicitud,
    rechazarSolicitud
} = require('./controllers/solicitudesController');

const {
    crearFactura,
    obtenerFacturas
} = require('./controllers/facturasController');

/* ================= APP ================= */

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🟢 SOLUCIÓN AL "CANNOT GET /": Ruta inicial de bienvenida
app.get('/', (req, res) => {
    res.json({
        mensaje: "🏨 API de Hotel Transilvania corriendo con éxito",
        estado: "Online",
        fecha: new Date()
    });
});

/* ================= AUTH ================= */

app.post('/registrar',   registrar);
app.post('/login',       login);
app.get('/db-users',     verUsuarios);

/* ================= CLIENTES ================= */

app.get('/clientes',           obtenerClientes);
app.post('/clientes',          crearCliente);
app.post('/clientes/eliminar', eliminarCliente);
app.put('/clientes/actualizar', actualizarCliente);

/* ================= HABITACIONES ================= */

app.get('/habitaciones',            obtenerHabitaciones);
app.post('/habitaciones',           crearHabitacion);
app.put('/habitaciones/ocupar',     ocuparHabitacion);
app.put('/habitaciones/liberar',    liberarHabitacion);
app.post('/habitaciones/eliminar',  eliminarHabitacion);

/* ================= SOLICITUDES ================= */

app.get('/solicitudes',                 obtenerSolicitudes);
app.post('/solicitudes',                crearSolicitud);
app.put('/solicitudes/aprobar/:id',     aprobarSolicitud);
app.put('/solicitudes/rechazar/:id',    rechazarSolicitud);

/* ================= FACTURAS ================= */

app.get('/facturas',   obtenerFacturas);
app.post('/facturas',  crearFactura);

/* ================= RESET ================= */

app.post('/reset', async (req, res) => {
    try {
        await prisma.factura.deleteMany();
        await prisma.solicitud.deleteMany();
        await prisma.habitacion.deleteMany();
        await prisma.cliente.deleteMany();

        res.json({ mensaje: 'Sistema reiniciado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al reiniciar' });
    }
});

/* ================= START ================= */

app.listen(PORT, () => {
    console.log(`🏨 Hotel Transilvania API corriendo en http://localhost:${PORT}`);
});