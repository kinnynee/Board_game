const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');

// GET /api/rankings - Lấy bảng xếp hạng
router.get('/', rankingController.getRankings);

module.exports = router;
