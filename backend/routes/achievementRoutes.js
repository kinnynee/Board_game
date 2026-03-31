const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');

// GET /api/achievements - Lấy danh sách thành tựu
router.get('/', achievementController.getAllAchievements);

module.exports = router;
