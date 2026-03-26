const db = require('../db');

async function getGameBySlugOrFail(slug) {
  return db('games').where({ slug }).first();
}

async function listRatings(req, res) {
  const game = await getGameBySlugOrFail(req.params.slug);

  if (!game) {
    return res.status(404).json({ message: 'Game not found.' });
  }

  const ratings = await db('ratings')
    .join('users', 'ratings.user_id', 'users.id')
    .where({ game_id: game.id })
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

  return res.json(ratings);
}

async function upsertRating(req, res) {
  const game = await getGameBySlugOrFail(req.params.slug);

  if (!game) {
    return res.status(404).json({ message: 'Game not found.' });
  }

  const rating = Number(req.body?.rating);
  const comment = String(req.body?.comment || '').trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'rating must be an integer from 1 to 5.' });
  }

  if (comment.length > 500) {
    return res.status(400).json({ message: 'comment must be 500 characters or fewer.' });
  }

  const [savedRating] = await db('ratings')
    .insert({
      user_id: req.user.id,
      game_id: game.id,
      rating,
      comment,
    })
    .onConflict(['user_id', 'game_id'])
    .merge({
      rating,
      comment,
      updated_at: db.fn.now(),
    })
    .returning('*');

  return res.status(201).json(savedRating);
}

module.exports = {
  listRatings,
  upsertRating,
};
