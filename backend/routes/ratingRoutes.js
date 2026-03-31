const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const ratingController = require('../controllers/ratingController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/:slug/ratings', asyncHandler(ratingController.listRatings));
router.post('/:slug/ratings', requireAuth, asyncHandler(ratingController.upsertRating));

module.exports = router;
