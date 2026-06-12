const jwt = require('jsonwebtoken');

// Clave secreta para desencriptar y validar el token
const JWT_SECRET = process.env.JWT_SECRET || 'TuClaveSecretaSuperSegura';

// 1. Candado general: Verifica que el usuario tenga un token válido
const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrae el token del formato "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Guardamos los datos del usuario (id, correo, role) en el req para usarlo luego
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'No autorizado' });
  }
};

// 2. Candado de Roles: Bloquea a usuarios comunes si intentan consumir endpoints de admin.html
const requireRole = (roles) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      // Extraemos el rol directamente desde el contenido del JWT descifrado
      const role = decoded.role;
      if (!allowed.includes(role)) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ error: 'No autorizado' });
    }
  };
};

module.exports = { requireAuth, requireRole };