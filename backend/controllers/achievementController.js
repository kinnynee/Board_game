const db = require('../db');

const getAllAchievements = async (req, res) => {
  const achievements = await db('achievements').select('*').orderBy('id', 'asc');
  res.json({ success: true, data: achievements });
};

module.exports = { getAllAchievements };
