const gameService = require('../services/gameService');

exports.getAllGames = async (req, res) => {
  try {
    const games = await gameService.getAllGames();
    res.json(games);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getGameBySlug = async (req, res) => {
  try {
    const game = await gameService.getGameBySlug(req.params.slug);
    if (!game) return res.status(404).json({ message: 'Không tìm thấy game' });
    res.json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
