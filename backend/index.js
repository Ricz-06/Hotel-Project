const express = require('express');
const cors    = require('cors');
const prisma  = require('./prisma/client');
const session = require('express-session');
const cookieParser = require('cookie-parser');

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

app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'hotel_aurora_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    }
}));
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

const { requireRole, requireAuth } = require('./middleware/authMiddleware');
const requireAdmin = requireRole('ADMIN');

const recoverRoutes = require('./Routes/recover');
app.use('/', recoverRoutes);




/* ================= PERFIL ================= */
app.get('/me', requireAuth, (req, res) => {
    res.json({
        user: req.session.user
    });
});

app.get('/mis-solicitudes', requireAuth, async (req, res) => {
    try {
        const correo = req.session.user?.correo;
        if (!correo) {
            return res.status(400).json({ error: 'No hay correo en sesión' });
        }

        const solicitudes = await prisma.solicitud.findMany({
            where: { correo },
            orderBy: { id: 'desc' }
        });

        res.json({ solicitudes });
    } catch (e) {
        res.status(500).json({ error: 'Error al obtener solicitudes del usuario' });
    }
});



/* ================= CLIENTES ================= */

app.get('/clientes', requireAdmin, obtenerClientes);
app.post('/clientes', requireAdmin, crearCliente);
app.post('/clientes/eliminar', requireAdmin, eliminarCliente);
app.put('/clientes/actualizar', requireAdmin, actualizarCliente);


/* ================= HABITACIONES ================= */

app.get('/habitaciones',            obtenerHabitaciones);

app.post('/habitaciones',           requireAdmin, crearHabitacion);
app.put('/habitaciones/ocupar',     requireAdmin, ocuparHabitacion);
app.put('/habitaciones/liberar',    requireAdmin, liberarHabitacion);
app.post('/habitaciones/eliminar',  requireAdmin, eliminarHabitacion);


/* ================= SOLICITUDES ================= */

app.get('/solicitudes',                 requireAdmin, obtenerSolicitudes);
app.post('/solicitudes',                crearSolicitud);

app.put('/solicitudes/aprobar/:id',     requireAdmin, aprobarSolicitud);
app.put('/solicitudes/rechazar/:id',    requireAdmin, rechazarSolicitud);


/* ================= FACTURAS ================= */

app.get('/facturas',   obtenerFacturas);
app.post('/facturas',  crearFactura);

/* ================= RESET ================= */


app.post('/reset', requireAdmin, async (req, res) => {

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