const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const adminController = require('../controllers/adminController');
const { requireAdmin, requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get('/stats', asyncHandler(adminController.getDashboardStats));
router.get('/users', asyncHandler(adminController.listUsers));
router.patch('/users/:id', asyncHandler(adminController.updateUser));
router.get('/games', asyncHandler(adminController.listGames));
router.patch('/games/:id', asyncHandler(adminController.updateGame));

module.exports = router;
