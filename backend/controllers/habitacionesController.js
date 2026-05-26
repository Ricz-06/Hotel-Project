const db = require('../db');

const MAX_HABITACIONES = 50;

const SERVICIOS_POR_TIPO = {
    Normal: ['WiFi', 'Baño privado', 'Aire acondicionado'],
    Deluxe: ['WiFi premium', 'Desayuno incluido', 'Acceso a piscina'],
    VIP: ['WiFi premium', 'Desayuno buffet', 'Spa privado']
};

function obtenerServiciosPorTipo(tipo) {
    return SERVICIOS_POR_TIPO[tipo] || SERVICIOS_POR_TIPO.Normal;
}

function parseServicios(servicios, tipo) {
    if (!servicios) {
        return obtenerServiciosPorTipo(tipo);
    }

    if (Array.isArray(servicios)) {
        return servicios.slice(0, 3);
    }

    try {
        const parsed = JSON.parse(servicios);

        if (Array.isArray(parsed)) {
            return parsed.slice(0, 3);
        }
    } catch (error) {
        // fallback abajo
    }

    if (typeof servicios === 'string') {
        const lista = servicios
            .split(',')
            .map((servicio) => servicio.trim())
            .filter(Boolean);

        if (lista.length > 0) {
            return lista.slice(0, 3);
        }
    }

    return obtenerServiciosPorTipo(tipo);
}

function normalizarServicios(servicios, tipo) {
    const lista = parseServicios(servicios, tipo);

    while (lista.length < 3) {
        lista.push(obtenerServiciosPorTipo(tipo)[lista.length]);
    }

    return lista.slice(0, 3);
}

function formatearHabitaciones(results) {
    return results.map((habitacion) => ({
        ...habitacion,
        servicios: parseServicios(habitacion.servicios, habitacion.tipo)
    }));
}

// OBTENER
const obtenerHabitaciones = (req, res) => {
    db.query(
        `
        SELECT h.id, h.numero, h.tipo, h.estado, h.servicios, c.nombre AS cliente
        FROM habitaciones h
        LEFT JOIN clientes c ON h.cliente_id = c.id
        `,
        (err, results) => {
            if (!err) {
                return res.json(formatearHabitaciones(results));
            }

            db.query(
                `
                SELECT h.id, h.numero, h.tipo, h.estado, c.nombre AS cliente
                FROM habitaciones h
                LEFT JOIN clientes c ON h.cliente_id = c.id
                `,
                (fallbackErr, fallbackResults) => {
                    if (fallbackErr) return res.status(500).json(fallbackErr);

                    const habitaciones = fallbackResults.map((habitacion) => ({
                        ...habitacion,
                        servicios: obtenerServiciosPorTipo(habitacion.tipo)
                    }));

                    res.json(habitaciones);
                }
            );
        }
    );
};

function insertarHabitacionConFallback(res, datosBase, serviciosNormalizados) {
    db.query(
        "INSERT INTO habitaciones (numero, tipo, estado, servicios) VALUES (?, ?, ?, ?)",
        [...datosBase, serviciosNormalizados],
        (err, result) => {
            if (!err) {
                return res.json({
                    id: result.insertId,
                    numero: datosBase[0],
                    tipo: datosBase[1],
                    estado: datosBase[2],
                    servicios: JSON.parse(serviciosNormalizados)
                });
            }

            const esErrorDeColumna = err.code === 'ER_BAD_FIELD_ERROR' || /Unknown column/i.test(err.message || '');

            if (!esErrorDeColumna) {
                return res.status(500).json(err);
            }

            db.query(
                "INSERT INTO habitaciones (numero, tipo, estado) VALUES (?, ?, ?)",
                datosBase,
                (fallbackErr, fallbackResult) => {
                    if (fallbackErr) return res.status(500).json(fallbackErr);

                    res.json({
                        id: fallbackResult.insertId,
                        numero: datosBase[0],
                        tipo: datosBase[1],
                        estado: datosBase[2],
                        servicios: JSON.parse(serviciosNormalizados)
                    });
                }
            );
        }
    );
}

// CREAR
const crearHabitacion = (req, res) => {
    const { numero, tipo, estado, servicios } = req.body;
    const serviciosNormalizados = JSON.stringify(normalizarServicios(servicios, tipo));

    db.query(
        "SELECT COUNT(*) AS total FROM habitaciones",
        (countErr, countRes) => {
            if (countErr) return res.status(500).json(countErr);

            const totalHabitaciones = countRes[0].total;

            if (totalHabitaciones >= MAX_HABITACIONES) {
                return res.status(400).json({
                    error: `No se pueden crear más de ${MAX_HABITACIONES} habitaciones`
                });
            }

            insertarHabitacionConFallback(
                res,
                [numero, tipo, estado],
                serviciosNormalizados
            );
        }
    );
};

// OCUPAR (con validación VIP)
const ocuparHabitacion = (req, res) => {
    const { numero, cliente_id } = req.body;

    if (!numero || !cliente_id) {
        return res.status(400).json({ error: "Faltan datos" });
    }

    db.query("SELECT tipo FROM clientes WHERE id=?", [cliente_id], (err, cRes) => {
        if (err) return res.status(500).json(err);
        if (cRes.length === 0) return res.json({ error: "Cliente no existe" });

        const tipoCliente = cRes[0].tipo;

        db.query("SELECT tipo FROM habitaciones WHERE numero=?", [numero], (err, hRes) => {
            if (err) return res.status(500).json(err);
            if (hRes.length === 0) return res.json({ error: "Habitación no existe" });

            const tipoHabitacion = hRes[0].tipo;

            if (tipoCliente === "VIP" && tipoHabitacion !== "VIP") {
                return res.json({ error: "VIP solo en VIP" });
            }

            if (tipoCliente === "Normal" && tipoHabitacion === "VIP") {
                return res.json({ error: "Normal no puede usar VIP" });
            }

            db.query(
                "UPDATE habitaciones SET estado='ocupada', cliente_id=? WHERE numero=?",
                [cliente_id, numero],
                (err) => {
                    if (err) return res.status(500).json(err);
                    res.json({ ok: true });
                }
            );
        });
    });
};

// LIBERAR
const liberarHabitacion = (req, res) => {
    const { numero } = req.body;

    db.query(
        "UPDATE habitaciones SET estado='Libre', cliente_id=NULL WHERE numero=?",
        [numero],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ mensaje: "liberada" });
        }
    );
};

// ELIMINAR
const eliminarHabitacion = (req, res) => {
    const { id } = req.body;

    db.query(
        "DELETE FROM habitaciones WHERE id=?",
        [id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ mensaje: "eliminada" });
        }
    );
};

module.exports = {
    obtenerHabitaciones,
    crearHabitacion,
    ocuparHabitacion,
    liberarHabitacion,
    eliminarHabitacion
};
