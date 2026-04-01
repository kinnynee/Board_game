const adminService = require('../services/adminService');
const createHttpError = require('../utils/httpError');

async function getDashboardStats(req, res) {
  const stats = await adminService.getDashboardStats();
  res.json(stats);
}

async function listUsers(req, res) {
  const users = await adminService.listAllUsers();
  res.json(users);
}

async function updateUser(req, res) {
  const { id } = req.params;
  const { role, is_active } = req.body;

  if (id === req.user.id) {
    throw createHttpError(403, 'You cannot update your own profile role or status from the admin dashboard.');
  }

  const user = await adminService.updateUser(id, { role, is_active });
  res.json(user);
}

async function listGames(req, res) {
  const games = await adminService.listAllGames();
  res.json(games);
}

async function updateGame(req, res) {
  const { id } = req.params;
  const game = await adminService.updateGame(id, req.body);
  res.json(game);
}

module.exports = {
  getDashboardStats,
  listUsers,
  updateUser,
  listGames,
  updateGame,
};
