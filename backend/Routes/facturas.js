const express = require('express');

const router = express.Router();

const {
    crearFactura
} = require('../controllers/facturasController');

router.post('/', crearFactura);

module.exports = router;