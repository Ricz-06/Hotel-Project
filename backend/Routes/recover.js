const express = require('express');
const router = express.Router();

const prisma = require('../prisma/client');

// Recuperar/validar cuenta (solo verifica si existe)
router.post('/recover', async (req, res) => {
  const { usuario, correo } = req.body || {};

  const correoFinal = (correo || usuario || '').trim();
  if (!correoFinal) {
    return res.status(400).json({ error: 'Faltan datos para recuperar' });
  }

  try {
    const user = await prisma.usuario.findUnique({
      where: { correo: correoFinal }
    });

    if (!user) {
      return res.status(404).json({ error: 'No existe la cuenta' });
    }

    // Aquí normalmente se enviaría un email. Para tu caso solo validamos.
    return res.json({ mensaje: 'Cuenta verificada' });
  } catch (e) {
    return res.status(500).json({ error: 'Error al recuperar' });
  }
});

module.exports = router;

