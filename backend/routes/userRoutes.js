const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/me', asyncHandler(userController.getOwnProfile));
router.put('/me', asyncHandler(userController.updateOwnProfile));
router.get('/search', asyncHandler(userController.searchUsers));
router.get('/:id', asyncHandler(userController.getProfile));

module.exports = router;
