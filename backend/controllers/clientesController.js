const prisma = require('../prisma/client');

// OBTENER CLIENTES
const obtenerClientes = async (req, res) => {
    try {
        const clientes = await prisma.cliente.findMany({
            orderBy: { id: 'asc' }
        });
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
};

// CREAR CLIENTE
const crearCliente = async (req, res) => {
    const { nombre, tipo } = req.body;

    try {
        const cliente = await prisma.cliente.create({
            data: { nombre, tipo: tipo || 'Normal' }
        });
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear cliente' });
    }
};

// ELIMINAR CLIENTE
const eliminarCliente = async (req, res) => {
    const { id } = req.body;

    try {
        // Liberar habitaciones del cliente antes de eliminarlo
        await prisma.habitacion.updateMany({
            where: { clienteId: Number(id) },
            data:  { clienteId: null, estado: 'Libre' }
        });

        await prisma.cliente.delete({
            where: { id: Number(id) }
        });

        res.json({ mensaje: 'Cliente eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar cliente' });
    }
};

// ACTUALIZAR TIPO DE CLIENTE
const actualizarCliente = async (req, res) => {
    const { id, tipo } = req.body;

    try {
        const cliente = await prisma.cliente.update({
            where: { id: Number(id) },
            data:  { tipo }
        });
        res.json({ mensaje: 'Cliente actualizado', cliente });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar cliente' });
    }
};

module.exports = {
    obtenerClientes,
    crearCliente,
    eliminarCliente,
    actualizarCliente
};
