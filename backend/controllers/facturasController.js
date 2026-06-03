const prisma = require('../prisma/client');

// CREAR FACTURA
const crearFactura = async (req, res) => {
    const { cliente, correo, telefono, servicio, subtotal, iva, total } = req.body;

    try {
        const factura = await prisma.factura.create({
            data: {
                cliente,
                correo,
                telefono,
                servicio,
                subtotal: Number(subtotal),
                iva:      Number(iva),
                total:    Number(total)
            }
        });

        res.json({ mensaje: 'Factura guardada', factura });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar factura' });
    }
};

// OBTENER FACTURAS
const obtenerFacturas = async (req, res) => {
    try {
        const facturas = await prisma.factura.findMany({
            orderBy: { creadoEn: 'desc' }
        });

        res.json(facturas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener facturas' });
    }
};

module.exports = { crearFactura, obtenerFacturas };
