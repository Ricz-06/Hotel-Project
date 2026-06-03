const express = require('express');
const router = express.Router();

const {
    crearFactura,
    obtenerFacturas
} = require('../controllers/facturasController');

router.get('/',  obtenerFacturas);
router.post('/', crearFactura);

module.exports = router;
