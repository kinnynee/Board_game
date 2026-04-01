const db = require('../db');
const createHttpError = require('../utils/httpError');

async function findGameBySlug(slug) {
  if (!slug) {
    throw createHttpError(400, 'Game slug is required.');
  }

  return db('games').where({ slug }).first();
}

async function listRatings(slug) {
  const game = await findGameBySlug(slug);

  if (!game) {
    throw createHttpError(404, 'Game not found.');
  }

  return db('ratings')
    .join('users', 'ratings.user_id', 'users.id')
    .where({ game_slug: game.slug })
    .select(
      'ratings.id',
      'ratings.rating',
      'ratings.comment',
      'ratings.created_at',
      'ratings.updated_at',
      'users.username',
      'users.display_name',
    )
    .orderBy('ratings.updated_at', 'desc');
}

function normalizeRatingInput(body = {}) {
  return {
    rating: Number(body.rating),
    comment: String(body.comment || '').trim(),
  };
}

async function upsertRating(userId, slug, body) {
  const game = await findGameBySlug(slug);

  if (!game) {
    throw createHttpError(404, 'Game not found.');
  }

  const payload = normalizeRatingInput(body);

  if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) {
    throw createHttpError(400, 'rating must be an integer from 1 to 5.');
  }

  if (payload.comment.length > 500) {
    throw createHttpError(400, 'comment must be 500 characters or fewer.');
  }

  const [savedRating] = await db('ratings')
    .insert({
      user_id: userId,
      game_slug: game.slug,
      rating: payload.rating,
      comment: payload.comment,
    })
    .onConflict(['user_id', 'game_slug'])
    .merge({
      rating: payload.rating,
      comment: payload.comment,
      updated_at: db.fn.now(),
    })
    .returning('*');

  return savedRating;
}


// ThÃªm Aggregate tÃ­nh Ä‘iá»ƒm trung bÃ¬nh (SQL Engine)
const getRatingStats = async (game_slug) => {
  const result = await db('ratings')
    .where({ game_slug })
    .select(
      db.raw('COUNT(*) as total_reviews'),
      db.raw('ROUND(AVG(rating)::numeric, 1) as average_score')
    )
    .first();
  return result;
};

module.exports = {
  getRatingStats,
  listRatings,
  upsertRating,
}

