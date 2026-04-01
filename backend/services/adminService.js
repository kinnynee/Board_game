const db = require('../db');
const { serializeUser, serializeGame } = require('../utils/serializers');

async function getDashboardStats() {
  const [userCount, gameCount, scoreCount] = await Promise.all([
    db('users').count('* as count').first(),
    db('games').count('* as count').first(),
    db('game_scores').count('* as count').first(),
  ]);

  return {
    total_users: Number(userCount?.count || 0),
    total_games: Number(gameCount?.count || 0),
    total_scores: Number(scoreCount?.count || 0),
  };
}

async function listAllUsers() {
  const users = await db('users')
    .select('id', 'username', 'email', 'display_name', 'role', 'is_active', 'created_at')
    .orderBy('created_at', 'desc');

  return users.map((user) => serializeUser(user, { includeEmail: true, includeStatus: true }));
}

async function updateUser(id, data) {
  const updateData = {};
  if (data.role) updateData.role = data.role;
  if (data.is_active !== undefined) updateData.is_active = !!data.is_active;
  updateData.updated_at = db.fn.now();

  const [user] = await db('users')
    .where({ id })
    .update(updateData)
    .returning(['id', 'username', 'email', 'display_name', 'role', 'is_active']);

  return serializeUser(user, { includeEmail: true, includeStatus: true });
}

async function listAllGames() {
  const games = await db('games')
    .select('*')
    .orderBy('name', 'asc');

  return games.map((game) => serializeGame(game));
}

async function updateGame(id, data) {
  const updateData = {
    name: data.name,
    description: data.description,
    min_players: data.min_players,
    max_players: data.max_players,
    difficulty: data.difficulty,
    image_url: data.image_url,
    updated_at: db.fn.now(),
  };

  const [game] = await db('games')
    .where({ id })
    .update(updateData)
    .returning('*');

  return serializeGame(game);
}

module.exports = {
  getDashboardStats,
  listAllUsers,
  updateUser,
  listAllGames,
  updateGame,
};
