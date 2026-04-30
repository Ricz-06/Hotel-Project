const express = require('express');
const router = express.Router();

const {
    obtenerHabitaciones,
    crearHabitacion,
    ocuparHabitacion,
    liberarHabitacion,
    eliminarHabitacion
} = require('../controllers/habitacionesController');

router.get('/', obtenerHabitaciones);
router.post('/', crearHabitacion);
router.put('/ocupar', ocuparHabitacion);
router.put('/liberar', liberarHabitacion);
router.post('/eliminar', eliminarHabitacion);

module.exports = router;