// Lần 1: Trả về dữ liệu tĩnh (fake data) để kiểm tra kết nối route
const getRankings = (req, res) => {
  const rankings = [
    { rank: 1, username: 'ProGamer_VN', score: 4850, wins: 48, losses: 5 },
    { rank: 2, username: 'ChessKing99', score: 4200, wins: 42, losses: 10 },
    { rank: 3, username: 'BoardMaster', score: 3900, wins: 39, losses: 12 },
    { rank: 4, username: 'LuckyStreak', score: 3400, wins: 34, losses: 18 },
    { rank: 5, username: 'QuietStorm', score: 3100, wins: 31, losses: 20 },
    { rank: 6, username: 'ThunderBolt', score: 2800, wins: 28, losses: 22 },
    { rank: 7, username: 'Strategist01', score: 2500, wins: 25, losses: 25 },
    { rank: 8, username: 'NightOwl_VN', score: 2200, wins: 22, losses: 28 },
    { rank: 9, username: 'Rookie123', score: 1900, wins: 19, losses: 31 },
    { rank: 10, username: 'NewPlayer007', score: 1500, wins: 15, losses: 35 },
  ];

  res.json({ success: true, data: rankings });
};

module.exports = { getRankings };
