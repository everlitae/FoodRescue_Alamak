const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'Token tidak ada, akses ditolak' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia123');
    req.user = { ...decoded, _id: decoded.id };
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token tidak valid' });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Akses admin saja' });
    }
    next();
  });
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: 'Token tidak ada, akses ditolak' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      msg: `Akses ditolak. Role yang diizinkan: ${roles.join(', ')}`
    });
  }
  next();
};

module.exports = { auth, protect: auth, adminAuth, requireRole };