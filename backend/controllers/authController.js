const authService = require('../services/authService');

async function register(req, res) {
  const payload = await authService.registerUser(req.body);
  return res.status(201).json(payload);
}

async function login(req, res) {
  const payload = await authService.loginUser(req.body);
  return res.json(payload);
}

async function getMe(req, res) {
  return res.json(authService.getCurrentUser(req.user));
}

module.exports = {
  register,
  login,
  getMe,
};
