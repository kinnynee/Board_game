const userService = require('../services/userService');

async function getOwnProfile(req, res) {
  const profile = await userService.getOwnProfile(req.user.id);
  return res.json(profile);
}

async function searchUsers(req, res) {
  const users = await userService.searchUsers(req.query);
  return res.json(users);
}

async function getProfile(req, res) {
  const profile = await userService.getProfileForViewer(req.params.id, req.user);
  return res.json(profile);
}

async function updateOwnProfile(req, res) {
  const profile = await userService.updateOwnProfile(req.user.id, req.body);
  return res.json(profile);
}

module.exports = {
  getOwnProfile,
  searchUsers,
  getProfile,
  updateOwnProfile,
};
