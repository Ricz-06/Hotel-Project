const express = require('express');
const router = express.Router();

const {
    crearSolicitud,
    obtenerSolicitudes,
    aprobarSolicitud,
    rechazarSolicitud
} = require('../controllers/solicitudesController');

router.post('/', crearSolicitud);

router.get('/', obtenerSolicitudes);

router.put('/aprobar/:id', aprobarSolicitud);

router.put('/rechazar/:id', rechazarSolicitud);

module.exports = router;