const prisma = require('../prisma/client');

const MAX_HABITACIONES = 50;

const SERVICIOS_POR_TIPO = {
    Normal: ['WiFi', 'Baño privado', 'Aire acondicionado'],
    Deluxe: ['WiFi premium', 'Desayuno incluido', 'Acceso a piscina'],
    VIP:    ['WiFi premium', 'Desayuno buffet', 'Spa privado']
};

// OBTENER HABITACIONES
const obtenerHabitaciones = async (req, res) => {
    try {
        const habitaciones = await prisma.habitacion.findMany({
            include: {
                cliente: { select: { id: true, nombre: true } }
            },
            orderBy: { numero: 'asc' }
        });

        const resultado = habitaciones.map(h => ({
            id:        h.id,
            numero:    h.numero,
            tipo:      h.tipo,
            estado:    h.estado,
            servicios: h.servicios.length > 0 ? h.servicios : SERVICIOS_POR_TIPO[h.tipo],
            cliente:   h.cliente ? h.cliente.nombre : null
        }));

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener habitaciones' });
    }
};

// CREAR HABITACION
const crearHabitacion = async (req, res) => {
    const { numero, tipo, servicios } = req.body;

    try {
        const total = await prisma.habitacion.count();

        if (total >= MAX_HABITACIONES) {
            return res.status(400).json({
                error: `Máximo ${MAX_HABITACIONES} habitaciones permitidas`
            });
        }

        const serviciosFinales = Array.isArray(servicios) && servicios.length > 0
            ? servicios
            : SERVICIOS_POR_TIPO[tipo] || SERVICIOS_POR_TIPO.Normal;

        const habitacion = await prisma.habitacion.create({
            data: {
                numero:    Number(numero),
                tipo:      tipo || 'Normal',
                estado:    'Libre',
                servicios: serviciosFinales
            }
        });

        res.json(habitacion);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Ya existe una habitación con ese número' });
        }
        res.status(500).json({ error: 'Error al crear habitación' });
    }
};

// OCUPAR HABITACION
const ocuparHabitacion = async (req, res) => {
    const { numero, cliente_id } = req.body;

    try {
        const cliente = await prisma.cliente.findUnique({
            where: { id: Number(cliente_id) }
        });

        if (!cliente) return res.json({ error: 'Cliente no existe' });

        const habitacion = await prisma.habitacion.findUnique({
            where: { numero: Number(numero) }
        });

        if (!habitacion) return res.json({ error: 'Habitación no existe' });

        // Reglas VIP
        if (cliente.tipo === 'VIP' && habitacion.tipo !== 'VIP') {
            return res.json({ error: 'Cliente VIP solo puede usar habitaciones VIP' });
        }

        if (cliente.tipo === 'Normal' && habitacion.tipo === 'VIP') {
            return res.json({ error: 'Cliente Normal no puede usar habitación VIP' });
        }

        await prisma.habitacion.update({
            where: { numero: Number(numero) },
            data:  { estado: 'ocupada', clienteId: Number(cliente_id) }
        });

        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al ocupar habitación' });
    }
};

// LIBERAR HABITACION
const liberarHabitacion = async (req, res) => {
    const { numero } = req.body;

    try {
        await prisma.habitacion.update({
            where: { numero: Number(numero) },
            data:  { estado: 'Libre', clienteId: null }
        });

        res.json({ mensaje: 'Habitación liberada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al liberar habitación' });
    }
};

// ELIMINAR HABITACION
const eliminarHabitacion = async (req, res) => {
    const { id } = req.body;

    try {
        await prisma.habitacion.delete({
            where: { id: Number(id) }
        });

        res.json({ mensaje: 'Habitación eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar habitación' });
    }
};

module.exports = {
    obtenerHabitaciones,
    crearHabitacion,
    ocuparHabitacion,
    liberarHabitacion,
    eliminarHabitacion
};
