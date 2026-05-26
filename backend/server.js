const express = require('express');
const cors = require('cors');
const db = require('./db');

/* =========================================================
   🟢 CREAR APP (PRIMERO SIEMPRE)
   ========================================================= */
const app = express();

/* =========================================================
   🟢 MIDDLEWARES
   ========================================================= */
app.use(cors());
app.use(express.json());

/* =========================================================
   🟢 RUTAS AUTH
   ========================================================= */
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

/* =========================================================
   🟢 RUTA PRINCIPAL
   ========================================================= */
app.get('/', (req, res) => {
    res.send('Servidor funcionando 🚀');
});

/* =========================================================
   🟢 RUTAS CLIENTES
   ========================================================= */
const clientesRoutes = require('./routes/clientes');
app.use('/clientes', clientesRoutes);

/* =========================================================
   🟢 RUTAS HABITACIONES
   ========================================================= */
const habitacionesRoutes = require('./routes/habitaciones');
app.use('/habitaciones', habitacionesRoutes);

/* =========================================================
   🟢 RUTAS SOLICITUDES
========================================================= */

const solicitudesRoutes = require('./routes/solicitudes');

app.use('/solicitudes', solicitudesRoutes);

/* =========================================================
   🔥 RESET TOTAL DEL SISTEMA
   ========================================================= */
app.post('/reset', (req, res) => {

    db.query("SET FOREIGN_KEY_CHECKS = 0", (err) => {
        if (err) return res.status(500).json(err);

        db.query("TRUNCATE TABLE habitaciones", (err) => {
            if (err) return res.status(500).json(err);

            db.query("TRUNCATE TABLE clientes", (err) => {
                if (err) return res.status(500).json(err);

                db.query("SET FOREIGN_KEY_CHECKS = 1", (err) => {
                    if (err) return res.status(500).json(err);

                    res.json({
                        mensaje: "Sistema reseteado correctamente 🚀"
                    });
                });
            });
        });
    });
});

/* =========================================================
   🟢 INICIAR SERVIDOR
   ========================================================= */
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});