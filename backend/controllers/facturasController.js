const db = require('../db');

/* =========================
   CREAR FACTURA
========================= */

const crearFactura = (req, res) => {

    const {
        cliente,
        correo,
        telefono,
        servicio,
        subtotal,
        iva,
        total
    } = req.body;

    db.query(

        `INSERT INTO facturas
        (cliente, correo, telefono, servicio, subtotal, iva, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,

        [
            cliente,
            correo,
            telefono,
            servicio,
            subtotal,
            iva,
            total
        ],

        (err, result) => {

            if (err)
                return res.status(500).json(err);

            res.json({
                mensaje: "Factura guardada"
            });
        }
    );
};

module.exports = {
    crearFactura
};