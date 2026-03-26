const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const gameController = require('../controllers/gameController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', asyncHandler(gameController.listGames));
router.get('/scores/me', requireAuth, asyncHandler(gameController.getMyScores));
router.get('/:slug', asyncHandler(gameController.getGameDetail));
router.get('/:slug/saves/me', requireAuth, asyncHandler(gameController.getMySaves));
router.post('/:slug/saves', requireAuth, asyncHandler(gameController.saveGame));
router.post('/:slug/scores', requireAuth, asyncHandler(gameController.recordScore));

module.exports = router;
