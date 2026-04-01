const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'board-game-secret';

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await userService.findActiveUserById(payload.userId);

    if (!user) {
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
  auth: requireAuth,
  requireAuth,
  requireAdmin,
  JWT_SECRET,
};
