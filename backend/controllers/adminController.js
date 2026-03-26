const db = require('../db');
const { serializeGame, serializeUser } = require('../utils/serializers');
const { parsePositiveInt } = require('../utils/validation');

async function getDashboardStats(req, res) {
  const [userStats, gameStats, scoreStats, ratingStats] = await Promise.all([
    db('users')
      .count('* as total_users')
      .sum({ active_users: db.raw('CASE WHEN is_active THEN 1 ELSE 0 END') })
      .first(),
    db('games')
      .count('* as total_games')
      .sum({ enabled_games: db.raw('CASE WHEN is_enabled THEN 1 ELSE 0 END') })
      .first(),
    db('game_scores')
      .count('* as total_scores')
      .avg('score as average_score')
      .first(),
    db('ratings')
      .count('* as total_ratings')
      .avg('rating as average_rating')
      .first(),
  ]);

  return res.json({
    total_users: Number(userStats?.total_users || 0),
    active_users: Number(userStats?.active_users || 0),
    total_games: Number(gameStats?.total_games || 0),
    enabled_games: Number(gameStats?.enabled_games || 0),
    total_scores: Number(scoreStats?.total_scores || 0),
    average_score: scoreStats?.average_score !== null && scoreStats?.average_score !== undefined
      ? Number(scoreStats.average_score)
      : 0,
    total_ratings: Number(ratingStats?.total_ratings || 0),
    average_rating: ratingStats?.average_rating !== null && ratingStats?.average_rating !== undefined
      ? Number(ratingStats.average_rating)
      : 0,
  });
}

async function listUsers(req, res) {
  const search = String(req.query.search || '').trim().toLowerCase();
  const limit = Math.min(parsePositiveInt(req.query.limit, 30), 100);

  let query = db('users')
    .select('*')
    .orderBy('created_at', 'desc')
    .limit(limit);

  if (search) {
    query = query.where((builder) => {
      builder
        .whereRaw('LOWER(username) LIKE ?', [`%${search}%`])
        .orWhereRaw('LOWER(display_name) LIKE ?', [`%${search}%`])
        .orWhereRaw('LOWER(email) LIKE ?', [`%${search}%`]);
    });
  }

  const users = await query;
  return res.json(users.map((user) => serializeUser(user, { includeEmail: true, includeStatus: true })));
}

async function updateUser(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'User id is not valid.' });
  }

  const existingUser = await db('users').where({ id }).first();

  if (!existingUser) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const payload = {};

  if (req.body.display_name !== undefined) {
    payload.display_name = String(req.body.display_name || '').trim();
  }

  if (req.body.bio !== undefined) {
    payload.bio = String(req.body.bio || '').trim();
  }

  if (req.body.role !== undefined) {
    const role = String(req.body.role || '').trim();
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'role must be user or admin.' });
    }
    payload.role = role;
  }

  if (req.body.is_active !== undefined) {
    payload.is_active = Boolean(req.body.is_active);
  }

  if (!Object.keys(payload).length) {
    return res.status(400).json({ message: 'No valid fields were provided.' });
  }

  payload.updated_at = db.fn.now();

  const [updatedUser] = await db('users')
    .where({ id })
    .update(payload)
    .returning('*');

  return res.json(serializeUser(updatedUser, { includeEmail: true, includeStatus: true }));
}

async function listGames(req, res) {
  const games = await db('games').select('*').orderBy('name', 'asc');
  return res.json(games.map((game) => serializeGame(game)));
}

async function updateGame(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'Game id is not valid.' });
  }

  const existingGame = await db('games').where({ id }).first();

  if (!existingGame) {
    return res.status(404).json({ message: 'Game not found.' });
  }

  const payload = {};

  if (req.body.name !== undefined) {
    payload.name = String(req.body.name || '').trim();
  }

  if (req.body.description !== undefined) {
    payload.description = String(req.body.description || '').trim();
  }

  if (req.body.board_size !== undefined) {
    payload.board_size = String(req.body.board_size || '').trim();
  }

  if (req.body.is_enabled !== undefined) {
    payload.is_enabled = Boolean(req.body.is_enabled);
  }

  if (!Object.keys(payload).length) {
    return res.status(400).json({ message: 'No valid fields were provided.' });
  }

  payload.updated_at = db.fn.now();

  const [updatedGame] = await db('games')
    .where({ id })
    .update(payload)
    .returning('*');

  return res.json(serializeGame(updatedGame));
}

module.exports = {
  getDashboardStats,
  listUsers,
  updateUser,
  listGames,
  updateGame,
};
