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
        console.error("Error al guardar factura:", error);
        res.status(500).json({ error: 'Error al guardar factura' });
    }
};

// OBTENER FACTURAS (Admin)
const obtenerFacturas = async (req, res) => {
    try {
        const facturas = await prisma.factura.findMany({
            orderBy: { creadoEn: 'desc' }
        });

        res.json(facturas);
    } catch (error) {
        console.error("Error al obtener facturas:", error);
        res.status(500).json({ error: 'Error al obtener facturas' });
    }
};

// ================================
// OBTENER FACTURAS DE MI CUENTA
// ================================
const obtenerMisFacturas = async (req, res) => {
    try {
        // CORRECCIÓN: Usamos req.user porque es donde el middleware 'requireAuth' 
        // guarda la información tras verificar el token JWT.
        const correoUsuario = req.user ? req.user.correo : null;

        if (!correoUsuario) {
            return res.status(401).json({ error: 'No autorizado: correo no encontrado' });
        }

        const facturas = await prisma.factura.findMany({
            where: { correo: correoUsuario },
            orderBy: { creadoEn: 'desc' }
        });

        return res.json(facturas);
    } catch (error) {
        console.error("Error al obtener mis facturas:", error);
        return res.status(500).json({ error: 'Error al obtener mis facturas' });
    }
};

module.exports = { crearFactura, obtenerFacturas, obtenerMisFacturas };