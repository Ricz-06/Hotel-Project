const prisma = require('../prisma/client');
const enviarCorreo = require('../utils/mailer');

// ================================
// CREAR SOLICITUD
// ================================
const crearSolicitud = async (req, res) => {
    const { nombre, correo, telefono, tipo_habitacion } = req.body;
    try {
        const solicitud = await prisma.solicitud.create({
            data: { nombre, correo, telefono, tipo_habitacion }
        });
        res.json({ mensaje: "Solicitud enviada", solicitud });
    } catch (error) {
        res.status(500).json({ error: "Error al crear solicitud" });
    }
};

// ================================
// OBTENER SOLICITUDES
// ================================
const obtenerSolicitudes = async (req, res) => {
    try {
        const solicitudes = await prisma.solicitud.findMany({
            orderBy: { id: 'desc' }
        });
        res.json(solicitudes);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener solicitudes" });
    }
};

// ================================
// APROBAR SOLICITUD (Versión Robusta)
// ================================
const aprobarSolicitud = async (req, res) => {
    const id = Number(req.params.id);

    try {
        const solicitud = await prisma.solicitud.findUnique({ where: { id } });
        if (!solicitud) return res.json({ error: "Solicitud no encontrada" });

        const mapaTipos = { 'NORMAL': 'Normal', 'DELUXE': 'Deluxe', 'VIP': 'VIP' };
        const tipoNormalizado = mapaTipos[solicitud.tipo_habitacion.toUpperCase()] || 'Normal';

        const habitacion = await prisma.habitacion.findFirst({
            where: { tipo: tipoNormalizado, estado: 'Libre' }
        });

        if (!habitacion) return res.json({ error: "No hay habitaciones libres de ese tipo" });

        const cliente = await prisma.cliente.create({
            data: { nombre: solicitud.nombre, tipo: tipoNormalizado }
        });

        await prisma.habitacion.update({
            where: { id: habitacion.id },
            data: { estado: 'ocupada', clienteId: cliente.id }
        });

        // 📧 Envío de correo (Protegido)
        try {
            await enviarCorreo(
                solicitud.correo,
                "Reserva Aprobada - Hotel Transilvania",
                `Hola ${solicitud.nombre}, tu reserva para ${solicitud.tipo_habitacion} fue aprobada.`
            );
        } catch (mailError) {
            console.error("⚠️ Error enviando correo (la reserva sigue siendo válida):", mailError.message);
        }

        await prisma.solicitud.delete({ where: { id } });
        res.json({ mensaje: "Solicitud aprobada" });

    } catch (error) {
        console.error("❌ Error crítico al aprobar:", error);
        res.status(500).json({ error: "Error interno al procesar la reserva" });
    }
};

// ================================
// RECHAZAR SOLICITUD
// ================================
const rechazarSolicitud = async (req, res) => {
    const id = Number(req.params.id);
    try {
        await prisma.solicitud.delete({ where: { id } });
        res.json({ mensaje: "Solicitud rechazada" });
    } catch (error) {
        res.status(500).json({ error: "Error al rechazar solicitud" });
    }
};

module.exports = {
    crearSolicitud,
    obtenerSolicitudes,
    aprobarSolicitud,
    rechazarSolicitud
};