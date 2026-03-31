const db = require('../db');

const getRankings = async (req, res) => {
  const rankings = await db('users')
    .select('id', 'username', 'score', 'wins', 'losses')
    .orderBy('score', 'desc')
    .limit(10);

  const data = rankings.map((player, index) => ({
    rank: index + 1,
    username: player.username,
    score: player.score,
    wins: player.wins,
    losses: player.losses,
  }));

  res.json({ success: true, data });
};

module.exports = { getRankings };
