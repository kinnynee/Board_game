const achievementService = require('../services/achievementService');

const getAllAchievements = async (req, res) => {
  try {
    const achievements = await achievementService.getAllAchievements();
    res.json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tải danh sách thành tựu' });
  }
};

module.exports = { getAllAchievements };
