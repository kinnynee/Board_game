const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'board-game-secret';

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await db('users').where({ id: payload.userId }).first();

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access is required.' });
  }

  return next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  JWT_SECRET,
};
