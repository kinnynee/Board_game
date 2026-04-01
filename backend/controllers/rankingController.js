const rankingService = require('../services/rankingService');

const getRankings = async (req, res) => {
  try {
    const data = await rankingService.getRankings();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tải bảng xếp hạng' });
  }
};

module.exports = { getRankings };
