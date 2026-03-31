<<<<<<< HEAD
const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.get('/me', requireAuth, asyncHandler(authController.getMe));
=======
const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getCurrentUser);
>>>>>>> 06170f5a5e6b6979cccd2b4ff1fd1ea4a02eb102

module.exports = router;
