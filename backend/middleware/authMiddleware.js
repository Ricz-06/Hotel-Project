const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  return next();
};

const requireRole = (roles) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const role = req.session.user.role;
    if (!allowed.includes(role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    return next();
  };
};

module.exports = { requireAuth, requireRole };

