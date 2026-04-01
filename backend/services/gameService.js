const db = require('../db');
const createHttpError = require('../utils/httpError');
const { serializeGame } = require('../utils/serializers');
const { parsePositiveInt } = require('../utils/validation');

async function findGameBySlug(slug) {
  if (!slug) {
    throw createHttpError(400, 'Game slug is required.');
  }

  return db('games').where({ slug }).first();
}

async function listGames() {
  const [games, ratingRows] = await Promise.all([
    db('games').select('*').orderBy('name', 'asc'),
    db('ratings')
      .select('game_slug')
      .count('* as rating_count')
      .avg('rating as average_rating')
      .groupBy('game_slug'),
  ]);

  const ratingMap = ratingRows.reduce((acc, row) => {
    acc[row.game_slug] = {
      rating_count: Number(row.rating_count || 0),
      average_rating: row.average_rating !== null ? Number(row.average_rating) : null,
    };
    return acc;
  }, {});

  return games.map((game) => serializeGame({
    ...game,
    ...(ratingMap[game.slug] || {}),
  }));
}

async function getGameDetail(slug) {
  const game = await findGameBySlug(slug);

  if (!game) {
    throw createHttpError(404, 'Game not found.');
  }

  const [ratingStats, topScores, recentRatings] = await Promise.all([
    db('ratings')
      .where({ game_slug: game.slug })
      .count('* as rating_count')
      .avg('rating as average_rating')
      .first(),
    db('game_scores')
      .join('users', 'game_scores.user_id', 'users.id')
      .where({ game_slug: game.slug })
      .select(
        'game_scores.id',
        'game_scores.score',
        'game_scores.result',
        'game_scores.duration as duration_seconds',
        'game_scores.created_at',
        'users.username',
        'users.display_name',
      )
      .orderBy('game_scores.score', 'desc')
      .orderBy('game_scores.created_at', 'desc')
      .limit(10),
    db('ratings')
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
      .orderBy('ratings.updated_at', 'desc')
      .limit(10),
  ]);

  return {
    ...serializeGame({
      ...game,
      rating_count: Number(ratingStats?.rating_count || 0),
      average_rating: ratingStats?.average_rating !== null && ratingStats?.average_rating !== undefined
        ? Number(ratingStats.average_rating)
        : null,
    }),
    top_scores: topScores,
    recent_ratings: recentRatings,
  };
}

async function getMyScores(userId, query = {}) {
  const limit = Math.min(parsePositiveInt(query.limit, 20), 100);

  return db('game_scores')
    .join('games', 'game_scores.game_slug', 'games.slug')
    .where('game_scores.user_id', userId)
    .select(
      'game_scores.id',
      'game_scores.score',
      'game_scores.result',
      'game_scores.duration as duration_seconds',
      db.raw('NULL as metadata_json'),
      'game_scores.created_at',
      'games.slug as game_slug',
      'games.name as game_name',
    )
    .orderBy('game_scores.created_at', 'desc')
    .limit(limit);
}

async function getMySaves(userId, slug) {
  const game = await findGameBySlug(slug);

  if (!game) {
    throw createHttpError(404, 'Game not found.');
  }

  return db('game_saves')
    .where({
      game_slug: game.slug,
      user_id: userId,
    })
    .select('*')
    .orderBy('updated_at', 'desc')
    .then((rows) => rows.map((row) => ({
      ...row,
      state_json: typeof row.state_json === 'string'
        ? JSON.parse(row.state_json)
        : row.state_json,
    })));
}

function normalizeSavePayload(body = {}) {
  return {
    save_name: String(body.save_name || '').trim(),
    state_json: body.state_json,
    score: Number(body.score || 0),
    duration_seconds: Number(body.duration_seconds || 0),
  };
}

async function saveGame(userId, slug, body) {
  const game = await findGameBySlug(slug);

  if (!game) {
    throw createHttpError(404, 'Game not found.');
  }

  const payload = normalizeSavePayload(body);

  if (!payload.save_name) {
    throw createHttpError(400, 'save_name is required.');
  }

  if (!payload.state_json || typeof payload.state_json !== 'object') {
    throw createHttpError(400, 'state_json must be an object.');
  }

  const [saved] = await db('game_saves')
    .insert({
      user_id: userId,
      game_slug: game.slug,
      save_name: payload.save_name,
      state_json: JSON.stringify(payload.state_json),
      score: payload.score,
    })
    .returning('*');

  return {
    ...saved,
    state_json: typeof saved.state_json === 'string'
      ? JSON.parse(saved.state_json)
      : saved.state_json,
  };
}

function normalizeScorePayload(body = {}) {
  return {
    score: Number(body.score),
    result: String(body.result || 'completed').trim(),
    duration_seconds: Number(body.duration_seconds || 0),
    metadata_json: body.metadata_json && typeof body.metadata_json === 'object'
      ? body.metadata_json
      : {},
  };
}

async function recordScore(userId, slug, body) {
  const game = await findGameBySlug(slug);

  if (!game) {
    throw createHttpError(404, 'Game not found.');
  }

  const payload = normalizeScorePayload(body);

  if (!Number.isFinite(payload.score)) {
    throw createHttpError(400, 'score must be a number.');
  }

  const [createdScore] = await db('game_scores')
    .insert({
      user_id: userId,
      game_slug: game.slug,
      score: payload.score,
      result: payload.result,
      duration: payload.duration_seconds,
    })
    .returning('*');

  return createdScore;
}

module.exports = {
  findGameBySlug,
  listGames,
  getGameDetail,
  getMyScores,
  getMySaves,
  saveGame,
  recordScore,
}

