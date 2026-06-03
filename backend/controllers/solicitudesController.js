const prisma = require('../prisma/client');

// ================================
// CREAR SOLICITUD
// ================================

const crearSolicitud = async (req, res) => {
    const {
        nombre,
        correo,
        telefono,
        tipo_habitacion
    } = req.body;

    try {
        const solicitud = await prisma.solicitud.create({
            data: {
                nombre,
                correo,
                telefono,
                tipo_habitacion
            }
        });

        res.json({
            mensaje: "Solicitud enviada",
            solicitud
        });

    } catch (error) {
        res.status(500).json({
            error: "Error al crear solicitud"
        });
    }
};

// ================================
// OBTENER SOLICITUDES
// ================================

const obtenerSolicitudes = async (req, res) => {
    try {
        const solicitudes = await prisma.solicitud.findMany({
            orderBy: {
                id: 'desc'
            }
        });

        res.json(solicitudes);

    } catch (error) {
        res.status(500).json({
            error: "Error al obtener solicitudes"
        });
    }
};

// ================================
// APROBAR SOLICITUD
// ================================

const aprobarSolicitud = async (req, res) => {

    const id = Number(req.params.id);

    try {

        const solicitud = await prisma.solicitud.findUnique({
            where: { id }
        });

        if (!solicitud) {
            return res.json({
                error: "Solicitud no encontrada"
            });
        }

        const cliente = await prisma.cliente.create({
            data: {
                nombre: solicitud.nombre,
                tipo: solicitud.tipo_habitacion === 'VIP'
                    ? 'VIP'
                    : solicitud.tipo_habitacion === 'Deluxe'
                    ? 'Deluxe'
                    : 'Normal'
            }
        });

        const habitacion = await prisma.habitacion.findFirst({
            where: {
                tipo: solicitud.tipo_habitacion,
                estado: 'Libre'
            }
        });

        if (!habitacion) {
            return res.json({
                error: "No hay habitaciones libres"
            });
        }

        await prisma.habitacion.update({
            where: {
                id: habitacion.id
            },
            data: {
                estado: 'ocupada',
                clienteId: cliente.id
            }
        });

        await prisma.solicitud.delete({
            where: { id }
        });

        res.json({
            mensaje: "Solicitud aprobada y eliminada"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error al aprobar solicitud"
        });
    }
};

// ================================
// RECHAZAR SOLICITUD
// ================================

const rechazarSolicitud = async (req, res) => {

    const id = Number(req.params.id);

    try {

        await prisma.solicitud.delete({
            where: { id }
        });

        res.json({
            mensaje: "Solicitud rechazada"
        });

    } catch (error) {

        res.status(500).json({
            error: "Error al rechazar solicitud"
        });
    }
};

module.exports = {
    crearSolicitud,
    obtenerSolicitudes,
    aprobarSolicitud,
    rechazarSolicitud
};