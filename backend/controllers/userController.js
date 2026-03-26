const db = require('../db');
const { serializeUser } = require('../utils/serializers');
const {
  normalizeProfileBody,
  parsePositiveInt,
  validateProfileInput,
} = require('../utils/validation');

async function buildUserStats(userId) {
  const scoreStats = await db('game_scores')
    .where({ user_id: userId })
    .count('* as total_games')
    .avg('score as average_score')
    .first();

  const ratingStats = await db('ratings')
    .where({ user_id: userId })
    .count('* as ratings_given')
    .first();

  return {
    total_games: Number(scoreStats?.total_games || 0),
    average_score: scoreStats?.average_score !== null && scoreStats?.average_score !== undefined
      ? Number(scoreStats.average_score)
      : 0,
    ratings_given: Number(ratingStats?.ratings_given || 0),
  };
}

async function getOwnProfile(req, res) {
  const stats = await buildUserStats(req.user.id);

  return res.json({
    ...serializeUser(req.user, { includeEmail: true, includeStatus: true }),
    stats,
  });
}

async function searchUsers(req, res) {
  const search = String(req.query.search || '').trim().toLowerCase();
  const limit = Math.min(parsePositiveInt(req.query.limit, 20), 50);

  let query = db('users')
    .select('id', 'username', 'display_name', 'bio', 'role', 'created_at', 'updated_at')
    .where({ is_active: true })
    .orderBy('display_name', 'asc')
    .limit(limit);

  if (search) {
    query = query.andWhere((builder) => {
      builder
        .whereRaw('LOWER(username) LIKE ?', [`%${search}%`])
        .orWhereRaw('LOWER(display_name) LIKE ?', [`%${search}%`]);
    });
  }

  const users = await query;
  return res.json(users.map((user) => serializeUser(user)));
}

async function getProfile(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'User id is not valid.' });
  }

  const user = await db('users').where({ id }).first();

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const stats = await buildUserStats(user.id);
  const includeEmail = req.user.id === user.id || req.user.role === 'admin';

  return res.json({
    ...serializeUser(user, { includeEmail, includeStatus: req.user.role === 'admin' }),
    stats,
  });
}

async function updateOwnProfile(req, res) {
  const input = normalizeProfileBody(req.body);
  const errors = validateProfileInput(input);

  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }

  const emailOwner = await db('users')
    .whereRaw('LOWER(email) = ?', [input.email])
    .andWhereNot({ id: req.user.id })
    .first();

  if (emailOwner) {
    return res.status(409).json({ message: 'Email is already being used by another account.' });
  }

  const [updatedUser] = await db('users')
    .where({ id: req.user.id })
    .update({
      display_name: input.display_name,
      email: input.email,
      bio: input.bio,
      updated_at: db.fn.now(),
    })
    .returning([
      'id',
      'username',
      'email',
      'display_name',
      'bio',
      'role',
      'is_active',
      'created_at',
      'updated_at',
    ]);

  const stats = await buildUserStats(updatedUser.id);

  return res.json({
    ...serializeUser(updatedUser, { includeEmail: true, includeStatus: true }),
    stats,
  });
}

module.exports = {
  getOwnProfile,
  searchUsers,
  getProfile,
  updateOwnProfile,
};
