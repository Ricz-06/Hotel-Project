const db = require('../db');

// OBTENER
const obtenerHabitaciones = (req, res) => {
    db.query(`
        SELECT h.id, h.numero, h.tipo, h.estado, c.nombre AS cliente
        FROM habitaciones h
        LEFT JOIN clientes c ON h.cliente_id = c.id
    `, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// CREAR
const crearHabitacion = (req, res) => {
    const { numero, tipo, estado } = req.body;

    db.query(
        "INSERT INTO habitaciones (numero, tipo, estado) VALUES (?, ?, ?)",
        [numero, tipo, estado],
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.json({
                id: result.insertId,
                numero,
                tipo,
                estado
            });
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