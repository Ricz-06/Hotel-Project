const db = require('../db');

/* ================================
   CREAR SOLICITUD
================================ */

const crearSolicitud = (req, res) => {

    const {
        nombre,
        correo,
        telefono,
        tipo_habitacion
    } = req.body;

    db.query(

        `INSERT INTO solicitudes
        (nombre, correo, telefono, tipo_habitacion)
        VALUES (?, ?, ?, ?)`,

        [
            nombre,
            correo,
            telefono,
            tipo_habitacion
        ],

        (err, result) => {

            if (err)
                return res.status(500).json(err);

            res.json({
                mensaje: "Solicitud enviada"
            });
        }
    );
};

/* ================================
   OBTENER SOLICITUDES
================================ */

const obtenerSolicitudes = (req, res) => {

    db.query(
        "SELECT * FROM solicitudes ORDER BY id DESC",

        (err, results) => {

            if (err)
                return res.status(500).json(err);

            res.json(results);
        }
    );
};

/* ================================
   APROBAR SOLICITUD
================================ */

const aprobarSolicitud = (req, res) => {

    const id = req.params.id;

    db.query(

        "SELECT * FROM solicitudes WHERE id=?",

        [id],

        (err, solicitudRes) => {

            if (err)
                return res.status(500).json(err);

            if (solicitudRes.length === 0) {

                return res.json({
                    error: "Solicitud no encontrada"
                });
            }

            const solicitud = solicitudRes[0];

            /* CREAR CLIENTE */

            db.query(

                "INSERT INTO clientes (nombre, tipo) VALUES (?, ?)",

                [
                    solicitud.nombre,
                    solicitud.tipo_habitacion === "VIP"
                        ? "VIP"
                        : "Normal"
                ],

                (err, clienteRes) => {

                    if (err)
                        return res.status(500).json(err);

                    const clienteId = clienteRes.insertId;

                    /* BUSCAR HABITACION LIBRE */

                    db.query(

                        `SELECT * FROM habitaciones
                        WHERE tipo=?
                        AND estado='Libre'
                        LIMIT 1`,

                        [solicitud.tipo_habitacion],

                        (err, habitacionRes) => {

                            if (err)
                                return res.status(500).json(err);

                            if (habitacionRes.length === 0) {

                                return res.json({
                                    error: "No hay habitaciones libres"
                                });
                            }

                            const habitacion = habitacionRes[0];

                            /* ASIGNAR HABITACION */

                            db.query(

                                `UPDATE habitaciones
                                SET estado='ocupada',
                                cliente_id=?
                                WHERE id=?`,

                                [
                                    clienteId,
                                    habitacion.id
                                ],

                                (err) => {

                                    if (err)
                                        return res.status(500).json(err);

                                    /* ELIMINAR SOLICITUD */

                                    db.query(

                                        `DELETE FROM solicitudes
                                        WHERE id=?`,

                                        [id],

                                        (err) => {

                                            if (err)
                                                return res.status(500).json(err);

                                            res.json({
                                                mensaje:
                                                "Solicitud aprobada y eliminada"
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

/* ================================
   RECHAZAR SOLICITUD
================================ */

const rechazarSolicitud = (req, res) => {

    const id = req.params.id;

    db.query(

        `DELETE FROM solicitudes
        WHERE id=?`,

        [id],

        (err) => {

            if (err)
                return res.status(500).json(err);

            res.json({
                mensaje: "Solicitud rechazada"
            });
        }
    );
};

module.exports = {

    crearSolicitud,
    obtenerSolicitudes,
    aprobarSolicitud,
    rechazarSolicitud
};