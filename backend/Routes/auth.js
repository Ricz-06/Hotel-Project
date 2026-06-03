const express = require('express');
const router = express.Router();

const {
    registrar,
    login,
    verUsuarios
} = require('../controllers/authController');

router.post('/register', registrar);
router.post('/login',    login);
router.get('/usuarios',  verUsuarios); // sin password (como el PDF)

module.exports = router;
