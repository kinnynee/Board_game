const ratingService = require('../services/ratingService');

exports.addRating = async (req, res) => {
  try {
    const { gameSlug, rating, comment } = req.body;
    const userId = req.user ? req.user.id : 2; 

    await ratingService.addRating({ userId, gameSlug, rating, comment });
    res.status(201).json({ message: 'Gửi đánh giá thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getRatings = async (req, res) => {
  try {
    const ratings = await ratingService.getRatingsByGame(req.params.slug);
    res.json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
