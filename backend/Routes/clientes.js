const express = require('express');
const router = express.Router();

const {
    obtenerClientes,
    crearCliente,
    eliminarCliente,
    actualizarCliente
} = require('../controllers/clientesController');

router.get('/', obtenerClientes);
router.post('/', crearCliente);
router.post('/eliminar', eliminarCliente);
router.put('/actualizar', actualizarCliente);

module.exports = router;