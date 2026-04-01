const rankingService = require('../services/rankingService');

const getRankings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || '';
    
    const data = await rankingService.getRankings(page, search);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tải bảng xếp hạng' });
  }
};

module.exports = { getRankings };
