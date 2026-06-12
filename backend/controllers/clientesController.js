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
    // Normalizamos el tipo para evitar problemas con Enums de Prisma
    const tipoNormalizado = tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase() : 'Normal';

    try {
        const cliente = await prisma.cliente.create({
            data: { nombre, tipo: tipoNormalizado }
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
        await prisma.$transaction([
            prisma.habitacion.updateMany({
                where: { clienteId: Number(id) },
                data:  { clienteId: null, estado: 'Libre' }
            }),
            prisma.cliente.delete({
                where: { id: Number(id) }
            })
        ]);

        res.json({ mensaje: 'Cliente eliminado correctamente' });
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