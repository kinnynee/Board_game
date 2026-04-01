const gameService = require('../services/gameService');

async function listGames(req, res) {
  const games = await gameService.listGames();
  return res.json(games);
}

async function getGameDetail(req, res) {
  try {
    const gameDetail = await gameService.getGameDetail(req.params.slug);
    return res.status(200).json({ success: true, data: gameDetail });
  } catch (err) {
    return res.status(404).json({ success: false, message: err.message });
  }
}

async function getMyScores(req, res) {
  const scores = await gameService.getMyScores(req.user.id, req.query);
  return res.json(scores);
}

async function getMySaves(req, res) {
  const saves = await gameService.getMySaves(req.user.id, req.params.slug);
  return res.json(saves);
}

async function saveGame(req, res) {
  const save = await gameService.saveGame(req.user.id, req.params.slug, req.body);
  return res.status(201).json(save);
}

async function recordScore(req, res) {
  const createdScore = await gameService.recordScore(req.user.id, req.params.slug, req.body);
  return res.status(201).json(createdScore);
}

module.exports = {
  listGames,
  getGameDetail,
  getMyScores,
  getMySaves,
  saveGame,
  recordScore,
}\n