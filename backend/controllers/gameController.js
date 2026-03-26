const db = require('../db');
const { serializeGame } = require('../utils/serializers');
const { parsePositiveInt } = require('../utils/validation');

async function getGameBySlugOrFail(slug) {
  return db('games').where({ slug }).first();
}

async function buildRatingStats() {
  const rows = await db('ratings')
    .select('game_id')
    .count('* as rating_count')
    .avg('rating as average_rating')
    .groupBy('game_id');

  return rows.reduce((accumulator, row) => {
    accumulator[row.game_id] = {
      rating_count: Number(row.rating_count || 0),
      average_rating: row.average_rating !== null ? Number(row.average_rating) : null,
    };
    return accumulator;
  }, {});
}

async function listGames(req, res) {
  const games = await db('games').select('*').orderBy('name', 'asc');
  const ratingStats = await buildRatingStats();

  return res.json(games.map((game) => serializeGame({
    ...game,
    ...(ratingStats[game.id] || {}),
  })));
}

async function getGameDetail(req, res) {
  const game = await getGameBySlugOrFail(req.params.slug);

  if (!game) {
    return res.status(404).json({ message: 'Game not found.' });
  }

  const [ratingStats, topScores, recentRatings] = await Promise.all([
    db('ratings')
      .where({ game_id: game.id })
      .count('* as rating_count')
      .avg('rating as average_rating')
      .first(),
    db('game_scores')
      .join('users', 'game_scores.user_id', 'users.id')
      .where({ game_id: game.id })
      .select(
        'game_scores.id',
        'game_scores.score',
        'game_scores.result',
        'game_scores.duration_seconds',
        'game_scores.created_at',
        'users.username',
        'users.display_name',
      )
      .orderBy('game_scores.score', 'desc')
      .orderBy('game_scores.created_at', 'desc')
      .limit(10),
    db('ratings')
      .join('users', 'ratings.user_id', 'users.id')
      .where({ game_id: game.id })
      .select(
        'ratings.id',
        'ratings.rating',
        'ratings.comment',
        'ratings.created_at',
        'users.username',
        'users.display_name',
      )
      .orderBy('ratings.updated_at', 'desc')
      .limit(10),
  ]);

  return res.json({
    ...serializeGame({
      ...game,
      rating_count: Number(ratingStats?.rating_count || 0),
      average_rating: ratingStats?.average_rating !== null && ratingStats?.average_rating !== undefined
        ? Number(ratingStats.average_rating)
        : null,
    }),
    top_scores: topScores,
    recent_ratings: recentRatings,
  });
}

async function getMyScores(req, res) {
  const limit = Math.min(parsePositiveInt(req.query.limit, 20), 100);

  const scores = await db('game_scores')
    .join('games', 'game_scores.game_id', 'games.id')
    .where('game_scores.user_id', req.user.id)
    .select(
      'game_scores.id',
      'game_scores.score',
      'game_scores.result',
      'game_scores.duration_seconds',
      'game_scores.metadata_json',
      'game_scores.created_at',
      'games.slug as game_slug',
      'games.name as game_name',
    )
    .orderBy('game_scores.created_at', 'desc')
    .limit(limit);

  return res.json(scores);
}

async function getMySaves(req, res) {
  const game = await getGameBySlugOrFail(req.params.slug);

  if (!game) {
    return res.status(404).json({ message: 'Game not found.' });
  }

  const saves = await db('game_saves')
    .where({
      game_id: game.id,
      user_id: req.user.id,
    })
    .select('*')
    .orderBy('updated_at', 'desc');

  return res.json(saves);
}

async function saveGame(req, res) {
  const game = await getGameBySlugOrFail(req.params.slug);

  if (!game) {
    return res.status(404).json({ message: 'Game not found.' });
  }

  const save_name = String(req.body?.save_name || '').trim();
  const state_json = req.body?.state_json;
  const score = Number(req.body?.score || 0);
  const duration_seconds = Number(req.body?.duration_seconds || 0);

  if (!save_name) {
    return res.status(400).json({ message: 'save_name is required.' });
  }

  if (!state_json || typeof state_json !== 'object') {
    return res.status(400).json({ message: 'state_json must be an object.' });
  }

  const [save] = await db('game_saves')
    .insert({
      user_id: req.user.id,
      game_id: game.id,
      save_name,
      state_json,
      score,
      duration_seconds,
    })
    .returning('*');

  return res.status(201).json(save);
}

async function recordScore(req, res) {
  const game = await getGameBySlugOrFail(req.params.slug);

  if (!game) {
    return res.status(404).json({ message: 'Game not found.' });
  }

  const score = Number(req.body?.score);
  const result = String(req.body?.result || 'completed').trim();
  const duration_seconds = Number(req.body?.duration_seconds || 0);
  const metadata_json = req.body?.metadata_json && typeof req.body.metadata_json === 'object'
    ? req.body.metadata_json
    : {};

  if (!Number.isFinite(score)) {
    return res.status(400).json({ message: 'score must be a number.' });
  }

  const [createdScore] = await db('game_scores')
    .insert({
      user_id: req.user.id,
      game_id: game.id,
      score,
      result,
      duration_seconds,
      metadata_json,
    })
    .returning('*');

  return res.status(201).json(createdScore);
}

module.exports = {
  listGames,
  getGameDetail,
  getMyScores,
  getMySaves,
  saveGame,
  recordScore,
};
