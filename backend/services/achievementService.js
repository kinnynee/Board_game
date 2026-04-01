const db = require('../db');

const getAllAchievements = async () => {
  return await db('achievements').select('*').orderBy('id', 'asc');
};

module.exports = { getAllAchievements };
