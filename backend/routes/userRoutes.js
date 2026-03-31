<<<<<<< HEAD
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
=======
const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);
router.get("/me", userController.getOwnProfile);
router.patch("/me", userController.updateOwnProfile);
router.get("/me/scores", userController.getMyScores);
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102

module.exports = router;
