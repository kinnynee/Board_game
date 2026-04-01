const db = require('../db');

const getRankings = async () => {
  const rows = await db('users')
    .select('id', 'username', 'score', 'wins', 'losses')
    .orderBy('score', 'desc')
    .limit(10);

  return rows.map((player, index) => ({
    rank: index + 1,
    username: player.username,
    score: player.score,
    wins: player.wins,
    losses: player.losses,
  }));
};

module.exports = { getRankings };
