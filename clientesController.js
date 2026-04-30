const db = require('../db');

// OBTENER CLIENTES
const obtenerClientes = (req, res) => {
    db.query('SELECT * FROM clientes', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// CREAR CLIENTE
const crearCliente = (req, res) => {
    const { nombre, tipo } = req.body;

    db.query(
        "INSERT INTO clientes (nombre, tipo) VALUES (?, ?)",
        [nombre, tipo],
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.json({
                id: result.insertId,
                nombre,
                tipo
            });
        }
    );
};

// ELIMINAR CLIENTE
const eliminarCliente = (req, res) => {
    const { id } = req.body;

    db.query(
        "DELETE FROM clientes WHERE id=?",
        [id],
        (err) => {
            if (err) return res.status(500).json(err);

            res.json({ mensaje: "Cliente eliminado" });
        }
    );
};

// ACTUALIZAR CLIENTE
const actualizarCliente = (req, res) => {
    const { id, tipo } = req.body;

    db.query(
        "UPDATE clientes SET tipo=? WHERE id=?",
        [tipo, id],
        (err) => {
            if (err) return res.status(500).json(err);

            res.json({ mensaje: "Cliente actualizado" });
        }
    );
};

module.exports = {
    obtenerClientes,
    crearCliente,
    eliminarCliente,
    actualizarCliente
};