const db = require('../db');
const { serializeUser } = require('../utils/serializers');
const createHttpError = require('../utils/httpError');
const {
  normalizeProfileBody,
  parsePositiveInt,
  validateProfileInput,
} = require('../utils/validation');

const baseUserColumns = [
  'id',
  'username',
  'email',
  'display_name',
  'bio',
  'role',
  'is_active',
  'created_at',
  'updated_at',
];

async function findUserById(id) {
  return db('users').where({ id }).first();
}

async function findActiveUserById(id) {
  return db('users').where({ id, is_active: true }).first();
}

async function findUserByIdentifier(identifier) {
  const normalizedIdentifier = String(identifier || '').trim().toLowerCase();

  if (!normalizedIdentifier) {
    return null;
  }

  return db('users')
    .whereRaw('LOWER(username) = ?', [normalizedIdentifier])
    .orWhereRaw('LOWER(email) = ?', [normalizedIdentifier])
    .first();
}

async function findExistingRegisterUser(username, email) {
  return db('users')
    .whereRaw('LOWER(username) = ?', [String(username || '').trim().toLowerCase()])
    .orWhereRaw('LOWER(email) = ?', [String(email || '').trim().toLowerCase()])
    .first();
}

async function findEmailOwner(email, excludedUserId) {
  return db('users')
    .whereRaw('LOWER(email) = ?', [String(email || '').trim().toLowerCase()])
    .andWhereNot({ id: excludedUserId })
    .first();
}

async function createUser(payload) {
  const [user] = await db('users')
    .insert(payload)
    .returning(baseUserColumns);

  return user;
}

async function buildUserStats(userId) {
  const [scoreStats, ratingStats] = await Promise.all([
    db('game_scores')
      .where({ user_id: userId })
      .count('* as total_games')
      .avg('score as average_score')
      .first(),
    db('ratings')
      .where({ user_id: userId })
      .count('* as ratings_given')
      .first(),
  ]);

  return {
    total_games: Number(scoreStats?.total_games || 0),
    average_score: scoreStats?.average_score !== null && scoreStats?.average_score !== undefined
      ? Number(scoreStats.average_score)
      : 0,
    ratings_given: Number(ratingStats?.ratings_given || 0),
  };
}

async function getOwnProfile(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw createHttpError(404, 'User not found.');
  }

  const stats = await buildUserStats(userId);

  return {
    ...serializeUser(user, { includeEmail: true, includeStatus: true }),
    stats,
  };
}

async function searchUsers(params = {}) {
  const search = String(params.search || '').trim().toLowerCase();
  const limit = Math.min(parsePositiveInt(params.limit, 20), 50);

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
  return users.map((user) => serializeUser(user));
}

async function getProfileForViewer(userId, viewer) {
  const normalizedUserId = Number(userId);

  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    throw createHttpError(400, 'User id is not valid.');
  }

  const user = await findUserById(normalizedUserId);

  if (!user) {
    throw createHttpError(404, 'User not found.');
  }

  const stats = await buildUserStats(user.id);
  const includeEmail = viewer.id === user.id || viewer.role === 'admin';

  return {
    ...serializeUser(user, { includeEmail, includeStatus: viewer.role === 'admin' }),
    stats,
  };
}

async function updateOwnProfile(userId, body) {
  const input = normalizeProfileBody(body);
  const errors = validateProfileInput(input);

  if (errors.length) {
    throw createHttpError(400, errors[0], { errors });
  }

  const emailOwner = await findEmailOwner(input.email, userId);

  if (emailOwner) {
    throw createHttpError(409, 'Email is already being used by another account.');
  }

  const [updatedUser] = await db('users')
    .where({ id: userId })
    .update({
      display_name: input.display_name,
      email: input.email,
      bio: input.bio,
      updated_at: db.fn.now(),
    })
    .returning(baseUserColumns);

  const stats = await buildUserStats(updatedUser.id);

  return {
    ...serializeUser(updatedUser, { includeEmail: true, includeStatus: true }),
    stats,
  };
}

module.exports = {
  findUserById,
  findActiveUserById,
  findUserByIdentifier,
  findExistingRegisterUser,
  createUser,
  getOwnProfile,
  searchUsers,
  getProfileForViewer,
  updateOwnProfile,
};
