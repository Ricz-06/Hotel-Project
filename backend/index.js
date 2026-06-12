require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const prisma  = require('./prisma/client');

const { requireAuth, requireRole } = require('./middleware/authMiddleware');
const requireAdmin = requireRole('ADMIN');

const { registrar, login, verUsuarios } = require('./controllers/authController');
const { obtenerClientes, crearCliente, eliminarCliente, actualizarCliente } = require('./controllers/clientesController');
const { obtenerHabitaciones, crearHabitacion, ocuparHabitacion, liberarHabitacion, eliminarHabitacion } = require('./controllers/habitacionesController');
const { crearSolicitud, obtenerSolicitudes, aprobarSolicitud, rechazarSolicitud } = require('./controllers/solicitudesController');
const { crearFactura, obtenerFacturas, obtenerMisFacturas } = require('./controllers/facturasController');

/* ================= APP ================= */

const app  = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS CORREGIDO: acepta cualquier puerto de Live Server y también sin origin (Postman, etc.)
const allowedOrigins = [
    'http://localhost:5500', 'http://127.0.0.1:5500',
    'http://localhost:5501', 'http://127.0.0.1:5501',
    'http://localhost:5502', 'http://127.0.0.1:5502',
    'http://localhost:5503', 'http://127.0.0.1:5503',
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS bloqueado para origen: ' + origin));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= RUTAS DE AUTENTICACIÓN ================= */

app.post('/register', registrar);
app.post('/login',    login);
app.get('/usuarios',  requireAdmin, verUsuarios);

app.get('/me', requireAuth, (req, res) => {
    return res.json({ user: req.user });
});

// ✅ RUTA /logout AGREGADA (faltaba completamente, causaba 404 silencioso)
app.post('/logout', requireAuth, (req, res) => {
    return res.json({ success: true, mensaje: 'Sesión cerrada correctamente' });
});

/* ================= CLIENTES ================= */

app.get('/clientes',           requireAdmin, obtenerClientes);
app.post('/clientes',          requireAdmin, crearCliente);
app.post('/clientes/eliminar', requireAdmin, eliminarCliente);
app.put('/clientes/actualizar', requireAdmin, actualizarCliente);

/* ================= HABITACIONES ================= */

app.get('/habitaciones',           obtenerHabitaciones);
app.post('/habitaciones',          requireAdmin, crearHabitacion);
app.put('/habitaciones/ocupar',    requireAdmin, ocuparHabitacion);
app.put('/habitaciones/liberar',   requireAdmin, liberarHabitacion);
app.post('/habitaciones/eliminar', requireAdmin, eliminarHabitacion);

/* ================= SOLICITUDES / RESERVAS ================= */

app.post('/solicitudes', crearSolicitud);
app.get('/solicitudes',  requireAdmin, obtenerSolicitudes);
app.put('/solicitudes/aprobar/:id',  requireAdmin, aprobarSolicitud);
app.put('/solicitudes/rechazar/:id', requireAdmin, rechazarSolicitud);

app.get('/mis-solicitudes', requireAuth, async (req, res) => {
    try {
        const sol = await prisma.solicitud.findMany({
            where: { correo: req.user.correo }
        });

        // ✅ CORREGIDO: req.user.nombre ahora existe porque se incluye en el JWT
        const hab = await prisma.habitacion.findMany({
            where: {
                cliente: {
                    nombre: req.user.nombre
                }
            }
        });

        res.json({
            solicitudes: sol,
            habitacionesOcupadas: hab
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});

/* ================= FACTURAS ================= */

app.get('/facturas',     requireAdmin, obtenerFacturas);
app.post('/facturas',    crearFactura);
app.get('/mis-facturas', requireAuth, obtenerMisFacturas);

/* ================= RESET TOTAL DEL SISTEMA ================= */

app.post('/reset', requireAdmin, async (req, res) => {
    try {
        await prisma.factura.deleteMany();
        await prisma.solicitud.deleteMany();
        await prisma.habitacion.deleteMany();
        await prisma.cliente.deleteMany();
        res.json({ mensaje: 'Sistema reiniciado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al reiniciar la base de datos' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://127.0.0.1:${PORT}`);
});