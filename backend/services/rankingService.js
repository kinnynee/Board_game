const db = require('../db');

const getRankings = async (page = 1, search = '') => {
  const limit = 10;
  const offset = (page - 1) * limit;

  let query = db('users').select('id', 'username', 'score', 'wins', 'losses');
  let countQuery = db('users').count('id as total');

  if (search) {
    query = query.where('username', 'like', `%${search}%`);
    countQuery = countQuery.where('username', 'like', `%${search}%`);
  }

  const rows = await query.orderBy('score', 'desc').limit(limit).offset(offset);
  const [{ total }] = await countQuery;

  const data = rows.map((player, index) => ({
    rank: offset + index + 1,
    username: player.username,
    score: player.score,
    wins: player.wins,
    losses: player.losses,
  }));

  return {
    results: data,
    pagination: {
      total: parseInt(total, 10) || 0,
      page: parseInt(page, 10),
      totalPages: Math.ceil((parseInt(total, 10) || 0) / limit)
    }
  };
};

module.exports = { getRankings };
